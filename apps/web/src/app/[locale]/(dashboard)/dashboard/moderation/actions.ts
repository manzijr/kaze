"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/adminAudit";

const LISTING_LIFETIME_DAYS = 60;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, adminId: user.id };
}

export async function approveListing(listingId: string) {
  const { supabase, adminId } = await requireAdmin();
  const expiresAt = new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("listings")
    .update({ status: "published", expires_at: expiresAt })
    .eq("id", listingId);
  if (error) throw new Error(error.message);

  await logAdminAction(supabase, {
    adminId,
    action: "approve_listing",
    targetType: "listing",
    targetId: listingId,
  });
  revalidatePath("/dashboard/moderation");
}

export async function rejectListing(listingId: string) {
  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase
    .from("listings")
    .update({ status: "draft" })
    .eq("id", listingId);
  if (error) throw new Error(error.message);

  await logAdminAction(supabase, {
    adminId,
    action: "reject_listing",
    targetType: "listing",
    targetId: listingId,
  });
  revalidatePath("/dashboard/moderation");
}
