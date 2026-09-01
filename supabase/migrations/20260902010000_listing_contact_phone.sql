-- Scoped phone exposure for the "contact agent" flow: returns a phone
-- number only for the owner of a *published* listing, rather than adding
-- phone to the general-purpose public_profiles view (which would turn
-- into an open phone directory for every user, not just active listers).
create or replace function public.get_listing_contact_phone(p_listing_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select u.phone
  from public.listings l
  join public.users u on u.id = l.owner_id
  where l.id = p_listing_id and l.status = 'published';
$$;

grant execute on function public.get_listing_contact_phone(uuid) to anon, authenticated;
