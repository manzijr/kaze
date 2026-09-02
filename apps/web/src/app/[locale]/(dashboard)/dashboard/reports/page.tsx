import { Link } from "@/i18n/navigation";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { resolveReport } from "./actions";

const reasonLabels: Record<string, string> = {
  fraud_or_scam: "Suspected fraud or scam",
  wrong_info: "Inaccurate information",
  already_sold: "Already sold/rented",
  duplicate: "Duplicate listing",
  other: "Other",
};

export default async function ReportsPage() {
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

  const { data: reports } = await supabase
    .from("listing_reports")
    .select("id, reason, message, created_at, listings(id, title)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Reported listings</h1>

      {!reports?.length ? (
        <p className="mt-8 text-sm text-muted-foreground">No open reports.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reports.map((report) => {
            const listing = Array.isArray(report.listings) ? report.listings[0] : report.listings;
            return (
              <li key={report.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {listing && (
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {listing.title}
                      </Link>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {reasonLabels[report.reason] ?? report.reason}
                    </p>
                    {report.message && <p className="mt-1 text-sm">{report.message}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={resolveReport.bind(null, report.id, "dismissed")}>
                      <button
                        type="submit"
                        className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold"
                      >
                        Dismiss
                      </button>
                    </form>
                    <form action={resolveReport.bind(null, report.id, "reviewed")}>
                      <button
                        type="submit"
                        className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                      >
                        Mark reviewed
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
