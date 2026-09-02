"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { completeProfile } from "./actions";

const initialState = { error: null as string | null };
const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const [state, formAction, pending] = useActionState(completeProfile, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-32">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t("heading")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("body")}</p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              {t("fullName")}
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              {t("phoneNumber")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder={t("phonePlaceholder")}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              {t("iAmA")}
            </label>
            <select id="role" name="role" defaultValue="owner" className={inputClass}>
              <option value="owner">{t("propertyOwner")}</option>
              <option value="agent">{t("agent")}</option>
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
            {pending ? t("saving") : t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
