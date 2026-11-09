import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Landlord, Photo, Seeker, UserType } from "./domain";

export type Me = {
  id: string;
  email: string;
  userType: UserType | null;
  isDemo: boolean;
  landlord: Landlord | null;
  seeker: Seeker | null;
  photos: Photo[];
  complete: boolean;
};

async function fetchMe(): Promise<Me | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const [p, l, s, ph] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("landlord_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("photos").select("*").eq("user_id", user.id).order("position"),
  ]);
  if (p.error) throw p.error;
  const userType = (p.data?.user_type ?? (user.user_metadata?.user_type as UserType | undefined) ?? null) as UserType | null;
  return {
    id: user.id,
    email: user.email ?? "",
    userType,
    isDemo: p.data?.is_demo ?? false,
    landlord: l.data ?? null,
    seeker: s.data ?? null,
    photos: ph.data ?? [],
    complete: Boolean(l.data || s.data),
  };
}

export const meQuery = queryOptions({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });

export function displayName(me: Me) {
  if (me.seeker) return `${me.seeker.first_name} ${me.seeker.last_name}`;
  if (me.landlord) return me.landlord.title;
  return me.email;
}
