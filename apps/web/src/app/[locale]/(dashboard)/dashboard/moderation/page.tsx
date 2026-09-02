import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { approveListing, rejectListing } from "./actions";

export default async function ModerationPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return redirect({ href: "/dashboard", locale });
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, currency, description, users(name, phone)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold">Moderation queue</h1>

      {!listings?.length ? (
        <p className="mt-8 text-sm text-zinc-500">Nothing pending review.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {listings.map((listing) => {
            const owner = Array.isArray(listing.users) ? listing.users[0] : listing.users;
            return (
              <li
                key={listing.id}
                className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-zinc-500">
                      {listing.price.toLocaleString()} {listing.currency} — {owner?.name} (
                      {owner?.phone})
                    </p>
                    <p className="mt-2 text-sm">{listing.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approveListing.bind(null, listing.id)}>
                      <button
                        type="submit"
                        className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectListing.bind(null, listing.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
