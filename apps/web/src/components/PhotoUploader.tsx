"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_PREFIX = "/storage/v1/object/public/listing-photos/";

type Photo = { id: string; url: string };

export function PhotoUploader({
  listingId,
  initialPhotos,
}: {
  listingId: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      for (const file of Array.from(files)) {
        const path = `${listingId}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-photos").getPublicUrl(path);

        const { data: photo, error: insertError } = await supabase
          .from("listing_photos")
          .insert({ listing_id: listingId, url: publicUrl, sort_order: photos.length })
          .select()
          .single();
        if (insertError) throw insertError;

        setPhotos((prev) => [...prev, photo]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: Photo) {
    const supabase = createClient();
    const path = photo.url.split(STORAGE_PREFIX)[1];
    if (path) {
      await supabase.storage.from("listing-photos").remove([path]);
    }
    const { error: deleteError } = await supabase
      .from("listing_photos")
      .delete()
      .eq("id", photo.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element -- listing photos are user-uploaded, remote-hosted URLs */}
            <img src={photo.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <label className="mt-4 inline-block cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
        {uploading ? "Uploading…" : "Add photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
