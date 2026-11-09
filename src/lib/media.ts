import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Comprime (max 1200px, ~0.4MB) e carica nella cartella {uid}/. Ritorna url firmato a lunga scadenza + path. */
export async function uploadPhoto(userId: string, file: File): Promise<{ url: string; path: string }> {
  if (!ALLOWED.includes(file.type)) throw new Error("Formato non supportato");
  if (file.size > 10 * 1024 * 1024) throw new Error("La foto supera i 10 MB");
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.4,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("photos").upload(path, compressed, { contentType: "image/jpeg" });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("photos").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Upload fallito");
  return { url: data.signedUrl, path };
}

export async function removeStoredPhoto(path: string | null) {
  if (path) await supabase.storage.from("photos").remove([path]);
}

/** Geocodifica Nominatim (solo su azione esplicita). */
export async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=it&q=${encodeURIComponent(q)}`,
    { headers: { "Accept-Language": "it" } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!json[0]) return null;
  return { lat: Number(json[0].lat), lng: Number(json[0].lon) };
}
