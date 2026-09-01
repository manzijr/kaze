import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveAgentVerification, rejectAgentVerification } from "./actions";

export default async function AgentVerificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: pending } = await supabase
    .from("users")
    .select("id, name, phone, role, id_document_url, business_registration_url")
    .eq("verification_status", "pending");

  const withUrls = await Promise.all(
    (pending ?? []).map(async (person) => {
      const [idDoc, bizDoc] = await Promise.all([
        person.id_document_url
          ? supabase.storage.from("verification-docs").createSignedUrl(person.id_document_url, 600)
          : Promise.resolve({ data: null }),
        person.business_registration_url
          ? supabase.storage
              .from("verification-docs")
              .createSignedUrl(person.business_registration_url, 600)
          : Promise.resolve({ data: null }),
      ]);
      return {
        ...person,
        idDocUrl: idDoc.data?.signedUrl ?? null,
        bizDocUrl: bizDoc.data?.signedUrl ?? null,
      };
    }),
  );

  return (
    <div>
      <h1 className="text-xl font-semibold">Agent &amp; owner verification</h1>

      {!withUrls.length ? (
        <p className="mt-8 text-sm text-muted-foreground">Nothing pending review.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {withUrls.map((person) => (
            <li key={person.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {person.name} <span className="text-muted-foreground">({person.role})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{person.phone}</p>
                  <div className="mt-2 flex gap-3 text-sm">
                    {person.idDocUrl && (
                      <a href={person.idDocUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        View ID document
                      </a>
                    )}
                    {person.bizDocUrl && (
                      <a href={person.bizDocUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        View business registration
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <form action={approveAgentVerification.bind(null, person.id)}>
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectAgentVerification.bind(null, person.id)} className="flex gap-2">
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
          ))}
        </ul>
      )}
    </div>
  );
}
