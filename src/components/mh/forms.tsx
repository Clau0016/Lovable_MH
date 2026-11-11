import { lazy, Suspense, useState } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { geocode, removeStoredPhoto } from "@/lib/media";
import { HOBBIES, LANGUAGES, SCHEDULES, SPORTS, type Landlord, type Seeker, type Photo } from "@/lib/domain";
import { Btn, ChipGroup, Field, Scale, TextArea, TextInput, Chip } from "./ui";
import type { PickedPhoto } from "./PhotoPicker";
import { ClientOnly } from "@tanstack/react-router";

const LocationPicker = lazy(() => import("./LocationPicker"));

export type LandlordDraft = Omit<Landlord, "user_id" | "created_at" | "updated_at" | "is_active" | "rent" | "square_meters" | "floor"> & {
  rent: string; square_meters: string; floor: string; is_active: boolean;
};
export type SeekerDraft = Omit<Seeker, "user_id" | "created_at" | "updated_at" | "age" | "budget_min" | "budget_max"> & {
  age: string; budget_min: string; budget_max: string;
};
type Errors = Record<string, string>;

export const emptyLandlord = (l?: Landlord | null): LandlordDraft => ({
  title: l?.title ?? "", address: l?.address ?? "", city: l?.city ?? "", latitude: l?.latitude ?? 0, longitude: l?.longitude ?? 0,
  rent: l ? String(Number(l.rent)) : "", total_rooms: l?.total_rooms ?? 3, available_rooms: l?.available_rooms ?? 1, current_tenants: l?.current_tenants ?? 2,
  square_meters: l?.square_meters ? String(l.square_meters) : "", floor: l?.floor != null ? String(l.floor) : "",
  furnished: l?.furnished ?? false, bills_included: l?.bills_included ?? false, pets_allowed: l?.pets_allowed ?? false, smoking_allowed: l?.smoking_allowed ?? false,
  wifi_included: l?.wifi_included ?? true, parking_available: l?.parking_available ?? false,
  available_from: l?.available_from ?? new Date().toISOString().slice(0, 10), description: l?.description ?? "", house_rules: l?.house_rules ?? "",
  neighborhood_info: l?.neighborhood_info ?? "", is_active: l?.is_active ?? true,
});
export const emptySeeker = (s?: Seeker | null): SeekerDraft => ({
  first_name: s?.first_name ?? "", last_name: s?.last_name ?? "", age: s ? String(s.age) : "", bio: s?.bio ?? "", occupation: s?.occupation ?? "",
  university: s?.university ?? "", company: s?.company ?? "", smoker: s?.smoker ?? false, has_pets: s?.has_pets ?? false, schedule: s?.schedule ?? null,
  cleanliness: s?.cleanliness ?? 3, noise_level: s?.noise_level ?? 2, budget_min: s?.budget_min != null ? String(Number(s.budget_min)) : "",
  budget_max: s?.budget_max != null ? String(Number(s.budget_max)) : "", preferred_city: s?.preferred_city ?? "", move_in_date: s?.move_in_date ?? null,
  hobbies: s?.hobbies ?? [], sports: s?.sports ?? [], languages: s?.languages ?? ["Italiano"],
});

// ---------- validation per step ----------
export function validateLandlord(d: LandlordDraft, step: number): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (d.title.trim().length < 3) e.title = "Inserisci un titolo (min. 3 caratteri)";
    if (d.address.trim().length < 3) e.address = "Inserisci l'indirizzo";
    if (d.city.trim().length < 2) e.city = "Inserisci la città";
    if (!(Number(d.rent) > 0)) e.rent = "Inserisci un affitto valido";
    if (d.latitude === 0 && d.longitude === 0) e.location = "Trova la posizione sulla mappa";
  }
  if (step === 2) {
    if (d.available_rooms > d.total_rooms) e.available_rooms = "Più stanze disponibili che totali";
  }
  if (step === 3) {
    if (!d.available_from) e.available_from = "Scegli una data";
    if (d.description.trim().length < 20) e.description = "Almeno 20 caratteri";
  }
  return e;
}
export function validateSeeker(d: SeekerDraft, step: number): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!d.first_name.trim()) e.first_name = "Inserisci il nome";
    if (!d.last_name.trim()) e.last_name = "Inserisci il cognome";
    const a = Number(d.age);
    if (!Number.isInteger(a) || a < 18 || a > 99) e.age = "Età non valida (18-99)";
  }
  if (step === 3) {
    if (d.occupation.trim().length < 2) e.occupation = "Inserisci l'occupazione";
    if (d.bio.trim().length < 20) e.bio = "Almeno 20 caratteri";
  }
  if (step === 4) {
    if (d.budget_min && d.budget_max && Number(d.budget_max) < Number(d.budget_min)) e.budget_max = "Il budget massimo deve essere maggiore del minimo";
  }
  return e;
}

