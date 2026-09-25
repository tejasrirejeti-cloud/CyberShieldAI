-- CyberShield AI Phase 2: persisted security activity
-- Run this migration in Supabase SQL Editor after 001_create_profiles.sql.

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null check (scan_type in ('url', 'file', 'message')),
  status text not null check (status in ('safe', 'suspicious', 'dangerous')),
  confidence integer not null check (confidence between 0 and 100),
  duration_ms integer not null check (duration_ms >= 0),
  input_preview text,   
  created_at timestamptz not null default now()
);

create table if not exists public.threats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete cascade,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  title text not null,
  details text,
  source text not null default 'local-analyzer',
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  title text not null,
  summary text not null,
  status text not null default 'generated' check (status in ('generated', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_notifications boolean not null default true,
  threat_notifications boolean not null default true,
  reduced_motion boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.scans enable row level security;
alter table public.threats enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists scans_select_own on public.scans;
drop policy if exists threats_select_own on public.threats;
drop policy if exists reports_select_own on public.reports;
drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists settings_select_own on public.user_settings;
drop policy if exists settings_insert_own on public.user_settings;
drop policy if exists settings_update_own on public.user_settings;

create policy scans_select_own on public.scans for select using (auth.uid() = user_id);
create policy threats_select_own on public.threats for select using (auth.uid() = user_id);
create policy reports_select_own on public.reports for select using (auth.uid() = user_id);
create policy notifications_select_own on public.notifications for select using (auth.uid() = user_id);
create policy notifications_update_own on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy settings_select_own on public.user_settings for select using (auth.uid() = user_id);
create policy settings_insert_own on public.user_settings for insert with check (auth.uid() = user_id);
create policy settings_update_own on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists scans_user_created_idx on public.scans(user_id, created_at desc);
create index if not exists threats_user_created_idx on public.threats(user_id, created_at desc);
create index if not exists threats_user_status_idx on public.threats(user_id, status);
create index if not exists reports_user_created_idx on public.reports(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

create or replace function public.ensure_user_settings()
returns public.user_settings
language plpgsql
security definer
set search_path = public
as $$
declare result public.user_settings;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.user_settings (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;
  select * into result from public.user_settings where user_id = auth.uid();
  return result;
end;
$$;

grant execute on function public.ensure_user_settings() to authenticated;

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
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_scan_type not in ('url','file','message') then raise exception 'Invalid scan type'; end if;
  if p_status not in ('safe','suspicious','dangerous') then raise exception 'Invalid scan status'; end if;

  insert into public.scans(user_id, scan_type, status, confidence, duration_ms, input_preview)
  values (v_user_id, p_scan_type, p_status, greatest(0, least(100, p_confidence)), greatest(0, p_duration_ms), nullif(left(p_input_preview, 240), ''))
  returning id into v_scan_id;

  if jsonb_typeof(coalesce(p_findings, '[]'::jsonb)) = 'array' then
    for v_finding in select value from jsonb_array_elements(p_findings) loop
      v_severity := case
        when p_status = 'dangerous' then 'high'
        when p_status = 'suspicious' then 'medium'
        else 'low'
      end;
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

  return v_scan_id;
end;
$$;

grant execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) to authenticated;
