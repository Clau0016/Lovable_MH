create type public.user_type as enum ('LANDLORD', 'SEEKER');
create type public.swipe_action as enum ('SMASH', 'PASS');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type public.user_type not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.landlord_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  address text not null check (char_length(address) between 3 and 200),
  city text not null check (char_length(city) between 2 and 80),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  rent numeric(8,2) not null check (rent > 0),
  total_rooms int not null check (total_rooms between 1 and 20),
  available_rooms int not null check (available_rooms between 0 and 20),
  current_tenants int not null default 0 check (current_tenants between 0 and 20),
  square_meters int check (square_meters > 0),
  floor int,
  furnished boolean not null default false,
  bills_included boolean not null default false,
  pets_allowed boolean not null default false,
  smoking_allowed boolean not null default false,
  wifi_included boolean not null default true,
  parking_available boolean not null default false,
  available_from date not null,
  description text not null check (char_length(description) between 20 and 2000),
  house_rules text check (char_length(house_rules) <= 1000),
  neighborhood_info text check (char_length(neighborhood_info) <= 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_rooms <= total_rooms)
);

create table public.seeker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 50),
  last_name text not null check (char_length(last_name) between 1 and 50),
  age int not null check (age between 18 and 99),
  bio text not null check (char_length(bio) between 20 and 1000),
  occupation text not null check (char_length(occupation) between 2 and 80),
  university text check (char_length(university) <= 100),
  company text check (char_length(company) <= 100),
  smoker boolean not null default false,
  has_pets boolean not null default false,
  schedule text,
  cleanliness int not null default 3 check (cleanliness between 1 and 5),
  noise_level int not null default 2 check (noise_level between 1 and 5),
  budget_min numeric(8,2) check (budget_min >= 0),
  budget_max numeric(8,2) check (budget_max >= 0),
  preferred_city text check (char_length(preferred_city) <= 80),
  move_in_date date,
  hobbies text[] not null default '{}',
  sports text[] not null default '{}',
  languages text[] not null default '{Italiano}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min is null or budget_max is null or budget_max >= budget_min)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  storage_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index photos_user_idx on public.photos (user_id, position);

create table public.swipes (
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now(),
  primary key (from_user, to_user),
  check (from_user <> to_user)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_match_idx on public.messages (match_id, created_at desc);

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.landlord_profiles to authenticated;
grant select, insert, update, delete on public.seeker_profiles to authenticated;
grant select, insert, update, delete on public.photos to authenticated;
grant select on public.swipes to authenticated;
grant select, delete on public.matches to authenticated;
grant select, insert on public.messages to authenticated;
grant all on public.profiles, public.landlord_profiles, public.seeker_profiles, public.photos, public.swipes, public.matches, public.messages to service_role;

create function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_landlord_updated before update on public.landlord_profiles for each row execute function public.set_updated_at();
create trigger trg_seeker_updated before update on public.seeker_profiles for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data->>'user_type' in ('LANDLORD','SEEKER') then
    insert into public.profiles (id, user_type, is_demo)
    values (new.id, (new.raw_user_meta_data->>'user_type')::public.user_type,
            coalesce((new.raw_user_meta_data->>'is_demo')::boolean, false))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.enforce_photo_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_max int; v_cnt int;
begin
  select case user_type when 'LANDLORD' then 8 else 6 end into v_max from public.profiles where id = new.user_id;
  select count(*) into v_cnt from public.photos where user_id = new.user_id;
  if v_cnt >= v_max then raise exception 'Numero massimo di foto raggiunto'; end if;
  return new;
end $$;
create trigger trg_photo_limit before insert on public.photos for each row execute function public.enforce_photo_limit();

alter table public.profiles enable row level security;
alter table public.landlord_profiles enable row level security;
alter table public.seeker_profiles enable row level security;
alter table public.photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (true);
create policy landlord_read on public.landlord_profiles for select to authenticated using (true);
create policy landlord_insert on public.landlord_profiles for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'LANDLORD'));
create policy landlord_update on public.landlord_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy landlord_delete on public.landlord_profiles for delete to authenticated using (user_id = auth.uid());
create policy seeker_read on public.seeker_profiles for select to authenticated using (true);
create policy seeker_insert on public.seeker_profiles for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'SEEKER'));
create policy seeker_update on public.seeker_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy seeker_delete on public.seeker_profiles for delete to authenticated using (user_id = auth.uid());
create policy photos_read on public.photos for select to authenticated using (true);
create policy photos_insert on public.photos for insert to authenticated with check (user_id = auth.uid());
create policy photos_update on public.photos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy photos_delete on public.photos for delete to authenticated using (user_id = auth.uid());
create policy swipes_read on public.swipes for select to authenticated using (from_user = auth.uid());
create policy matches_read on public.matches for select to authenticated using (auth.uid() in (user_a, user_b));
create policy matches_delete on public.matches for delete to authenticated using (auth.uid() in (user_a, user_b));
create policy messages_read on public.messages for select to authenticated
  using (exists (select 1 from public.matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)));
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and exists (select 1 from public.matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)));

