import { Link } from "@/i18n/navigation";
import { redirect } from "@/i18n/navigation";
import { ShieldCheck, Eye, MessageCircle } from "lucide-react";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { submitForReview, archiveListing, deleteListing, renewListing } from "./actions";

const statusStyles: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

// Pulled out of the component body so the impure Date.now() call isn't
// directly inside a component/hook (react-hooks/purity) -- fine here since
// this runs per-request on the server, not during a re-render.
function isExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
}

export default async function ListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    return redirect({ href: "/login", locale });
  }

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, status, listing_type, created_at, expires_at, view_count, whatsapp_click_count, title_verification_status",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          New listing
        </Link>
      </div>

      {!listings?.length ? (
        <p className="mt-8 text-sm text-muted-foreground">
          You haven&apos;t listed any properties yet.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Price</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Stats</th>
              <th className="py-2 font-medium">Expires</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const expiresSoon = isExpiringSoon(listing.expires_at);
              return (
                <tr key={listing.id} className="border-b border-border/60">
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/listings/${listing.id}/edit`} className="hover:underline">
                        {listing.title}
                      </Link>
                      {listing.title_verification_status === "verified" && (
                        <ShieldCheck className="h-4 w-4 text-accent" aria-label="Title verified" />
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    {listing.price.toLocaleString()} {listing.currency}
                    {listing.listing_type === "rent" && "/mo"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[listing.status]}`}
                    >
                      {listing.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {listing.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {listing.whatsapp_click_count}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {listing.expires_at ? (
                      <span className={expiresSoon ? "font-medium text-amber-600 dark:text-amber-400" : ""}>
                        {new Date(listing.expires_at).toLocaleDateString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-3 text-muted-foreground">
                      {(listing.status === "draft" || listing.status === "archived") && (
                        <form action={submitForReview.bind(null, listing.id)}>
                          <button type="submit" className="hover:underline">
                            Submit for review
                          </button>
                        </form>
                      )}
                      {listing.status === "published" && (
                        <form action={renewListing.bind(null, listing.id)}>
                          <button type="submit" className="hover:underline">
                            Renew
                          </button>
                        </form>
                      )}
                      {listing.status !== "archived" && (
                        <form action={archiveListing.bind(null, listing.id)}>
                          <button type="submit" className="hover:underline">
                            Archive
                          </button>
                        </form>
                      )}
                      <form action={deleteListing.bind(null, listing.id)}>
                        <button type="submit" className="hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
