import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BtnVariant = "primary" | "outline" | "smash" | "pass" | "ghost" | "danger";
const btn: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-border-strong bg-background text-foreground hover:bg-surface",
  smash: "bg-smash-soft text-smash border border-smash/30 hover:bg-smash/15",
  pass: "bg-pass-soft text-pass border border-pass/30 hover:bg-pass/15",
  ghost: "text-foreground hover:bg-surface",
  danger: "text-pass hover:bg-pass-soft",
};
export function Btn({ variant = "primary", loading, className, children, disabled, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  return (
    <button {...p} disabled={disabled || loading}
      className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50", btn[variant], className)}>
      {loading && <Loader2 className="size-4 animate-spin" />}{children}
    </button>
  );
}
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label-caps">{label}</span>
      {children}
      {error ? <span className="block text-xs text-pass">{error}</span> : hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
const inputCls = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-border-strong focus:bg-background";
export const TextInput = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const TextArea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={cn(inputCls, "resize-none", p.className)} />;

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-background hover:bg-surface")}>
      {children}
    </button>
  );
}
export function ChipGroup({ options, value, onChange, single }: { options: string[]; value: string[]; onChange: (v: string[]) => void; single?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value.includes(o)} onClick={() =>
          onChange(single ? (value.includes(o) ? [] : [o]) : value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}>{o}</Chip>
      ))}
    </div>
  );
}
export function Scale({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={cn("size-11 rounded-xl border text-sm font-medium", n === value ? "border-primary bg-primary text-primary-foreground" : "border-border-strong")}>{n}</button>
      ))}
    </div>
  );
}
export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "smash" }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs", tone === "smash" ? "bg-smash-soft text-smash" : "bg-surface text-foreground")}>{children}</span>;
}
export function Loading({ label = "Caricamento…" }: { label?: string }) {
  return <div className="flex flex-1 items-center justify-center gap-2 py-20 text-muted-foreground"><Loader2 className="size-5 animate-spin" />{label}</div>;
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <h3 className="text-[17px]">Errore di connessione</h3>
      <p className="text-sm text-muted-foreground">Controlla la connessione e riprova</p>
      {onRetry && <Btn variant="outline" onClick={onRetry}>Riprova</Btn>}
    </div>
  );
}
export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
      <h3 className="text-[17px]">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 py-3 text-left">
      <span><span className="block">{label}</span>{sub && <span className="block text-xs text-muted-foreground">{sub}</span>}</span>
      <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-smash" : "bg-border-strong")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-background transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  );
}
export function Logo({ size = 56 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-2xl bg-primary text-primary-foreground" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
    </div>
  );
}
export function DemoBanner() {
  return <div className="bg-surface px-4 py-1.5 text-center text-xs text-muted-foreground">Versione demo · Non inserire dati personali reali sensibili</div>;
}
