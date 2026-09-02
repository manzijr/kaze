"use server";

import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function completeProfile(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!name || !phone || (role !== "agent" && role !== "owner")) {
    const t = await getTranslations("onboarding");
    return { error: t("errorRequired") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = await getLocale();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { error } = await supabase
    .from("users")
    .insert({ id: user.id, name, phone, role });

  if (error) {
    return { error: error.message };
  }

  return redirect({ href: "/dashboard", locale });
}
