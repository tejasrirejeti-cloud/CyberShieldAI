-- CyberShield AI Phase 4: production database hardening.
-- Run AFTER 001_create_profiles.sql, 002_security_data.sql, and 003_security_hardening.sql.
-- This migration is intentionally additive and does not delete existing scan data.

-- SECURITY DEFINER RPCs are the write boundary. Do not allow the client roles to
-- directly mutate security records, which would bypass the audit functions.
revoke insert, update, delete on public.scans from anon, authenticated;
revoke insert, update, delete on public.threats from anon, authenticated;
revoke insert, update, delete on public.reports from anon, authenticated;
revoke insert, update, delete on public.notifications from anon, authenticated;
revoke insert, update, delete on public.user_settings from anon, authenticated;
revoke insert, update, delete on public.security_audit_log from anon, authenticated;

-- Remove default PUBLIC execution on security-definer functions.
revoke execute on function public.ensure_user_settings() from public;
revoke execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) from public;
revoke execute on function public.mark_notification_read(uuid) from public;
revoke execute on function public.update_threat_status(uuid, text) from public;
revoke execute on function public.archive_security_report(uuid) from public;
revoke execute on function public.update_security_settings(boolean, boolean, boolean) from public;

grant execute on function public.ensure_user_settings() to authenticated;
grant execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.update_threat_status(uuid, text) to authenticated;
grant execute on function public.archive_security_report(uuid) to authenticated;
grant execute on function public.update_security_settings(boolean, boolean, boolean) to authenticated;

-- Prevent unbounded client payloads from reaching the database function.
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
  if p_confidence is null or p_confidence < 0 or p_confidence > 100 then raise exception 'Invalid confidence'; end if;
  if p_duration_ms is null or p_duration_ms < 0 or p_duration_ms > 600000 then raise exception 'Invalid scan duration'; end if;
  if p_input_preview is not null and length(p_input_preview) > 240 then raise exception 'Input preview is too long'; end if;

  if jsonb_typeof(coalesce(p_findings, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid findings payload';
  end if;
  if jsonb_array_length(coalesce(p_findings, '[]'::jsonb)) > 25 then
    raise exception 'Too many findings';
  end if;

  insert into public.scans(user_id, scan_type, status, confidence, duration_ms, input_preview)
  values (v_user_id, p_scan_type, p_status, p_confidence, p_duration_ms, nullif(left(p_input_preview, 240), ''))
  returning id into v_scan_id;

  for v_finding in select value from jsonb_array_elements(p_findings) loop
    v_severity := case when p_status = 'dangerous' then 'high' when p_status = 'suspicious' then 'medium' else 'low' end;
    v_title := coalesce(nullif(trim(v_finding->>'title'), ''), 'Security indicator detected');
    insert into public.threats(user_id, scan_id, severity, title, details, source)
    values (v_user_id, v_scan_id, v_severity, left(v_title, 160), left(v_finding->>'details', 1000), 'local-analyzer');
  end loop;

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

revoke execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) from public;
grant execute on function public.record_security_scan(text, text, integer, integer, text, jsonb) to authenticated;

-- Keep read access user-scoped through the existing RLS policies.
-- No service-role key is required by the browser client.
