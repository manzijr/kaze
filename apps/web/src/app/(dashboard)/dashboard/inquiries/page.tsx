import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, name, phone, message, created_at, listings(id, title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Inquiries</h1>

      {!inquiries?.length ? (
        <p className="mt-8 text-sm text-zinc-500">
          No inquiries yet. They&apos;ll show up here when someone contacts you about a listing.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-900">
          {inquiries.map((inquiry) => {
            const listing = Array.isArray(inquiry.listings)
              ? inquiry.listings[0]
              : inquiry.listings;
            return (
              <li key={inquiry.id} className="py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{inquiry.name}</p>
                  <span className="text-xs text-zinc-500">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </span>
                </div>
                {listing && (
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    Re: {listing.title}
                  </Link>
                )}
                <p className="mt-1 text-sm">{inquiry.message}</p>
                <p className="mt-1 text-sm text-zinc-500">{inquiry.phone}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
