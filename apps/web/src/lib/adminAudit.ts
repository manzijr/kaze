import type { SupabaseClient } from "@kaze/shared";

/**
 * Records an admin action to admin_audit_log. Best-effort: a logging
 * failure should never block the underlying admin action, so errors are
 * swallowed (and surfaced to the server console) rather than thrown.
 */
export async function logAdminAction(
  supabase: SupabaseClient,
  params: { adminId: string; action: string; targetType: string; targetId?: string; notes?: string },
) {
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_id: params.adminId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    notes: params.notes ?? null,
  });
  if (error) {
    console.error("Failed to write admin_audit_log entry:", error.message);
  }
}
