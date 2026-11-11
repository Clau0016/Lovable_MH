import { ArrowLeft, ArrowRight, Plus, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadPhoto } from "@/lib/media";

export type PickedPhoto = { url: string; path: string | null; id?: string };

export function PhotoPicker({ userId, value, onChange, max }: { userId: string; value: PickedPhoto[]; onChange: (v: PickedPhoto[]) => void; max: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    let next = [...value];
    for (const f of Array.from(files).slice(0, max - value.length)) {
      try { const r = await uploadPhoto(userId, f); next = [...next, r]; onChange(next); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Upload non riuscito"); }
    }
    setBusy(false);
  };
  const move = (i: number, d: number) => { const n = [...value]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  return (
    <div className="grid grid-cols-2 gap-3">
      {value.map((p, i) => (
        <div key={p.url} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface">
          <img src={p.url} alt="" className="h-full w-full object-cover" />
          {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Principale</span>}
          <button type="button" aria-label="Rimuovi" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute right-2 top-2 rounded-full bg-background p-1"><X className="size-4" /></button>
          <div className="absolute bottom-2 right-2 flex gap-1">
            {i > 0 && <button type="button" aria-label="Sposta prima" onClick={() => move(i, -1)} className="rounded-full bg-background p-1"><ArrowLeft className="size-4" /></button>}
            {i < value.length - 1 && <button type="button" aria-label="Sposta dopo" onClick={() => move(i, 1)} className="rounded-full bg-background p-1"><ArrowRight className="size-4" /></button>}
          </div>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border-strong text-sm text-muted-foreground hover:bg-surface">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}Aggiungi
        </button>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
