"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  verification_status: string;
  verification_notes: string | null;
  id_document_url: string | null;
  business_registration_url: string | null;
} | null;

const statusCopy: Record<string, { label: string; className: string }> = {
  none: { label: "Not submitted", className: "bg-muted text-muted-foreground" },
  pending: { label: "Under review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  verified: { label: "Verified", className: "bg-accent/10 text-accent" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

export function VerificationForm({ userId, profile }: { userId: string; profile: Profile }) {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(profile?.verification_status ?? "none");

  const badge = statusCopy[status] ?? statusCopy.none;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idFile) {
      setError("Upload your national ID or passport.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    try {
      const idPath = `${userId}/id-${crypto.randomUUID()}-${idFile.name}`;
      const { error: idErr } = await supabase.storage
        .from("verification-docs")
        .upload(idPath, idFile);
      if (idErr) throw idErr;

      let bizPath: string | null = null;
      if (bizFile) {
        bizPath = `${userId}/bizreg-${crypto.randomUUID()}-${bizFile.name}`;
        const { error: bizErr } = await supabase.storage
          .from("verification-docs")
          .upload(bizPath, bizFile);
        if (bizErr) throw bizErr;
      }

      const { error: updateErr } = await supabase
        .from("users")
        .update({
          id_document_url: idPath,
          business_registration_url: bizPath ?? profile?.business_registration_url ?? null,
          verification_status: "pending",
          verification_notes: null,
        })
        .eq("id", userId);
      if (updateErr) throw updateErr;

      setStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>

      {status === "rejected" && profile?.verification_notes && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {profile.verification_notes}
        </p>
      )}

      {status !== "pending" && status !== "verified" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">National ID or passport</label>
            <input
              type="file"
              accept="image/*,.pdf"
              required
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Business registration (RDB certificate) — agencies only
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setBizFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      )}

      {status === "pending" && (
        <p className="text-sm text-muted-foreground">
          Your documents are under review. This usually takes a day or two.
        </p>
      )}
    </div>
  );
}
