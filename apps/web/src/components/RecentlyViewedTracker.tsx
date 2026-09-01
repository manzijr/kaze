"use client";

import { useEffect } from "react";
import { recordRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed";

export function RecentlyViewedTracker({ item }: { item: RecentlyViewedItem }) {
  useEffect(() => {
    recordRecentlyViewed(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record once per listing id, not on every field change
  }, [item.id]);

  return null;
}
