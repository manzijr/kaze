-- Storage bucket for listing photos. Public bucket so published listings'
-- images are servable via public URL without signed-URL plumbing; write
-- access is still gated by RLS on storage.objects below.

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Object paths are `${listing_id}/${filename}` — the first path segment is
-- the listing id, checked against ownership the same way listing_photos rows are.
create policy "listing photos public read" on storage.objects
  for select using (bucket_id = 'listing-photos');

create policy "listing photos owner insert" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing photos owner update" on storage.objects
  for update using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing photos owner delete" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  );
