"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Verification = {
  id: string;
  upi_number: string | null;
  status: string;
  notes: string | null;
} | null;

const statusCopy: Record<string, { label: string; className: string }> = {
  none: { label: "Not submitted", className: "bg-muted text-muted-foreground" },
  pending: { label: "Under review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  verified: { label: "Title verified", className: "bg-accent/10 text-accent" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

export function TitleVerificationCard({
  listingId,
  initial,
}: {
  listingId: string;
  initial: Verification;
}) {
  const [upi, setUpi] = useState(initial?.upi_number ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initial?.status ?? "none");

  const badge = statusCopy[status] ?? statusCopy.none;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!upi.trim()) {
      setError("Enter the UPI (Unique Parcel Identifier) number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    try {
      let docPath: string | undefined;
      if (file) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in.");
        docPath = `${user.id}/title-${listingId}-${crypto.randomUUID()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("verification-docs")
          .upload(docPath, file);
        if (uploadErr) throw uploadErr;
      }

      const { error: upsertErr } = await supabase.from("listing_verifications").upsert(
        {
          listing_id: listingId,
          upi_number: upi.trim(),
          ...(docPath ? { title_document_url: docPath } : {}),
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          notes: null,
        },
        { onConflict: "listing_id" },
      );
      if (upsertErr) throw upsertErr;

      const { error: listingErr } = await supabase
        .from("listings")
        .update({ title_verification_status: "pending" })
        .eq("id", listingId);
      if (listingErr) throw listingErr;

      setStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Title verification</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional, but verified listings get a trust badge buyers actively filter for.
      </p>

      {status === "rejected" && initial?.notes && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {initial.notes}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium">UPI number</label>
          <input
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            placeholder="e.g. 1/03/03/03/1234"
            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Title deed / ownership document</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