// ---------- landlord steps ----------
export function LandlordStep({ step, d, set, errors }: { step: number; d: LandlordDraft; set: (p: Partial<LandlordDraft>) => void; errors: Errors }) {
  const [finding, setFinding] = useState(false);
  const [geoErr, setGeoErr] = useState("");
  if (step === 1) {
    const find = async () => {
      setFinding(true); setGeoErr("");
      const r = await geocode(`${d.address}, ${d.city}`).catch(() => null);
      setFinding(false);
      if (r) set({ latitude: r.lat, longitude: r.lng });
      else { setGeoErr("Indirizzo non trovato: tocca la mappa per posizionare il pin"); if (!d.latitude) set({ latitude: 41.9, longitude: 12.5 }); }
    };
    return (
      <div className="space-y-4">
        <Field label="Titolo annuncio *" error={errors.title}><TextInput value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Stanza singola luminosa in centro" maxLength={120} /></Field>
        <Field label="Indirizzo *" error={errors.address}><TextInput value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="Via Roma, 10" /></Field>
        <Field label="Città *" error={errors.city}><TextInput value={d.city} onChange={(e) => set({ city: e.target.value })} placeholder="Milano" /></Field>
        <Field label="Affitto mensile (€) *" error={errors.rent} hint="Escludi o includi le spese nel passo successivo"><TextInput inputMode="numeric" value={d.rent} onChange={(e) => set({ rent: e.target.value.replace(/[^\d.]/g, "") })} placeholder="650" /></Field>
        <div className="space-y-2">
          <Btn type="button" variant="outline" className="w-full" loading={finding} onClick={find} disabled={!d.address || !d.city}><MapPin className="size-4" />Trova sulla mappa</Btn>
          {(errors.location || geoErr) && <p className="text-xs text-pass">{geoErr || errors.location}</p>}
          {(d.latitude !== 0 || d.longitude !== 0) && (
            <ClientOnly fallback={<div className="h-56 rounded-2xl bg-surface" />}>
              <Suspense fallback={<div className="h-56 rounded-2xl bg-surface" />}>
                <LocationPicker lat={d.latitude} lng={d.longitude} onChange={(lat, lng) => set({ latitude: lat, longitude: lng })} />
              </Suspense>
              <p className="text-xs text-muted-foreground">Trascina il pin o tocca la mappa per correggere la posizione.</p>
            </ClientOnly>
          )}
        </div>
      </div>
    );
  }
  if (step === 2) {
    const Num = ({ k, label }: { k: "total_rooms" | "available_rooms" | "current_tenants"; label: string }) => (
      <Field label={label} error={errors[k]}><TextInput type="number" min={0} max={20} value={d[k]} onChange={(e) => set({ [k]: Math.max(0, Math.min(20, Number(e.target.value))) })} /></Field>
    );
    const feats: [keyof LandlordDraft, string][] = [["furnished", "Arredato"], ["bills_included", "Spese incluse"], ["wifi_included", "Wi-Fi incluso"], ["pets_allowed", "Animali ok"], ["smoking_allowed", "Fumatori ok"], ["parking_available", "Parcheggio"]];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3"><Num k="total_rooms" label="Stanze totali" /><Num k="available_rooms" label="Disponibili" /><Num k="current_tenants" label="Coinquilini" /></div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Piano" hint="Vuoto = terra"><TextInput inputMode="numeric" value={d.floor} onChange={(e) => set({ floor: e.target.value.replace(/[^\d-]/g, "") })} placeholder="T" /></Field>
          <Field label="Superficie m²"><TextInput inputMode="numeric" value={d.square_meters} onChange={(e) => set({ square_meters: e.target.value.replace(/\D/g, "") })} placeholder="80" /></Field>
        </div>
        <div className="space-y-2"><span className="label-caps">Caratteristiche</span>
          <div className="flex flex-wrap gap-2">{feats.map(([k, l]) => <Chip key={k} active={Boolean(d[k])} onClick={() => set({ [k]: !d[k] })}>{l}</Chip>)}</div>
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="space-y-4">
        <Field label="Disponibile dal *" error={errors.available_from}><TextInput type="date" value={d.available_from} onChange={(e) => set({ available_from: e.target.value })} /></Field>
        <Field label="Descrizione *" error={errors.description}><TextArea value={d.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} placeholder="Racconta tutto sull'appartamento, la zona, l'atmosfera..." /></Field>
        <Field label="Regole di casa"><TextArea rows={3} value={d.house_rules ?? ""} maxLength={1000} onChange={(e) => set({ house_rules: e.target.value })} placeholder="No feste, pulizie a rotazione..." /></Field>
        <Field label="Info zona"><TextArea rows={3} value={d.neighborhood_info ?? ""} maxLength={1000} onChange={(e) => set({ neighborhood_info: e.target.value })} placeholder="Metro a 5 minuti, supermercato sotto casa..." /></Field>
      </div>
    );
  }
  return null;
}

