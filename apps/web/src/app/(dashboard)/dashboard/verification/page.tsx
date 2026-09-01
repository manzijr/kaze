import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationForm } from "./VerificationForm";

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("verification_status, verification_notes, id_document_url, business_registration_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold">Get verified</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verified agents and owners get a &quot;Verified&quot; badge on their listings — the
        single biggest trust signal for buyers and renters in this market.
      </p>
      <div className="mt-6">
        <VerificationForm userId={user.id} profile={profile ?? null} />
      </div>
    </div>
  );
}
