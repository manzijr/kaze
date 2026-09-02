"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/adminAudit";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, adminId: user.id };
}

export async function approveTitleVerification(verificationId: string, listingId: string) {
  const { supabase, adminId } = await requireAdmin();

  const [{ error: verErr }, { error: listingErr }] = await Promise.all([
    supabase
      .from("listing_verifications")
      .update({ status: "verified", reviewed_by: adminId, reviewed_at: new Date().toISOString(), notes: null })
      .eq("id", verificationId),
    supabase.from("listings").update({ title_verification_status: "verified" }).eq("id", listingId),
  ]);
  if (verErr) throw new Error(verErr.message);
  if (listingErr) throw new Error(listingErr.message);

  await logAdminAction(supabase, {
    adminId,
    action: "approve_title_verification",
    targetType: "listing",
    targetId: listingId,
  });
  revalidatePath("/dashboard/title-verifications");
}

export async function rejectTitleVerification(
  verificationId: string,
  listingId: string,
  formData: FormData,
) {
  const reason = String(formData.get("reason") ?? "").trim() || "Documents did not meet requirements.";
  const { supabase, adminId } = await requireAdmin();

  const [{ error: verErr }, { error: listingErr }] = await Promise.all([
    supabase
      .from("listing_verifications")
      .update({ status: "rejected", reviewed_by: adminId, reviewed_at: new Date().toISOString(), notes: reason })
      .eq("id", verificationId),
    supabase.from("listings").update({ title_verification_status: "rejected" }).eq("id", listingId),
  ]);
  if (verErr) throw new Error(verErr.message);
  if (listingErr) throw new Error(listingErr.message);

  await logAdminAction(supabase, {
    adminId,
    action: "reject_title_verification",
    targetType: "listing",
    targetId: listingId,
    notes: reason,
  });
  revalidatePath("/dashboard/title-verifications");
}
