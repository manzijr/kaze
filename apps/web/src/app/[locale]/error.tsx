"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-32 text-center">
      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">{t("loadFailedTitle")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("loadFailedBody")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        {t("retry")}
      </button>
    </div>
  );
}
