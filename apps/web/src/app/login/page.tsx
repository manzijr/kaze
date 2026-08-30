"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Home, CheckCircle2 } from "lucide-react";
import { sendMagicLink } from "./actions";

const initialState = { error: null as string | null, sent: false };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-32">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Home className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to Kaze</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For agents and property owners. We&apos;ll email you a sign-in link.
          </p>
        </div>

        {state.sent ? (
          <p className="mt-6 flex items-start gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Check your email for a sign-in link.
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                placeholder="you@example.com"
              />
            </div>
            {state.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
