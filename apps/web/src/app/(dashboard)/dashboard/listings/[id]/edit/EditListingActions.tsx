"use client";

import { useActionState } from "react";
import type { Listing, Location } from "@kaze/shared";
import { ListingFields } from "@/components/ListingFields";
import { updateListing } from "../../actions";

const initialState = { error: null as string | null };

export function EditListingActions({
  listing,
  locations,
}: {
  listing: Listing;
  locations: Location[];
}) {
  const boundUpdate = updateListing.bind(null, listing.id);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <ListingFields locations={locations} defaults={listing} />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
