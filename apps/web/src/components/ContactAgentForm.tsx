"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/app/(public)/listings/[id]/actions";

const initialState = { error: null as string | null, sent: false };

export function ContactAgentForm({ listingId }: { listingId: string }) {
  const boundAction = submitInquiry.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.sent) {
    return (
      <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Message sent — the owner/agent will reach out to you directly.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        required
        placeholder="Your name"
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder="Your phone number"
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        name="message"
        required
        rows={3}
        defaultValue="Hi, is this still available? I'd like to schedule a viewing."
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Sending…" : "Contact agent"}
      </button>
    </form>
  );
}
