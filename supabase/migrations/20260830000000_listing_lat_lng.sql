-- Add plain lat/lng columns for simple, reliable read/write from the app
-- (PostgREST round-tripping of the `geom` geography column via WKT/GeoJSON
-- is fragile). A trigger keeps `geom` in sync from lat/lng so future
-- radius/proximity queries can still use PostGIS against `geom`.

alter table public.listings
  add column lat double precision,
  add column lng double precision;

create or replace function public.sync_listing_geom()
returns trigger
language plpgsql
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  else
    new.geom := null;
  end if;
  return new;
end;
$$;

create trigger listings_sync_geom
before insert or update of lat, lng on public.listings
for each row execute function public.sync_listing_geom();
