"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitListingReport } from "@/app/[locale]/(public)/listings/[id]/report-actions";

const initialState = { error: null as string | null, sent: false };

export function ReportListingLink({ listingId }: { listingId: string }) {
  const t = useTranslations("reportForm");
  const [open, setOpen] = useState(false);
  const boundAction = submitListingReport.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.sent) {
    return <p className="text-xs text-muted-foreground">{t("sentMessage")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
      >
        <Flag className="h-3 w-3" />
        {t("reportLink")}
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
        <option value="">{t("reasonPlaceholder")}</option>
        <option value="fraud_or_scam">{t("reasonFraud")}</option>
        <option value="wrong_info">{t("reasonWrongInfo")}</option>
        <option value="already_sold">{t("reasonAlreadySold")}</option>
        <option value="duplicate">{t("reasonDuplicate")}</option>
        <option value="other">{t("reasonOther")}</option>
      </select>
      <textarea
        name="message"
        rows={2}
        placeholder={t("detailsPlaceholder")}
        className="block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
      >
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
