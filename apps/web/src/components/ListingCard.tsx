import Link from "next/link";

type LocationRef = { province: string; district: string; sector: string };

type CardListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  locations: LocationRef | LocationRef[] | null;
  listing_photos: { url: string; sort_order: number }[];
};

export function ListingCard({ listing }: { listing: CardListing }) {
  const photo = [...listing.listing_photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  const location = Array.isArray(listing.locations) ? listing.locations[0] : listing.locations;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-lg border border-zinc-200 transition hover:shadow-md dark:border-zinc-800"
    >
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-900">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos
          <img src={photo.url} alt={listing.title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold">
          {listing.price.toLocaleString()} {listing.currency}
          {listing.listing_type === "rent" && <span className="font-normal text-zinc-500">/mo</span>}
        </p>
        <p className="mt-1 truncate text-sm">{listing.title}</p>
        <p className="mt-1 text-sm text-zinc-500">
          {listing.bedrooms != null && `${listing.bedrooms} bd `}
          {listing.bathrooms != null && `${listing.bathrooms} ba `}
        </p>
        {location && (
          <p className="mt-1 text-xs text-zinc-400">
            {location.sector}, {location.district}
          </p>
        )}
      </div>
    </Link>
  );
}
