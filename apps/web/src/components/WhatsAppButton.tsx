"use client";

import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function WhatsAppButton({
  listingId,
  phone,
  listingTitle,
  listingUrl,
}: {
  listingId: string;
  phone: string;
  listingTitle: string;
  listingUrl: string;
}) {
  const digits = phone.replace(/[^\d]/g, "");
  const message = `Hello, I'm interested in ${listingTitle} — ${listingUrl}`;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  function handleClick() {
    // Fire-and-forget; never block the outbound WhatsApp navigation on this.
    createClient().rpc("increment_whatsapp_click", { p_listing_id: listingId });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
    >
      <MessageCircle className="h-4 w-4" />
      Chat on WhatsApp
    </a>
  );
}
