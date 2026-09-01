"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { submitListingReport } from "@/app/(public)/listings/[id]/report-actions";

const initialState = { error: null as string | null, sent: false };

export function ReportListingLink({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = submitListingReport.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.sent) {
    return <p className="text-xs text-muted-foreground">Thanks — we&apos;ll review this listing.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
      >
        <Flag className="h-3 w-3" />
        Report this listing
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-border p-3">
      <select
        name="reason"
        required
        className="block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        <option value="">Why are you reporting this?</option>
        <option value="fraud_or_scam">Suspected fraud or scam</option>
        <option value="wrong_info">Inaccurate information</option>
        <option value="already_sold">Already sold/rented</option>
        <option value="duplicate">Duplicate listing</option>
        <option value="other">Other</option>
      </select>
      <textarea
        name="message"
        rows={2}
        placeholder="Optional details"
        className="block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit report"}
      </button>
    </form>
  );
}
