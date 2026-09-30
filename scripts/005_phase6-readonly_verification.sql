-- CyberShieldAI Phase 6
-- READ-ONLY production verification
-- This script intentionally performs NO INSERT/UPDATE/DELETE/DDL operations.

select table_name,
  exists (select 1 from information_schema.tables t2 where t2.table_schema='public' and t2.table_name=t.table_name) as exists
from (values ('profiles'),('scans'),('threats'),('reports'),('notifications'),('security_audit_log')) as t(table_name);

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname='public'
and tablename in ('profiles','scans','threats','reports','notifications','security_audit_log')
order by tablename;

select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname='public'
and tablename in ('profiles','scans','threats','reports','notifications','security_audit_log')
order by tablename, policyname;

select n.nspname as schema_name, p.proname as function_name
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
and p.proname in ('record_security_scan','update_threat_status','mark_notification_read','archive_security_report')
order by p.proname;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname='public'
and tablename in ('scans','threats','reports','notifications','security_audit_log')
order by tablename, indexname;
