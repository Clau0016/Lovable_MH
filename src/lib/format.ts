import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";

/** Lista conversazioni: "adesso" (<1h), "14:32" (oggi), "ieri", "12 mar". */
export function listTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const mins = differenceInMinutes(now, d);
  if (mins < 60) return "adesso";
  if (isSameDay(d, now)) return format(d, "HH:mm");
  if (isYesterdayOf(d, now)) return "ieri";
  return format(d, "d MMM", { locale: it });
}

/** Bolle chat: "adesso", "5 min fa", "2h fa", "ieri", "12 mar". */
export function bubbleTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const mins = differenceInMinutes(now, d);
  if (mins < 1) return "adesso";
  if (mins < 60) return `${mins} min fa`;
  if (isSameDay(d, now)) return `${Math.floor(mins / 60)}h fa`;
  if (isYesterdayOf(d, now)) return "ieri";
  return format(d, "d MMM", { locale: it });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isYesterdayOf(d: Date, now: Date) {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return isSameDay(d, y);
}

export const euro = (n: number | string | null | undefined) => `€${Math.round(Number(n ?? 0))}`;
export const shortDate = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "d MMM yyyy", { locale: it }) : "Flessibile";
export const floorLabel = (f: number | null | undefined) => (f == null || f === 0 ? "T" : String(f));

// re-export to keep imports tidy where needed
export { isToday, isYesterday };
