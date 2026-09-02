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
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="submit_review"
          disabled={pending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
        >
          Submit for review
        </button>
      </div>
    </form>
  );
}
