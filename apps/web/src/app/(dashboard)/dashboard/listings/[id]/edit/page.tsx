import { notFound } from "next/navigation";
import type { Listing } from "@kaze/shared";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploader } from "@/components/PhotoUploader";
import { EditListingActions } from "./EditListingActions";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: row }, { data: locations }, { data: photos }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).single(),
    supabase
      .from("locations")
      .select("id, province, district, sector, cell")
      .order("province")
      .order("district")
      .order("sector"),
    supabase
      .from("listing_photos")
      .select("*")
      .eq("listing_id", id)
      .order("sort_order"),
  ]);

  if (!row) {
    notFound();
  }

  const listing: Listing = {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    price: row.price,
    currency: row.currency,
    listingType: row.listing_type,
    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sizeSqm: row.size_sqm,
    locationId: row.location_id,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    featuredUntil: row.featured_until,
    createdAt: row.created_at,
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Edit listing</h1>

      <div className="mt-6">
        <span className="block text-sm font-medium">Photos</span>
        <div className="mt-2">
          <PhotoUploader listingId={id} initialPhotos={photos ?? []} />
        </div>
      </div>

      <EditListingActions listing={listing} locations={locations ?? []} />
    </div>
  );
}
