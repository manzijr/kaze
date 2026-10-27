-- Newer Supabase projects no longer auto-grant table privileges to the API
-- roles, so PostgREST returns 42501 "permission denied" even where RLS
-- policies would allow access. Grant them explicitly. Safe because every
-- table in public has RLS enabled; policies still decide which rows are
-- visible or writable. Idempotent, so it is harmless on projects that
-- already have these grants (e.g. older dev projects).

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
-- Anonymous visitors submit inquiries and listing reports without an account.
grant insert on public.inquiries, public.listing_reports to anon;

grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
