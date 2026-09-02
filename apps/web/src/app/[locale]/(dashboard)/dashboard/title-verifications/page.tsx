import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { approveTitleVerification, rejectTitleVerification } from "./actions";

export default async function TitleVerificationsPage() {
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

  const { data: pending } = await supabase
    .from("listing_verifications")
    .select("id, upi_number, title_document_url, listings(id, title, users(name, phone))")
    .eq("status", "pending");

  const withUrls = await Promise.all(
    (pending ?? []).map(async (v) => {
      const signed = v.title_document_url
        ? await supabase.storage.from("verification-docs").createSignedUrl(v.title_document_url, 600)
        : { data: null };
      return { ...v, docUrl: signed.data?.signedUrl ?? null };
    }),
  );

  return (
    <div>
      <h1 className="text-xl font-semibold">Title verification</h1>

      {!withUrls.length ? (
        <p className="mt-8 text-sm text-muted-foreground">Nothing pending review.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {withUrls.map((v) => {
            const listing = Array.isArray(v.listings) ? v.listings[0] : v.listings;
            const owner = listing ? (Array.isArray(listing.users) ? listing.users[0] : listing.users) : null;
            return (
              <li key={v.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{listing?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      UPI: {v.upi_number || "—"} · Owner: {owner?.name} ({owner?.phone})
                    </p>
                    {v.docUrl && (
                      <a href={v.docUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                        View title document
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <form action={approveTitleVerification.bind(null, v.id, listing?.id ?? "")}>
                      <button
                        type="submit"
                        className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                      >
                        Approve
                      </button>
                    </form>
                    <form
                      action={rejectTitleVerification.bind(null, v.id, listing?.id ?? "")}
                      className="flex gap-2"
                    >
                      <input
                        name="reason"
                        placeholder="Rejection reason"
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold"
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
