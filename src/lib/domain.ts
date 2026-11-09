import type { Tables } from "@/integrations/supabase/types";

export type UserType = "LANDLORD" | "SEEKER";
export type SwipeAction = "SMASH" | "PASS";
export type Landlord = Tables<"landlord_profiles">;
export type Seeker = Tables<"seeker_profiles">;
export type Photo = Tables<"photos">;

export type LandlordFeedItem = Landlord & { user_type: "LANDLORD"; photos: string[]; distance_km?: number | null };
export type SeekerFeedItem = Seeker & { user_type: "SEEKER"; photos: string[] };
export type FeedItem = LandlordFeedItem | SeekerFeedItem;

export type MatchItem = {
  match_id: string;
  created_at: string;
  other_user_id: string;
  other_type: UserType;
  display_name: string;
  subtitle: string;
  photo_url: string | null;
  last_message: { content: string; sender_id: string; created_at: string } | null;
  unread_count: number;
};

export const HOBBIES = ["Musica", "Cinema", "Cucina", "Lettura", "Viaggi", "Gaming", "Arte", "Fotografia", "Serie TV", "Yoga"];
export const SPORTS = ["Calcio", "Basket", "Tennis", "Ciclismo", "Corsa", "Palestra", "Nuoto", "Arrampicata", "Padel", "Yoga"];
export const SCHEDULES = ["Mattiniero", "Notturno", "Flessibile", "9-18", "Smart working"];
export const LANGUAGES = ["Italiano", "Inglese", "Spagnolo", "Francese", "Tedesco", "Arabo", "Cinese", "Portoghese"];

export const roleLabel = (t: UserType) => (t === "LANDLORD" ? "Proprietario" : "Cerca stanza");
export const PHOTO_LIMIT: Record<UserType, number> = { LANDLORD: 8, SEEKER: 6 };

export const DEMO_PASSWORD = "MatchHouseDemo2026";
export const DEMO_ACCOUNTS: Record<UserType, string> = {
  LANDLORD: "demo.proprietario@matchhouse.demo",
  SEEKER: "demo.cercatore@matchhouse.demo",
};
