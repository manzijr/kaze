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

export async function approveAgentVerification(userId: string) {
  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase
    .from("users")
    .update({ verification_status: "verified", verification_notes: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  await logAdminAction(supabase, {
    adminId,
    action: "approve_agent_verification",
    targetType: "user",
    targetId: userId,
  });
  revalidatePath("/dashboard/agent-verifications");
}

export async function rejectAgentVerification(userId: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim() || "Documents did not meet requirements.";
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("users")
    .update({ verification_status: "rejected", verification_notes: reason })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  await logAdminAction(supabase, {
    adminId,
    action: "reject_agent_verification",
    targetType: "user",
    targetId: userId,
    notes: reason,
  });
  revalidatePath("/dashboard/agent-verifications");
}
