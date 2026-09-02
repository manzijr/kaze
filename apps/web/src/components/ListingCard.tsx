import { Link } from "@/i18n/navigation";
import { BedDouble, Bath, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TitleVerifiedBadge } from "./TrustBadges";
import { FavoriteButton } from "./FavoriteButton";

type LocationRef = { province: string; district: string; sector: string };

type CardListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  title_verification_status?: string | null;
  locations: LocationRef | LocationRef[] | null;
  listing_photos: { url: string; sort_order: number }[];
};

export async function ListingCard({
  listing,
  currentUserId = null,
  isFavorited = false,
}: {
  listing: CardListing;
  currentUserId?: string | null;
  isFavorited?: boolean;
}) {
  const t = await getTranslations("listingCard");
  const photo = [...listing.listing_photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  const location = Array.isArray(listing.locations) ? listing.locations[0] : listing.locations;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos
          <img
            src={photo.url}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noPhoto")}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur">
          {listing.listing_type === "rent" ? t("forRent") : t("forSale")}
        </span>
        <FavoriteButton
          listingId={listing.id}
          userId={currentUserId}
          initialFavorited={isFavorited}
          className="absolute right-3 top-3"
        />
      </div>
      <div className="p-4">
        <p className="text-lg font-bold">
          {listing.price.toLocaleString()} {listing.currency}
          {listing.listing_type === "rent" && (
            <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span>
          )}
        </p>
        <p className="mt-1 truncate text-sm font-medium">{listing.title}</p>
        {listing.title_verification_status === "verified" && (
          <div className="mt-1.5">
            <TitleVerifiedBadge />
          </div>
        )}
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {listing.bathrooms}
            </span>
          )}
        </div>
        {location && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {location.sector}, {location.district}
          </p>
        )}
      </div>
    </Link>
  );
}
