import { createClient } from "@/lib/supabase/server";
import { SearchFilters } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const filters = {
    listing_type: first(raw.listing_type),
    property_type: first(raw.property_type),
    province: first(raw.province),
    district: first(raw.district),
    sector: first(raw.sector),
    min_bedrooms: first(raw.min_bedrooms),
    min_price: first(raw.min_price),
    max_price: first(raw.max_price),
  };

  const supabase = await createClient();

  // Resolve location filters to a set of location ids first, rather than
  // filtering through the joined `locations` resource, to sidestep
  // PostgREST's embedded-filter (`!inner`) syntax entirely.
  let locationIds: string[] | null = null;
  if (filters.province || filters.district || filters.sector) {
    let locationQuery = supabase.from("locations").select("id");
    if (filters.province) locationQuery = locationQuery.eq("province", filters.province);
    if (filters.district) locationQuery = locationQuery.eq("district", filters.district);
    if (filters.sector) locationQuery = locationQuery.eq("sector", filters.sector);
    const { data: matches } = await locationQuery;
    locationIds = (matches ?? []).map((m) => m.id);
  }

  let listingsQuery = supabase
    .from("listings")
    .select(
      "id, title, price, currency, listing_type, property_type, bedrooms, bathrooms, lat, lng, locations(province, district, sector), listing_photos(url, sort_order)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (locationIds) {
    listingsQuery = listingsQuery.in(
      "location_id",
      locationIds.length ? locationIds : ["00000000-0000-0000-0000-000000000000"],
    );
  }
  if (filters.listing_type) listingsQuery = listingsQuery.eq("listing_type", filters.listing_type);
  if (filters.property_type)
    listingsQuery = listingsQuery.eq("property_type", filters.property_type);
  if (filters.min_bedrooms)
    listingsQuery = listingsQuery.gte("bedrooms", Number(filters.min_bedrooms));
  if (filters.min_price) listingsQuery = listingsQuery.gte("price", Number(filters.min_price));
  if (filters.max_price) listingsQuery = listingsQuery.lte("price", Number(filters.max_price));

  const [{ data: listings }, { data: locations }] = await Promise.all([
    listingsQuery,
    supabase
      .from("locations")
      .select("id, province, district, sector, cell")
      .order("province")
      .order("district")
      .order("sector"),
  ]);

  return (
    <div className="px-6 py-6">
      <SearchFilters locations={locations ?? []} values={filters} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_440px]">
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {listings?.length ?? 0} {listings?.length === 1 ? "home" : "homes"} found
          </p>
          {!listings?.length ? (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-medium">No listings match your search</p>
              <p className="text-sm text-muted-foreground">Try widening your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
        <div className="h-[400px] lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)]">
          <ListingsMap listings={listings ?? []} />
        </div>
      </div>
    </div>
  );
}
