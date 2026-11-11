import { useState } from "react";
import type { FeedItem } from "@/lib/domain";
import { euro, floorLabel, shortDate } from "@/lib/format";
import { Tag } from "./ui";
import { cn } from "@/lib/utils";

export function PhotoGallery({ photos, className }: { photos: string[]; className?: string }) {
  const [i, setI] = useState(0);
  if (!photos.length) return <div className={cn("flex items-center justify-center bg-surface text-sm text-muted-foreground", className)}>Nessuna foto</div>;
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <img src={photos[i]} alt="" draggable={false} className="h-full w-full select-none object-cover" />
      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-0 top-2 flex justify-center gap-1 px-3">
            {photos.map((_, k) => (
              <button key={k} aria-label={`Foto ${k + 1}`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setI(k); }}
                className={cn("h-1 flex-1 rounded-full", k === i ? "bg-background" : "bg-background/45")} />
            ))}
          </div>
          <button aria-label="Foto precedente" className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); setI((i - 1 + photos.length) % photos.length); }} />
          <button aria-label="Foto successiva" className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); setI((i + 1) % photos.length); }} />
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><div className="label-caps">{title}</div><div className="whitespace-pre-line text-[15px] text-foreground/85">{children}</div></div>;
}
function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border">
      {items.map(([k, v]) => <div key={k} className="px-2 py-3 text-center"><div className="text-[17px] font-medium">{v}</div><div className="text-xs text-muted-foreground">{k}</div></div>)}
    </div>
  );
}

export function ProfileBody({ p, compat }: { p: FeedItem; compat?: number | null }) {
  if (p.user_type === "LANDLORD") {
    const tags: [boolean, string, boolean?][] = [[p.furnished, "Arredato"], [p.bills_included, "Spese incluse", true], [p.wifi_included, "Wi-Fi"], [p.pets_allowed, "Animali ok"], [p.smoking_allowed, "Fumatori ok"], [p.parking_available, "Parcheggio"]];
    return (
      <div className="space-y-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[22px] leading-7">{p.title}</h2>
            <span className="shrink-0 text-[20px] font-medium text-smash">{euro(p.rent)}/mo</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{p.address}, {p.city}</p>
          <p className="text-sm text-muted-foreground">{p.square_meters ? `${p.square_meters} m² · ` : ""}Piano {floorLabel(p.floor)}{p.distance_km != null ? ` · ${p.distance_km.toFixed(1)} km` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {compat != null && <Tag tone="smash">{compat}% compatibile</Tag>}
          {tags.filter((t) => t[0]).map((t) => <Tag key={t[1]} tone={t[2] ? "smash" : "neutral"}>{t[1]}</Tag>)}
        </div>
        <Stats items={[["Stanze libere", String(p.available_rooms)], ["Coinquilini", String(p.current_tenants)], ["Disponibile dal", shortDate(p.available_from)]]} />
        <Section title="Descrizione">{p.description}</Section>
        {p.house_rules && <Section title="Regole di casa">{p.house_rules}</Section>}
        {p.neighborhood_info && <Section title="Zona">{p.neighborhood_info}</Section>}
      </div>
    );
  }
  return (
    <div className="space-y-5 p-5">
      <div>
        <h2 className="text-[22px] leading-7">{p.first_name} {p.last_name}, <span className="text-muted-foreground">{p.age} anni</span></h2>
        <p className="mt-1 text-sm text-muted-foreground">{p.occupation}{p.university ? ` · ${p.university}` : p.company ? ` · ${p.company}` : ""}</p>
        {(p.budget_min != null || p.budget_max != null) && <p className="mt-1 text-[15px] font-medium text-smash">Budget: {euro(p.budget_min)} – {euro(p.budget_max)}/mo</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {compat != null && <Tag tone="smash">{compat}% compatibile</Tag>}
        {p.smoker && <Tag>Fumatore</Tag>}{p.has_pets && <Tag>Ha animali</Tag>}
        {p.preferred_city && <Tag>{p.preferred_city}</Tag>}
        {p.languages.map((l) => <Tag key={l}>{l}</Tag>)}
      </div>
      <Stats items={[["Pulizia", `${p.cleanliness}/5`], ["Rumore", `${p.noise_level}/5`], ["Orari", p.schedule ?? "—"]]} />
      <Section title="Bio">{p.bio}</Section>
      {p.hobbies.length > 0 && <Section title="Hobby">{p.hobbies.join(" · ")}</Section>}
      {p.sports.length > 0 && <Section title="Sport">{p.sports.join(" · ")}</Section>}
    </div>
  );
}
