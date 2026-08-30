"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/googleMaps";

// Default center: Kigali, Rwanda.
const DEFAULT_CENTER = { lat: -1.9441, lng: 30.0619 };

export function MapPicker({
  defaultLat,
  defaultLng,
}: {
  defaultLat?: number | null;
  defaultLng?: number | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let marker: google.maps.Marker | undefined;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const center = position ?? DEFAULT_CENTER;
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: position ? 15 : 12,
          streetViewControl: false,
          mapTypeControl: false,
        });

        if (position) {
          marker = new google.maps.Marker({ position, map });
        }

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setPosition(next);
          if (marker) {
            marker.setPosition(next);
          } else {
            marker = new google.maps.Marker({ position: next, map });
          }
        });
      })
      .catch((err: Error) => setLoadError(err.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only initialize once
  }, []);

  return (
    <div>
      <p className="text-xs text-zinc-500">
        Click the map to set the property&apos;s location (optional).
      </p>
      {loadError ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t load the map: {loadError}
        </p>
      ) : (
        <div ref={mapRef} className="mt-2 h-64 w-full rounded-md bg-zinc-100 dark:bg-zinc-900" />
      )}
      <input type="hidden" name="lat" value={position?.lat ?? ""} />
      <input type="hidden" name="lng" value={position?.lng ?? ""} />
    </div>
  );
}
