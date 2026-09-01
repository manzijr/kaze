-- Section 15.1 data capture: structured fields the future price-context/
-- valuation features will need. No valuation logic yet -- just collecting
-- the inputs from day one so they exist once that phase is built.

alter table public.listings
  add column plot_size_sqm numeric(10, 2) check (plot_size_sqm >= 0),
  add column floors int check (floors >= 0),
  add column year_built_range text check (year_built_range in ('under_5', '5_to_15', 'over_15')),
  add column finish_quality text check (finish_quality in ('basic', 'standard', 'high_end')),
  add column closed_status text check (closed_status in ('sold', 'rented', 'withdrawn')),
  add column achieved_price numeric(14, 2) check (achieved_price >= 0),
  add column closed_at timestamptz;