create function public.swipe(p_to_user uuid, p_action public.swipe_action) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_me uuid := auth.uid(); v_match_id uuid; v_recent int;
begin
  if v_me is null then raise exception 'Non autenticato'; end if;
  if v_me = p_to_user then raise exception 'Non puoi fare swipe su te stesso'; end if;
  if (select user_type from profiles where id = v_me) is not distinct from (select user_type from profiles where id = p_to_user) then
    raise exception 'Combinazione di ruoli non valida';
  end if;
  select count(*) into v_recent from swipes where from_user = v_me and created_at > now() - interval '1 minute';
  if v_recent >= 60 then raise exception 'Troppi swipe, riprova tra un minuto'; end if;
  insert into swipes (from_user, to_user, action) values (v_me, p_to_user, p_action)
  on conflict (from_user, to_user) do update set action = excluded.action, created_at = now();
  if p_action = 'SMASH' then
    if exists (select 1 from profiles where id = p_to_user and is_demo)
       and not exists (select 1 from swipes where from_user = p_to_user and to_user = v_me)
       and (get_byte(decode(md5(p_to_user::text || v_me::text), 'hex'), 0) % 10) < 7 then
      insert into swipes (from_user, to_user, action, created_at) values (p_to_user, v_me, 'SMASH', now() - interval '2 minutes') on conflict do nothing;
    end if;
    if exists (select 1 from swipes where from_user = p_to_user and to_user = v_me and action = 'SMASH') then
      insert into matches (user_a, user_b) values (least(v_me, p_to_user), greatest(v_me, p_to_user)) on conflict (user_a, user_b) do nothing;
      select id into v_match_id from matches where user_a = least(v_me, p_to_user) and user_b = greatest(v_me, p_to_user);
    end if;
  end if;
  return jsonb_build_object('matched', v_match_id is not null, 'match_id', v_match_id);
end $$;

create function public.undo_swipe(p_to_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  delete from matches where user_a = least(auth.uid(), p_to_user) and user_b = greatest(auth.uid(), p_to_user)
    and not exists (select 1 from messages x where x.match_id = matches.id);
  delete from swipes where from_user = auth.uid() and to_user = p_to_user;
end $$;

create function public.discover_feed(
  p_city text default null, p_budget_max numeric default null,
  p_lat double precision default null, p_lng double precision default null,
  p_radius_km double precision default null, p_limit int default 20
) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := auth.uid(); v_type public.user_type; v_result jsonb;
begin
  select user_type into v_type from profiles where id = v_me;
  if v_type is null then raise exception 'Non autenticato'; end if;
  if v_type = 'SEEKER' then
    select coalesce(jsonb_agg(r.j order by r.rn), '[]'::jsonb) into v_result from (
      select row_number() over (order by hp.has_photo desc, d.km asc nulls last, l.created_at asc) as rn,
        to_jsonb(l) || jsonb_build_object('user_type','LANDLORD','distance_km', d.km,
          'photos', (select coalesce(jsonb_agg(ph.url order by ph.position), '[]'::jsonb) from photos ph where ph.user_id = l.user_id)) as j
      from landlord_profiles l
      cross join lateral (select case when p_lat is null or p_lng is null then null::double precision
        else 2 * 6371 * asin(least(1.0, sqrt(power(sin(radians(l.latitude - p_lat) / 2), 2)
          + cos(radians(p_lat)) * cos(radians(l.latitude)) * power(sin(radians(l.longitude - p_lng) / 2), 2)))) end as km) d
      cross join lateral (select exists (select 1 from photos ph where ph.user_id = l.user_id) as has_photo) hp
      where l.user_id <> v_me and l.is_active and l.available_rooms > 0
        and not exists (select 1 from swipes s where s.from_user = v_me and s.to_user = l.user_id)
        and (p_city is null or l.city ilike '%' || p_city || '%')
        and (p_budget_max is null or l.rent <= p_budget_max)
        and (p_radius_km is null or d.km is null or d.km <= p_radius_km)
      order by rn limit least(coalesce(p_limit, 20), 50)) r;
  else
    select coalesce(jsonb_agg(r.j order by r.rn), '[]'::jsonb) into v_result from (
      select row_number() over (order by hp.has_photo desc, s.created_at asc) as rn,
        to_jsonb(s) || jsonb_build_object('user_type','SEEKER',
          'photos', (select coalesce(jsonb_agg(ph.url order by ph.position), '[]'::jsonb) from photos ph where ph.user_id = s.user_id)) as j
      from seeker_profiles s
      cross join lateral (select exists (select 1 from photos ph where ph.user_id = s.user_id) as has_photo) hp
      where s.user_id <> v_me
        and not exists (select 1 from swipes w where w.from_user = v_me and w.to_user = s.user_id)
        and (p_city is null or s.preferred_city is null or s.preferred_city ilike '%' || p_city || '%')
        and (p_budget_max is null or s.budget_max is null or s.budget_max <= p_budget_max)
      order by rn limit least(coalesce(p_limit, 20), 50)) r;
  end if;
  return v_result;
end $$;

create function public.map_properties(p_city text default null, p_budget_max numeric default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(l) || jsonb_build_object('user_type','LANDLORD','photos',
    (select coalesce(jsonb_agg(ph.url order by ph.position), '[]'::jsonb) from photos ph where ph.user_id = l.user_id))), '[]'::jsonb)
  from (select * from landlord_profiles where is_active and available_rooms > 0
          and (p_city is null or city ilike '%' || p_city || '%')
          and (p_budget_max is null or rent <= p_budget_max)
        order by created_at limit 100) l;
