"use server";

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string | null; sent: boolean };

export async function submitInquiry(
  listingId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone || !message) {
    const t = await getTranslations("contactForm");
    return { error: t("errorRequired"), sent: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    listing_id: listingId,
    buyer_id: user?.id ?? null,
    name,
    phone,
    message,
  });

  if (error) {
    return { error: error.message, sent: false };
  }
  return { error: null, sent: true };
}
