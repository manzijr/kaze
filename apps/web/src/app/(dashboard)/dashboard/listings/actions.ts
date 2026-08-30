"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string | null };

function parseListingFields(formData: FormData) {
  const bedrooms = formData.get("bedrooms");
  const bathrooms = formData.get("bathrooms");
  const sizeSqm = formData.get("size_sqm");

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price")),
    currency: String(formData.get("currency") ?? "RWF"),
    listing_type: String(formData.get("listing_type") ?? ""),
    property_type: String(formData.get("property_type") ?? ""),
    bedrooms: bedrooms ? Number(bedrooms) : null,
    bathrooms: bathrooms ? Number(bathrooms) : null,
    size_sqm: sizeSqm ? Number(sizeSqm) : null,
    location_id: String(formData.get("location_id") ?? ""),
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
  if (!user) redirect("/login");

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
  redirect("/dashboard/listings");
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
  redirect("/dashboard/listings");
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
