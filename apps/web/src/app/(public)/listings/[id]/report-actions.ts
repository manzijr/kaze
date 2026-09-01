"use server";

import { createClient } from "@/lib/supabase/server";

type ReportState = { error: string | null; sent: boolean };

export async function submitListingReport(
  listingId: string,
  _prevState: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const reason = String(formData.get("reason") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!reason) {
    return { error: "Choose a reason.", sent: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("listing_reports").insert({
    listing_id: listingId,
    reporter_id: user?.id ?? null,
    reason,
    message: message || null,
  });

  if (error) {
    return { error: error.message, sent: false };
  }
  return { error: null, sent: true };
}
