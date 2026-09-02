import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";

export default async function SavedListingsPage() {
  const t = await getTranslations("saved");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    return redirect({ href: "/login", locale });
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "listing_id, listings(id, title, price, currency, listing_type, bedrooms, bathrooms, title_verification_status, locations(province, district, sector), listing_photos(url, sort_order))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (favorites ?? [])
    .map((f) => (Array.isArray(f.listings) ? f.listings[0] : f.listings))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <div className="px-6 py-6">
      <h1 className="text-xl font-semibold">{t("heading")}</h1>

      {!listings.length ? (
        <p className="mt-8 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} currentUserId={user.id} isFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
