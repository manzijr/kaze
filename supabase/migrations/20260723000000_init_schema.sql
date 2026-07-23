-- Kaze: initial schema (users, agencies, locations, listings, photos, inquiries)
-- and row-level security policies per the Phase 0 plan.

create extension if not exists postgis;

-- ---------------------------------------------------------------------------
-- users (profile row, 1:1 with auth.users)
-- ---------------------------------------------------------------------------
create type user_role as enum ('buyer', 'agent', 'owner', 'admin');

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'buyer',
  phone text not null,
  name text not null,
  agency_id uuid references public.agencies (id) on delete set null,
  created_at timestamptz not null default now()
);

-- security-definer helpers so RLS policies below don't recurse into `users`
create function public.current_user_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- locations (Rwanda administrative taxonomy: Province > District > Sector > Cell)
-- ---------------------------------------------------------------------------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  district text not null,
  sector text not null,
  cell text,
  unique (province, district, sector, cell)
);

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create type listing_type as enum ('sale', 'rent');
create type property_type as enum ('house', 'apartment', 'land', 'commercial', 'office');
create type listing_status as enum ('draft', 'pending_review', 'published', 'archived');
create type currency as enum ('RWF', 'USD');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  price numeric(14, 2) not null check (price >= 0),
  currency currency not null default 'RWF',
  listing_type listing_type not null,
  property_type property_type not null,
  bedrooms int check (bedrooms >= 0),
  bathrooms int check (bathrooms >= 0),
  size_sqm numeric(10, 2) check (size_sqm >= 0),
  location_id uuid not null references public.locations (id),
  geom geography(Point, 4326),
  status listing_status not null default 'draft',
  featured_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_geom_idx on public.listings using gist (geom);
create index listings_location_idx on public.listings (location_id);
create index listings_status_idx on public.listings (status);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create index listing_photos_listing_idx on public.listing_photos (listing_id);

-- ---------------------------------------------------------------------------
-- inquiries (public "contact agent" submissions)
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid references public.users (id) on delete set null,
  name text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index inquiries_listing_idx on public.inquiries (listing_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.agencies enable row level security;
alter table public.locations enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.inquiries enable row level security;

-- users: read/update own row; admins read all
create policy "users read own" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users update own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "users insert own" on public.users
  for insert with check (id = auth.uid());

-- agencies: public read; admin write
create policy "agencies public read" on public.agencies
  for select using (true);
create policy "agencies admin write" on public.agencies
  for insert with check (public.is_admin());
create policy "agencies admin update" on public.agencies
  for update using (public.is_admin());

-- locations: public read-only reference data (seeded via migration/service role)
create policy "locations public read" on public.locations
  for select using (true);

-- listings: public read of published; owners manage their own; admins manage all
create policy "listings public read published" on public.listings
  for select using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy "listings owner insert" on public.listings
  for insert with check (owner_id = auth.uid());
create policy "listings owner update" on public.listings
  for update using (owner_id = auth.uid() or public.is_admin());
create policy "listings owner delete" on public.listings
  for delete using (owner_id = auth.uid() or public.is_admin());

-- listing_photos: follow parent listing's visibility/ownership
create policy "listing_photos read" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and (l.status = 'published' or l.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "listing_photos owner write" on public.listing_photos
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "listing_photos owner delete" on public.listing_photos
  for delete using (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );

-- inquiries: anyone can submit; only the listing owner/admin can read
create policy "inquiries public insert" on public.inquiries
  for insert with check (true);
create policy "inquiries owner read" on public.inquiries
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = inquiries.listing_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );
