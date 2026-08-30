import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingsMap } from "@/components/ListingsMap";
import { ContactAgentForm } from "@/components/ContactAgentForm";

type Props = { params: Promise<{ id: string }> };

async function getListing(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, description, price, currency, listing_type, property_type, bedrooms, bathrooms, size_sqm, lat, lng, locations(province, district, sector), listing_photos(url, sort_order)",
    )
    .eq("id", id)
    .eq("status", "published")
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found | Kaze" };

  const location = Array.isArray(listing.locations) ? listing.locations[0] : listing.locations;
  const description = `${listing.price.toLocaleString()} ${listing.currency}${listing.listing_type === "rent" ? "/mo" : ""} — ${listing.bedrooms ?? "?"} bd, ${listing.bathrooms ?? "?"} ba in ${location?.sector ?? ""}, ${location?.district ?? ""}, Rwanda.`;

  return {
    title: `${listing.title} | Kaze`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.listing_photos?.[0]?.url ? [listing.listing_photos[0].url] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const location = Array.isArray(listing.locations) ? listing.locations[0] : listing.locations;
  const photos = [...listing.listing_photos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos
            <img
              key={photo.url}
              src={photo.url}
              alt={listing.title}
              className="aspect-square rounded-md object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-2 text-xl font-semibold">
            {listing.price.toLocaleString()} {listing.currency}
            {listing.listing_type === "rent" && (
              <span className="font-normal text-zinc-500">/mo</span>
            )}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {listing.bedrooms != null && `${listing.bedrooms} bd · `}
            {listing.bathrooms != null && `${listing.bathrooms} ba · `}
            {listing.size_sqm != null && `${listing.size_sqm} sqm`}
          </p>
          {location && (
            <p className="mt-1 text-sm text-zinc-500">
              {location.sector}, {location.district}, {location.province}
            </p>
          )}

          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">
            {listing.description}
          </p>

          {listing.lat != null && listing.lng != null && (
            <div className="mt-8 h-72">
              <ListingsMap
                listings={[
                  {
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                    currency: listing.currency,
                    lat: listing.lat,
                    lng: listing.lng,
                  },
                ]}
              />
            </div>
          )}
        </div>

        <div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-sm font-medium">Interested in this property?</h2>
            <div className="mt-3">
              <ContactAgentForm listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
