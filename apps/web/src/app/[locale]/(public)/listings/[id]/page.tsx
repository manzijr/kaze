import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Layers,
  Car,
  Droplets,
  Zap,
  Home as HomeIcon,
  Trees,
  Wifi,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingsMap } from "@/components/ListingsMap";
import { ContactAgentForm } from "@/components/ContactAgentForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TitleVerifiedBadge, VerifiedAgentBadge } from "@/components/TrustBadges";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportListingLink } from "@/components/ReportListingLink";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";

type Props = { params: Promise<{ id: string }> };

const LISTING_FIELDS =
  "id, title, description, price, currency, listing_type, property_type, bedrooms, bathrooms, size_sqm, plot_size_sqm, floors, lat, lng, owner_id, title_verification_status, furnished, has_parking, has_water_tank, has_backup_power, has_boys_quarters, is_fenced, has_garden, has_fiber_internet, road_access, advance_months_required, locations(province, district, sector), listing_photos(url, sort_order)";

async function getListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_FIELDS)
    .eq("id", id)
    .eq("status", "published")
    .single();
  // PGRST116 ("no rows") is a genuine not-found; anything else (network/DB
  // failure) should surface as a real error rather than a false 404.
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }
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

const amenityIcons: { key: "has_parking" | "has_water_tank" | "has_backup_power" | "has_boys_quarters" | "is_fenced" | "has_garden" | "has_fiber_internet"; Icon: typeof Car }[] = [
  { key: "has_parking", Icon: Car },
  { key: "has_water_tank", Icon: Droplets },
  { key: "has_backup_power", Icon: Zap },
  { key: "has_boys_quarters", Icon: HomeIcon },
  { key: "is_fenced", Icon: HomeIcon },
  { key: "has_garden", Icon: Trees },
  { key: "has_fiber_internet", Icon: Wifi },
];

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("listingDetail");
  const tAmenities = await getTranslations("amenities");
  const tRoadAccess = await getTranslations("roadAccess");
  const supabase = await createClient();
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  // Best-effort view counter; never let this block rendering.
  await supabase.rpc("increment_listing_view", { p_listing_id: id });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: owner }, { data: phone }, { data: favorite }] = await Promise.all([
    supabase.from("public_profiles").select("name, verification_status").eq("id", listing.owner_id).single(),
    supabase.rpc("get_listing_contact_phone", { p_listing_id: id }),
    user
      ? supabase.from("favorites").select("user_id").eq("user_id", user.id).eq("listing_id", id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const origin = (await headers()).get("origin") ?? "";
  const listingUrl = `${origin}/listings/${id}`;

  const location = Array.isArray(listing.locations) ? listing.locations[0] : listing.locations;
  const photos = [...listing.listing_photos].sort((a, b) => a.sort_order - b.sort_order);
  const [hero, ...rest] = photos;
  const activeAmenities = amenityIcons
    .filter((a) => (listing as unknown as Record<string, boolean>)[a.key])
    .map((a) => ({ ...a, label: tAmenities(a.key) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: listingUrl,
    image: photos.map((p) => p.url),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
    },
    address: location
      ? {
          "@type": "PostalAddress",
          addressRegion: location.province,
          addressLocality: location.district,
          addressCountry: "RW",
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RecentlyViewedTracker
        item={{
          id: listing.id,
          title: listing.title,
          price: listing.price,
          currency: listing.currency,
          photoUrl: photos[0]?.url ?? null,
        }}
      />

      {hero && (
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
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
          <FavoriteButton
            listingId={listing.id}
            userId={user?.id ?? null}
            initialFavorited={Boolean(favorite)}
            className="absolute right-3 top-3"
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-2xl font-bold">
            {listing.price.toLocaleString()} {listing.currency}
            {listing.listing_type === "rent" && (
              <span className="text-base font-normal text-muted-foreground">{t("perMonth")}</span>
            )}
          </p>
          <h1 className="mt-1 text-lg font-medium">{listing.title}</h1>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location.sector}, {location.district}, {location.province}
            </p>
          )}
          {listing.title_verification_status === "verified" && (
            <div className="mt-2">
              <TitleVerifiedBadge />
            </div>
          )}
          {listing.listing_type === "rent" && listing.advance_months_required != null && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("advanceRequired", { count: listing.advance_months_required })}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-6 rounded-xl border border-border bg-muted/50 px-5 py-4">
            {listing.bedrooms != null && (
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.bedrooms} {t("bed")}</span>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.bathrooms} {t("bath")}</span>
              </div>
            )}
            {listing.floors != null && (
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("floor", { count: listing.floors })}</span>
              </div>
            )}
            {listing.size_sqm != null && (
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.size_sqm} {t("sqmBuilt")}</span>
              </div>
            )}
            {listing.plot_size_sqm != null && (
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{listing.plot_size_sqm} {t("sqmPlot")}</span>
              </div>
            )}
          </div>

          {(activeAmenities.length > 0 || listing.road_access || listing.furnished != null) && (
            <>
              <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("amenitiesHeading")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-4">
                {listing.furnished != null && (
                  <span className="text-sm">{listing.furnished ? t("furnished") : t("unfurnished")}</span>
                )}
                {listing.road_access && (
                  <span className="text-sm">
                    {t("roadAccess", { type: tRoadAccess(listing.road_access as "paved" | "murram" | "footpath") })}
                  </span>
                )}
                {activeAmenities.map(({ key, label, Icon }) => (
                  <span key={key} className="flex items-center gap-1.5 text-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("aboutHeading")}
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
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{owner?.name ?? t("listedByOwner")}</p>
                {owner?.verification_status === "verified" && <VerifiedAgentBadge />}
              </div>
              {phone && (
                <div className="mt-3">
                  <WhatsAppButton
                    listingId={listing.id}
                    phone={phone}
                    listingTitle={listing.title}
                    listingUrl={listingUrl}
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold">{t("sendMessageHeading")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("sendMessageBody")}</p>
              <div className="mt-4">
                <ContactAgentForm listingId={listing.id} />
              </div>
            </div>

            <ReportListingLink listingId={listing.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
