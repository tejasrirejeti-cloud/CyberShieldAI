-- CyberShield AI Phase 3: security hardening, auditability and user controls.
-- Run after 001_create_profiles.sql and 002_security_data.sql.

create table if not exists public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('scan_recorded','notification_read','threat_resolved','threat_dismissed','report_archived','settings_updated')),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_audit_log enable row level security;

drop policy if exists security_audit_select_own on public.security_audit_log;
create policy security_audit_select_own on public.security_audit_log
  for select using (auth.uid() = user_id);

create index if not exists security_audit_user_created_idx
  on public.security_audit_log(user_id, created_at desc);

-- Allow users to change only the state of their own threat/report records.
drop policy if exists threats_update_own on public.threats;
create policy threats_update_own on public.threats
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists reports_update_own on public.reports;
create policy reports_update_own on public.reports
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id and user_id = auth.uid();

  if found then
    insert into public.security_audit_log(user_id, action, entity_id)
    values (auth.uid(), 'notification_read', p_notification_id);
  end if;
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;

create or replace function public.update_threat_status(
  p_threat_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_status not in ('resolved','dismissed') then raise exception 'Invalid threat status'; end if;

  update public.threats
  set status = p_status
  where id = p_threat_id and user_id = auth.uid();

  if found then
    insert into public.security_audit_log(user_id, action, entity_id, metadata)
    values (
      auth.uid(),
      case when p_status = 'resolved' then 'threat_resolved' else 'threat_dismissed' end,
      p_threat_id,
      jsonb_build_object('status', p_status)
    );
  end if;
end;
$$;

grant execute on function public.update_threat_status(uuid, text) to authenticated;

create or replace function public.archive_security_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  update public.reports
  set status = 'archived'
  where id = p_report_id and user_id = auth.uid();

  if found then
    insert into public.security_audit_log(user_id, action, entity_id)
    values (auth.uid(), 'report_archived', p_report_id);
  end if;
end;
$$;

grant execute on function public.archive_security_report(uuid) to authenticated;

create or replace function public.update_security_settings(
  p_email_notifications boolean,
  p_threat_notifications boolean,
  p_reduced_motion boolean
)
returns public.user_settings
language plpgsql
security definer
set search_path = public
as $$
declare result public.user_settings;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  insert into public.user_settings(user_id, email_notifications, threat_notifications, reduced_motion, updated_at)
  values (auth.uid(), p_email_notifications, p_threat_notifications, p_reduced_motion, now())
  on conflict (user_id) do update set
    email_notifications = excluded.email_notifications,
    threat_notifications = excluded.threat_notifications,
    reduced_motion = excluded.reduced_motion,
    updated_at = now();

  select * into result from public.user_settings where user_id = auth.uid();

  insert into public.security_audit_log(user_id, action, metadata)
  values (
    auth.uid(),
    'settings_updated',
    jsonb_build_object(
      'email_notifications', p_email_notifications,
      'threat_notifications', p_threat_notifications,
      'reduced_motion', p_reduced_motion
    )
  );

  return result;
end;
$$;

grant execute on function public.update_security_settings(boolean, boolean, boolean) to authenticated;

-- Keep scan history bounded per user to reduce accidental abuse. This is a database-side limit,
-- not a client-side counter. Existing data is not removed.
create or replace function public.record_security_scan(
  p_scan_type text,
  p_status text,
  p_confidence integer,
  p_duration_ms integer,
  p_input_preview text,
  p_findings jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_scan_id uuid;
  v_finding jsonb;
  v_severity text;
  v_title text;
  v_summary text;
  v_recent_count integer;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_scan_type not in ('url','file','message') then raise exception 'Invalid scan type'; end if;
  if p_status not in ('safe','suspicious','dangerous') then raise exception 'Invalid scan status'; end if;

  select count(*) into v_recent_count
  from public.scans
  where user_id = v_user_id and created_at >= now() - interval '1 hour';

  if v_recent_count >= 60 then
    raise exception 'Hourly scan limit reached. Please try again later.' using errcode = 'P0001';
  end if;

  insert into public.scans(user_id, scan_type, status, confidence, duration_ms, input_preview)
  values (v_user_id, p_scan_type, p_status, greatest(0, least(100, p_confidence)), greatest(0, p_duration_ms), nullif(left(p_input_preview, 240), ''))
  returning id into v_scan_id;

  if jsonb_typeof(coalesce(p_findings, '[]'::jsonb)) = 'array' then
    for v_finding in select value from jsonb_array_elements(p_findings) loop
      v_severity := case when p_status = 'dangerous' then 'high' when p_status = 'suspicious' then 'medium' else 'low' end;
      v_title := coalesce(v_finding->>'title', 'Security indicator detected');
      insert into public.threats(user_id, scan_id, severity, title, details, source)
      values (v_user_id, v_scan_id, v_severity, left(v_title, 160), left(v_finding->>'details', 1000), 'local-analyzer');
    end loop;
  end if;

  v_summary := case p_status
    when 'dangerous' then 'A dangerous result was recorded by the local security analyzer.'
    when 'suspicious' then 'A suspicious result was recorded by the local security analyzer.'
    else 'The local analyzer found no matching indicators.'
  end;

  insert into public.reports(user_id, scan_id, title, summary)
  values (v_user_id, v_scan_id, 'Security scan report', v_summary);

  if p_status = 'dangerous' then
    insert into public.notifications(user_id, title, message, severity)
    values (v_user_id, 'Dangerous scan result', 'A dangerous result was recorded. Review the scan details.', 'critical');
  elsif p_status = 'suspicious' then
    insert into public.notifications(user_id, title, message, severity)
    values (v_user_id, 'Suspicious scan result', 'A suspicious result was recorded. Review the scan details.', 'warning');
  end if;

  insert into public.security_audit_log(user_id, action, entity_id, metadata)
  values (v_user_id, 'scan_recorded', v_scan_id, jsonb_build_object('scan_type', p_scan_type, 'status', p_status));

  return v_scan_id;
end;
$$;

grant execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) to authenticated;
