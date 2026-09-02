import { notFound } from "next/navigation";
import type { Listing } from "@kaze/shared";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploader } from "@/components/PhotoUploader";
import { TitleVerificationCard } from "@/components/TitleVerificationCard";
import { EditListingActions } from "./EditListingActions";
import { updateListingOutcome } from "../../actions";

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
    plotSizeSqm: row.plot_size_sqm,
    floors: row.floors,
    yearBuiltRange: row.year_built_range,
    finishQuality: row.finish_quality,
    closedStatus: row.closed_status,
    achievedPrice: row.achieved_price,
    closedAt: row.closed_at,
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

      {listing.status === "archived" && (
        <div className="mt-6 rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold">Listing outcome</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional — helps us show accurate market data to future listers.
          </p>
          <form action={updateListingOutcome.bind(null, id)} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="closed_status" className="block text-sm font-medium">
                What happened?
              </label>
              <select
                id="closed_status"
                name="closed_status"
                defaultValue={listing.closedStatus ?? ""}
                className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label htmlFor="achieved_price" className="block text-sm font-medium">
                Achieved price ({listing.currency})
              </label>
              <input
                id="achieved_price"
                name="achieved_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={listing.achievedPrice ?? undefined}
                className="mt-1 w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Save
            </button>
          </form>
        </div>
      )}

      <EditListingActions listing={listing} locations={locations ?? []} />
    </div>
  );
}
