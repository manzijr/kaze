import { notFound } from "next/navigation";
import type { Listing } from "@kaze/shared";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploader } from "@/components/PhotoUploader";
import { TitleVerificationCard } from "@/components/TitleVerificationCard";
import { EditListingActions } from "./EditListingActions";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: row }, { data: locations }, { data: photos }, { data: verification }] = await Promise.all([
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
    supabase
      .from("listing_verifications")
      .select("id, upi_number, status, notes")
      .eq("listing_id", id)
      .maybeSingle(),
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
    furnished: row.furnished,
    hasParking: row.has_parking,
    hasWaterTank: row.has_water_tank,
    hasBackupPower: row.has_backup_power,
    hasBoysQuarters: row.has_boys_quarters,
    isFenced: row.is_fenced,
    hasGarden: row.has_garden,
    hasFiberInternet: row.has_fiber_internet,
    roadAccess: row.road_access,
    advanceMonthsRequired: row.advance_months_required,
    viewCount: row.view_count,
    whatsappClickCount: row.whatsapp_click_count,
    expiresAt: row.expires_at,
    titleVerificationStatus: row.title_verification_status,
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

      <div className="mt-6">
        <TitleVerificationCard listingId={id} initial={verification ?? null} />
      </div>

      <EditListingActions listing={listing} locations={locations ?? []} />
    </div>
  );
}
