"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({
  listingId,
  userId,
  initialFavorited,
  className = "",
}: {
  listingId: string;
  userId: string | null;
  initialFavorited: boolean;
  className?: string;
}) {
  const t = useTranslations("favorite");
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/login");
      return;
    }

    setPending(true);
    const supabase = createClient();
    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
      setFavorited(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
      setFavorited(true);
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={favorited ? t("remove") : t("save")}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : "text-foreground"}`}
      />
    </button>
  );
}
