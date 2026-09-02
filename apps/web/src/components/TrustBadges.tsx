"use client";

import { ShieldCheck, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function TitleVerifiedBadge({ className = "" }: { className?: string }) {
  const t = useTranslations("trustBadges");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ${className}`}
      title={t("titleVerifiedTooltip")}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {t("titleVerified")}
    </span>
  );
}

export function VerifiedAgentBadge({ className = "" }: { className?: string }) {
  const t = useTranslations("trustBadges");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ${className}`}
      title={t("verifiedAgentTooltip")}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {t("verifiedAgent")}
    </span>
  );
}
