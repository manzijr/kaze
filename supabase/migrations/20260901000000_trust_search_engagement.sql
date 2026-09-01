-- Phase 3: trust badges (manual verification), expanded search/filter fields,
-- listing lifecycle, favorites, reports, admin audit log.

create type verification_status as enum ('none', 'pending', 'verified', 'rejected');

alter type property_type add value 'room';

-- ---------------------------------------------------------------------------
-- listings: search/filter fields, lifecycle, lead metrics, title verification
-- ---------------------------------------------------------------------------
alter table public.listings
  add column furnished boolean,
  add column has_parking boolean not null default false,
  add column has_water_tank boolean not null default false,
  add column has_backup_power boolean not null default false,
  add column has_boys_quarters boolean not null default false,
  add column is_fenced boolean not null default false,
  add column has_garden boolean not null default false,
  add column has_fiber_internet boolean not null default false,
  add column road_access text check (road_access in ('paved', 'murram', 'footpath')),
  add column advance_months_required int check (advance_months_required >= 0),
  add column view_count int not null default 0,
  add column whatsapp_click_count int not null default 0,
  add column expires_at timestamptz,
  add column title_verification_status verification_status not null default 'none';

-- ---------------------------------------------------------------------------
-- users: agent/owner verification
-- ---------------------------------------------------------------------------
alter table public.users
  add column verification_status verification_status not null default 'none',
  add column id_document_url text,
  add column business_registration_url text,
  add column verification_notes text;

-- ---------------------------------------------------------------------------
-- listing_verifications: UPI + title document, kept OUT of the public
-- `listings` row on purpose (RLS is row-level, not column-level; a listing's
-- other columns are publicly readable once published, so verification
-- documents/UPI live in their own admin/owner-only table instead).
-- ---------------------------------------------------------------------------
create table public.listing_verifications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade unique,
  upi_number text,
  title_document_url text,
  status verification_status not null default 'pending',
  reviewed_by uuid references public.users (id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.listing_verifications enable row level security;

create policy "listing_verifications owner/admin read" on public.listing_verifications
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_verifications.listing_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing_verifications owner insert" on public.listing_verifications
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_verifications.listing_id and l.owner_id = auth.uid()
    )
  );

create policy "listing_verifications owner update" on public.listing_verifications
  for update using (
    exists (
      select 1 from public.listings l
      where l.id = listing_verifications.listing_id and l.owner_id = auth.uid()
    )
  );

create policy "listing_verifications admin update" on public.listing_verifications
  for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "favorites owner all" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- listing_reports (public "report this listing" -> admin queue)
-- ---------------------------------------------------------------------------
create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid references public.users (id) on delete set null,
  reason text not null,
  message text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.listing_reports enable row level security;

create policy "listing_reports public insert" on public.listing_reports
  for insert with check (true);
create policy "listing_reports admin read" on public.listing_reports
  for select using (public.is_admin());
create policy "listing_reports admin update" on public.listing_reports
  for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------------
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users (id),
  action text not null,
  target_type text not null,
  target_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy "admin_audit_log admin all" on public.admin_audit_log
  for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- public_profiles: safe public subset of `users` (name/role/agency/
-- verification only -- never phone, id docs, or business registration).
-- Owned by the migration role (not RLS-checked per invoker), so it can
-- expose these columns even though `users` itself is locked to self/admin.
-- ---------------------------------------------------------------------------
create view public.public_profiles as
  select id, name, role, agency_id, verification_status from public.users;

grant select on public.public_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- counters via security-definer functions (avoids a public UPDATE policy)
-- ---------------------------------------------------------------------------
create or replace function public.increment_listing_view(p_listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set view_count = view_count + 1
  where id = p_listing_id and status = 'published';
$$;

grant execute on function public.increment_listing_view(uuid) to anon, authenticated;

create or replace function public.increment_whatsapp_click(p_listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set whatsapp_click_count = whatsapp_click_count + 1
  where id = p_listing_id and status = 'published';
$$;

grant execute on function public.increment_whatsapp_click(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- storage: verification-docs (private -- unlike listing-photos)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

-- Object paths are `${user_id}/...` -- the first path segment is the owner.
create policy "verification docs owner insert" on storage.objects
  for insert with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification docs owner read" on storage.objects
  for select using (
    bucket_id = 'verification-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "verification docs owner update" on storage.objects
  for update using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