// ---------- seeker steps ----------
export function SeekerStep({ step, d, set, errors }: { step: number; d: SeekerDraft; set: (p: Partial<SeekerDraft>) => void; errors: Errors }) {
  if (step === 1) return (
    <div className="space-y-4">
      <Field label="Nome *" error={errors.first_name}><TextInput value={d.first_name} maxLength={50} onChange={(e) => set({ first_name: e.target.value })} /></Field>
      <Field label="Cognome *" error={errors.last_name}><TextInput value={d.last_name} maxLength={50} onChange={(e) => set({ last_name: e.target.value })} /></Field>
      <Field label="Età *" error={errors.age}><TextInput inputMode="numeric" value={d.age} onChange={(e) => set({ age: e.target.value.replace(/\D/g, "") })} /></Field>
    </div>
  );
  if (step === 2) return (
    <div className="space-y-5">
      <div className="space-y-2"><span className="label-caps">Abitudini</span>
        <div className="flex gap-2"><Chip active={d.smoker} onClick={() => set({ smoker: !d.smoker })}>Fumatore</Chip><Chip active={d.has_pets} onClick={() => set({ has_pets: !d.has_pets })}>Ho animali</Chip></div></div>
      <div className="space-y-2"><span className="label-caps">Pulizia (1–5)</span><Scale value={d.cleanliness} onChange={(n) => set({ cleanliness: n })} /></div>
      <div className="space-y-2"><span className="label-caps">Rumore (1–5)</span><Scale value={d.noise_level} onChange={(n) => set({ noise_level: n })} /></div>
      <div className="space-y-2"><span className="label-caps">Hobby</span><ChipGroup options={HOBBIES} value={d.hobbies} onChange={(v) => set({ hobbies: v })} /></div>
      <div className="space-y-2"><span className="label-caps">Sport</span><ChipGroup options={SPORTS} value={d.sports} onChange={(v) => set({ sports: v })} /></div>
    </div>
  );
  if (step === 3) return (
    <div className="space-y-4">
      <Field label="Occupazione *" error={errors.occupation}><TextInput value={d.occupation} maxLength={80} onChange={(e) => set({ occupation: e.target.value })} placeholder="Studente, Sviluppatore, Designer" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Università"><TextInput value={d.university ?? ""} maxLength={100} onChange={(e) => set({ university: e.target.value })} /></Field>
        <Field label="Azienda"><TextInput value={d.company ?? ""} maxLength={100} onChange={(e) => set({ company: e.target.value })} /></Field>
      </div>
      <Field label="Bio *" error={errors.bio}><TextArea value={d.bio} maxLength={1000} onChange={(e) => set({ bio: e.target.value })} placeholder="Presentati: cosa ami fare, come sei come coinquilino..." /></Field>
      <div className="space-y-2"><span className="label-caps">Orari</span><ChipGroup single options={SCHEDULES} value={d.schedule ? [d.schedule] : []} onChange={(v) => set({ schedule: v[0] ?? null })} /></div>
      <div className="space-y-2"><span className="label-caps">Lingue</span><ChipGroup options={LANGUAGES} value={d.languages} onChange={(v) => set({ languages: v })} /></div>
    </div>
  );
  if (step === 4) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Budget min (€)"><TextInput inputMode="numeric" value={d.budget_min} onChange={(e) => set({ budget_min: e.target.value.replace(/\D/g, "") })} placeholder="300" /></Field>
        <Field label="Budget max (€)" error={errors.budget_max}><TextInput inputMode="numeric" value={d.budget_max} onChange={(e) => set({ budget_max: e.target.value.replace(/\D/g, "") })} placeholder="700" /></Field>
      </div>
      <Field label="Città preferita"><TextInput value={d.preferred_city ?? ""} maxLength={80} onChange={(e) => set({ preferred_city: e.target.value })} placeholder="Milano" /></Field>
      <Field label="Data di ingresso" hint="Vuoto = flessibile"><TextInput type="date" value={d.move_in_date ?? ""} onChange={(e) => set({ move_in_date: e.target.value || null })} /></Field>
    </div>
  );
  return null;
}

