"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveListing(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "published" })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/moderation");
}

export async function rejectListing(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "draft" })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/moderation");
}
