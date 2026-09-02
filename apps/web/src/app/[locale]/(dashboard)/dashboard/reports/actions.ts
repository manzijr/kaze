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

export async function resolveReport(reportId: string, status: "reviewed" | "dismissed") {
  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase.from("listing_reports").update({ status }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction(supabase, {
    adminId,
    action: `report_${status}`,
    targetType: "listing_report",
    targetId: reportId,
  });
  revalidatePath("/dashboard/reports");
}
