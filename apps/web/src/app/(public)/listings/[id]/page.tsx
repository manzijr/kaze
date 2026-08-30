import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
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
  const [hero, ...rest] = photos;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {hero && (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos */}
          <img
            src={hero.url}
            alt={listing.title}
            className={`h-full w-full object-cover ${rest.length ? "col-span-2 row-span-2" : "col-span-4 row-span-2"} aspect-video`}
          />
          {rest.slice(0, 4).map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos
            <img
              key={photo.url}
              src={photo.url}
              alt={listing.title}
              className="aspect-square h-full w-full object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-2xl font-bold">
            {listing.price.toLocaleString()} {listing.currency}
            {listing.listing_type === "rent" && (
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            )}
          </p>
          <h1 className="mt-1 text-lg font-medium">{listing.title}</h1>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location.sector}, {location.district}, {location.province}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-6 rounded-xl border border-border bg-muted/50 px-5 py-4">
            {listing.bedrooms != null && (
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.bedrooms} bed</span>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.bathrooms} bath</span>
              </div>
            )}
            {listing.size_sqm != null && (
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.size_sqm} sqm</span>
              </div>
            )}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            About this home
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>

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
          <div className="sticky top-20 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Interested in this property?</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Send a message and the owner or agent will contact you directly.
            </p>
            <div className="mt-4">
              <ContactAgentForm listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
