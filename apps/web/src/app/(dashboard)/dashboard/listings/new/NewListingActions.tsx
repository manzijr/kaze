"use client";

import { useActionState } from "react";
import type { Location } from "@kaze/shared";
import { ListingFields } from "@/components/ListingFields";
import { createListing } from "../actions";

const initialState = { error: null as string | null };

export function NewListingActions({ locations }: { locations: Location[] }) {
  const [state, formAction, pending] = useActionState(createListing, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <ListingFields locations={locations} />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="submit_review"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          Submit for review
        </button>
      </div>
    </form>
  );
}
