import type { Landlord, Seeker } from "./domain";

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/**
 * Percentuale di compatibilità tra un cercatore e un annuncio (0-100).
 * Pesi: budget 35, città 25, fumo 15, animali 15, disponibilità 10.
 */
export function compatibility(seeker: Seeker, landlord: Landlord): number {
  let score = 0;
  const rent = Number(landlord.rent);
  const max = seeker.budget_max == null ? null : Number(seeker.budget_max);
  const min = seeker.budget_min == null ? null : Number(seeker.budget_min);
  if (max == null || rent <= max) score += min != null && rent < min * 0.8 ? 25 : 35;
  else if (rent <= max * 1.15) score += 15;

  if (!seeker.preferred_city || norm(landlord.city).includes(norm(seeker.preferred_city))) score += 25;

  if (!seeker.smoker || landlord.smoking_allowed) score += 15;
  if (!seeker.has_pets || landlord.pets_allowed) score += 15;

  if (!seeker.move_in_date || landlord.available_from <= seeker.move_in_date) score += 10;
  else score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}
