import { ShieldCheck, BadgeCheck } from "lucide-react";

export function TitleVerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ${className}`}
      title="This listing's ownership documents were reviewed by our team. Verification confirms the documents provided match the listing, not that the sale itself is risk-free — always do your own due diligence."
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Title Verified
    </span>
  );
}

export function VerifiedAgentBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ${className}`}
      title="This agent/owner submitted ID (and business registration, if an agency) for manual review by our team."
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified Agent
    </span>
  );
}