$$;

create function public.my_matches() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(t.j order by t.sort_at desc), '[]'::jsonb) from (
    select coalesce(lm.created_at, m.created_at) as sort_at,
      jsonb_build_object('match_id', m.id, 'created_at', m.created_at, 'other_user_id', o.id, 'other_type', o.user_type,
        'display_name', case when o.user_type = 'SEEKER' then sp.first_name || ' ' || sp.last_name else lp.title end,
        'subtitle', case when o.user_type = 'SEEKER' then sp.occupation else lp.city || ' · €' || lp.rent::int || '/mo' end,
        'photo_url', (select ph.url from photos ph where ph.user_id = o.id order by ph.position limit 1),
        'last_message', case when lm.id is null then null else jsonb_build_object('content', lm.content, 'sender_id', lm.sender_id, 'created_at', lm.created_at) end,
        'unread_count', (select count(*) from messages x where x.match_id = m.id and x.sender_id <> auth.uid() and not x.read)) as j
    from matches m
    join profiles o on o.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
    left join seeker_profiles sp on sp.user_id = o.id
    left join landlord_profiles lp on lp.user_id = o.id
    left join lateral (select * from messages x where x.match_id = m.id order by x.created_at desc limit 1) lm on true
    where auth.uid() in (m.user_a, m.user_b)) t;
$$;

create function public.mark_messages_read(p_match_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from matches where id = p_match_id and auth.uid() in (user_a, user_b)) then raise exception 'Match non trovato'; end if;
  update messages set read = true where match_id = p_match_id and sender_id <> auth.uid() and not read;
end $$;

create function public.reset_my_swipes() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  delete from matches where auth.uid() in (user_a, user_b);
  delete from swipes where from_user = auth.uid() or (to_user = auth.uid() and from_user in (select id from profiles where is_demo));
end $$;

create function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  delete from auth.users where id = auth.uid();
end $$;

create function public.demo_bot_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_other uuid;
  v_replies text[] := array['Ciao! Grazie per il messaggio, molto piacere!',
    'Ciao, felice del match. Quando potremmo sentirci per saperne di più?',
    'Ottimo, mi fa piacere. Hai qualche domanda sulla casa o sulle abitudini?',
    'Perfetto, possiamo organizzare una visita o una videochiamata questa settimana.'];
begin
  if exists (select 1 from profiles where id = new.sender_id and is_demo) then return new; end if;
  select case when user_a = new.sender_id then user_b else user_a end into v_other from matches where id = new.match_id;
  if exists (select 1 from profiles where id = v_other and is_demo) then
    insert into messages (match_id, sender_id, content, created_at)
    values (new.match_id, v_other, v_replies[1 + floor(random() * array_length(v_replies, 1))::int], new.created_at + interval '1 second');
  end if;
  return new;
end $$;
create trigger trg_demo_bot after insert on public.messages for each row execute function public.demo_bot_reply();

revoke execute on function public.swipe(uuid, public.swipe_action) from public, anon;
revoke execute on function public.undo_swipe(uuid) from public, anon;
revoke execute on function public.discover_feed(text, numeric, double precision, double precision, double precision, int) from public, anon;
revoke execute on function public.map_properties(text, numeric) from public, anon;
revoke execute on function public.my_matches() from public, anon;
revoke execute on function public.mark_messages_read(uuid) from public, anon;
revoke execute on function public.reset_my_swipes() from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.swipe(uuid, public.swipe_action), public.undo_swipe(uuid),
  public.discover_feed(text, numeric, double precision, double precision, double precision, int),
  public.map_properties(text, numeric), public.my_matches(), public.mark_messages_read(uuid),
  public.reset_my_swipes(), public.delete_my_account() to authenticated;

alter publication supabase_realtime add table public.messages, public.matches;
alter table public.messages replica identity full;