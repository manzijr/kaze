"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitInquiry } from "@/app/[locale]/(public)/listings/[id]/actions";

const initialState = { error: null as string | null, sent: false };
const inputClass =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40";

export function ContactAgentForm({ listingId }: { listingId: string }) {
  const t = useTranslations("contactForm");
  const boundAction = submitInquiry.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.sent) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        {t("sentMessage")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input name="name" required placeholder={t("namePlaceholder")} className={inputClass} />
      <input
        name="phone"
        type="tel"
        required
        placeholder={t("phonePlaceholder")}
        className={inputClass}
      />
      <textarea
        name="message"
        required
        rows={3}
        defaultValue={t("defaultMessage")}
        className={inputClass}
      />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