// ---------- save ----------
const nn = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);

export async function saveLandlord(userId: string, d: LandlordDraft, exists: boolean) {
  const row = {
    user_id: userId, title: d.title.trim(), address: d.address.trim(), city: d.city.trim(), latitude: d.latitude, longitude: d.longitude,
    rent: Number(d.rent), total_rooms: d.total_rooms, available_rooms: d.available_rooms, current_tenants: d.current_tenants,
    square_meters: d.square_meters ? Number(d.square_meters) : null, floor: d.floor ? Number(d.floor) : null,
    furnished: d.furnished, bills_included: d.bills_included, pets_allowed: d.pets_allowed, smoking_allowed: d.smoking_allowed,
    wifi_included: d.wifi_included, parking_available: d.parking_available, available_from: d.available_from,
    description: d.description.trim(), house_rules: nn(d.house_rules), neighborhood_info: nn(d.neighborhood_info),
    is_active: d.available_rooms > 0 ? d.is_active : false,
  };
  const { error } = exists ? await supabase.from("landlord_profiles").update(row).eq("user_id", userId) : await supabase.from("landlord_profiles").insert(row);
  if (error) throw error;
}
export async function saveSeeker(userId: string, d: SeekerDraft, exists: boolean) {
  const row = {
    user_id: userId, first_name: d.first_name.trim(), last_name: d.last_name.trim(), age: Number(d.age), bio: d.bio.trim(), occupation: d.occupation.trim(),
    university: nn(d.university), company: nn(d.company), smoker: d.smoker, has_pets: d.has_pets, schedule: d.schedule,
    cleanliness: d.cleanliness, noise_level: d.noise_level, budget_min: d.budget_min ? Number(d.budget_min) : null, budget_max: d.budget_max ? Number(d.budget_max) : null,
    preferred_city: nn(d.preferred_city), move_in_date: d.move_in_date, hobbies: d.hobbies, sports: d.sports, languages: d.languages,
  };
  const { error } = exists ? await supabase.from("seeker_profiles").update(row).eq("user_id", userId) : await supabase.from("seeker_profiles").insert(row);
  if (error) throw error;
}
/** Sincronizza le foto: elimina le rimosse, inserisce le nuove, aggiorna l'ordine. */
export async function syncPhotos(userId: string, current: Photo[], next: PickedPhoto[]) {
  const keep = new Set(next.map((p) => p.url));
  const removed = current.filter((p) => !keep.has(p.url));
  if (removed.length) {
    await supabase.from("photos").delete().in("id", removed.map((p) => p.id));
    await Promise.all(removed.map((p) => removeStoredPhoto(p.storage_path)));
  }
  for (const [i, p] of next.entries()) {
    const existing = current.find((c) => c.url === p.url);
    if (existing) { if (existing.position !== i) await supabase.from("photos").update({ position: i }).eq("id", existing.id); }
    else { const { error } = await supabase.from("photos").insert({ user_id: userId, url: p.url, storage_path: p.path, position: i }); if (error) throw error; }
  }
}
