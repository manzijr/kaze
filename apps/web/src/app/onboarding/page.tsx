"use client";

import { useActionState } from "react";
import { completeProfile } from "./actions";

const initialState = { error: null as string | null };
const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(completeProfile, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-32">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One more step before you can list properties.
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full name
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="+250 7xx xxx xxx"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              I am a...
            </label>
            <select id="role" name="role" defaultValue="owner" className={inputClass}>
              <option value="owner">Property owner</option>
              <option value="agent">Agent</option>
            </select>
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
