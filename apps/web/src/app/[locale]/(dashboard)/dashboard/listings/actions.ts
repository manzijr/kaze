"use server";

import { redirect } from "@/i18n/navigation";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string | null };

function parseListingFields(formData: FormData) {
  const num = (key: string) => {
    const v = formData.get(key);
    return v && String(v).trim() !== "" ? Number(v) : null;
  };
  const str = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return v || null;
  };
  const bool = (key: string) => {
    const v = String(formData.get(key) ?? "");
    return v === "" ? null : v === "true";
  };

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price")),
    currency: String(formData.get("currency") ?? "RWF"),
    listing_type: String(formData.get("listing_type") ?? ""),
    property_type: String(formData.get("property_type") ?? ""),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    size_sqm: num("size_sqm"),
    location_id: String(formData.get("location_id") ?? ""),
    lat: num("lat"),
    lng: num("lng"),
    advance_months_required: num("advance_months_required"),
    floors: num("floors"),
    plot_size_sqm: num("plot_size_sqm"),
    furnished: bool("furnished"),
    year_built_range: str("year_built_range"),
    finish_quality: str("finish_quality"),
    road_access: str("road_access"),
    has_parking: formData.get("has_parking") === "on",
    has_water_tank: formData.get("has_water_tank") === "on",
    has_backup_power: formData.get("has_backup_power") === "on",
    has_boys_quarters: formData.get("has_boys_quarters") === "on",
    is_fenced: formData.get("is_fenced") === "on",
    has_garden: formData.get("has_garden") === "on",
    has_fiber_internet: formData.get("has_fiber_internet") === "on",
  };
}

export async function createListing(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const intent = String(formData.get("intent") ?? "draft");
  const fields = parseListingFields(formData);

  if (!fields.title || !fields.location_id || !fields.price) {
    return { error: "Fill in the title, price, and location." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getLocale();
    return redirect({ href: "/login", locale });
  }

  const { error } = await supabase.from("listings").insert({
    ...fields,
    owner_id: user.id,
    // Owners can only save a draft or submit for review; only an admin
    // (via the moderation queue) can move a listing to "published".
    status: intent === "submit_review" ? "pending_review" : "draft",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/listings");
  const locale = await getLocale();
  return redirect({ href: "/dashboard/listings", locale });
}

export async function updateListing(
  listingId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields = parseListingFields(formData);

  if (!fields.title || !fields.location_id || !fields.price) {
    return { error: "Fill in the title, price, and location." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  const locale = await getLocale();
  return redirect({ href: "/dashboard/listings", locale });
}

export async function submitForReview(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "pending_review" })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/listings");
}

export async function archiveListing(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "archived" })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/listings");
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/listings");
}

const LISTING_LIFETIME_DAYS = 60;

export async function renewListing(listingId: string) {
  const supabase = await createClient();
  const expiresAt = new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("listings")
    .update({ expires_at: expiresAt })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/listings");
}

export async function updateListingOutcome(listingId: string, formData: FormData) {
  const closedStatus = String(formData.get("closed_status") ?? "").trim();
  const achievedPriceRaw = formData.get("achieved_price");
  const achievedPrice =
    achievedPriceRaw && String(achievedPriceRaw).trim() !== "" ? Number(achievedPriceRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({
      closed_status: closedStatus || null,
      achieved_price: achievedPrice,
      closed_at: closedStatus ? new Date().toISOString() : null,
    })
    .eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}
