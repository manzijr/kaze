"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { loadGoogleMaps } from "@/lib/googleMaps";

const DEFAULT_CENTER = { lat: -1.9441, lng: 30.0619 }; // Kigali

type MapListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  lat: number | null;
  lng: number | null;
};

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  const pinned = listings.filter(
    (l): l is MapListing & { lat: number; lng: number } => l.lat != null && l.lng != null,
  );

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: pinned[0] ?? DEFAULT_CENTER,
          zoom: pinned.length ? 12 : 11,
          streetViewControl: false,
          mapTypeControl: false,
        });

        const bounds = new google.maps.LatLngBounds();
        for (const listing of pinned) {
          const marker = new google.maps.Marker({
            position: { lat: listing.lat, lng: listing.lng },
            map,
            title: `${listing.price.toLocaleString()} ${listing.currency} — ${listing.title}`,
          });
          marker.addListener("click", () => router.push(`/listings/${listing.id}`));
          bounds.extend(marker.getPosition()!);
        }
        if (pinned.length > 1) {
          map.fitBounds(bounds);
        }
      })
      .catch((err: Error) => setLoadError(err.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-init only when the pinned set changes
  }, [pinned.map((l) => l.id).join(",")]);

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load the map: {loadError}</p>;
  }

  return (
    <div ref={mapRef} className="h-full w-full rounded-xl border border-border bg-muted" />
  );
}
