"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed";

export function RecentlyViewedRail() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // localStorage isn't available during SSR; reading it here (rather than
    // in the initial useState) deliberately defers to after hydration so
    // the server-rendered ("no rail") and first-client-render markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readRecentlyViewed());
  }, []);

  if (!items.length) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Recently viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listings/${item.id}`}
            className="flex w-40 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:shadow-md"
          >
            <div className="aspect-video bg-muted">
              {item.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded listing photos
                <img src={item.photoUrl} alt={item.title} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.price.toLocaleString()} {item.currency}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
