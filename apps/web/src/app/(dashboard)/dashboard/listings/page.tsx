import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitForReview, archiveListing, deleteListing } from "./actions";

const statusStyles: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export default async function ListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, currency, status, listing_type, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          New listing
        </Link>
      </div>

      {!listings?.length ? (
        <p className="mt-8 text-sm text-zinc-500">
          You haven&apos;t listed any properties yet.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Price</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-3">
                  <Link href={`/dashboard/listings/${listing.id}/edit`} className="hover:underline">
                    {listing.title}
                  </Link>
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
                <td className="py-3">
                  <div className="flex gap-3 text-zinc-500">
                    {(listing.status === "draft" || listing.status === "archived") && (
                      <form action={submitForReview.bind(null, listing.id)}>
                        <button type="submit" className="hover:underline">
                          Submit for review
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
