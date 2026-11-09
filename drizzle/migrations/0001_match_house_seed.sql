do $$
declare
  cities text[] := array['Milano','Roma','Torino','Bologna','Firenze','Napoli'];
  lats float8[] := array[45.4642,41.9028,45.0703,44.4949,43.7696,40.8518];
  lngs float8[] := array[9.19,12.4964,7.6869,11.3426,11.2558,14.2681];
  streets text[] := array['Via Roma','Via Garibaldi','Corso Italia','Via Mazzini','Via Dante','Via Verdi','Via Cavour','Viale Europa','Via Manzoni','Via Leopardi'];
  titles text[] := array['Stanza singola luminosa in centro','Doppia spaziosa vicino all''università','Camera con balcone in zona tranquilla','Singola arredata a due passi dalla metro','Stanza in appartamento ristrutturato','Camera ampia con bagno privato','Singola in casa con terrazzo','Stanza accogliente in quartiere vivace','Camera luminosa con vista','Singola in bilocale condiviso'];
  descs text[] := array['Appartamento luminoso e ristrutturato di recente, con cucina abitabile, soggiorno condiviso e lavatrice. Atmosfera tranquilla e coinquilini rispettosi.','Casa accogliente in un palazzo d''epoca, ben collegata con i mezzi. Ideale per studenti o giovani lavoratori che cercano un ambiente sereno.','Stanza ampia con armadio a muro e scrivania. La casa ha un grande soggiorno, due bagni e un balcone dove fare colazione d''estate.'];
  rules text[] := array['Pulizie a rotazione settimanale, niente feste infrasettimanali.','Rispetto degli orari di riposo dopo le 23. Spesa comune per i prodotti base.','Ospiti benvenuti con preavviso. Cucina sempre in ordine.'];
  zones text[] := array['Metro a 5 minuti, supermercato sotto casa.','Zona universitaria piena di locali e biblioteche.','Quartiere residenziale con parco vicino e fermata del tram.'];
  rents int[] := array[380,420,450,480,520,550,600,650,700,750];
  men text[] := array['Luca','Marco','Andrea','Matteo','Davide','Simone','Francesco','Giorgio','Paolo','Federico'];
  women text[] := array['Giulia','Sara','Chiara','Martina','Francesca','Elena','Alice','Valentina','Laura','Silvia'];
  lasts text[] := array['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo'];
  occs text[] := array['Studente','Sviluppatore','Designer','Infermiere','Studentessa','Marketing Specialist','Ricercatrice','Architetto','Insegnante','Fotografo'];
  unis text[] := array['Politecnico di Milano',null,null,null,'Università di Bologna',null,'Università di Firenze',null,null,null];
  comps text[] := array[null,'Satispay','Studio Grafico','Ospedale Maggiore',null,'Barilla',null,'Studio Archi','Liceo Classico','Freelance'];
  bios text[] := array['Persona tranquilla e ordinata, amo cucinare per i coinquilini e fare due chiacchiere la sera. Cerco una casa serena.','Lavoro durante il giorno e la sera mi piace leggere o vedere una serie. Rispettosa degli spazi comuni e sempre disponibile.','Socievole ma rispettoso, mi piace lo sport e uscire nel weekend. In casa sono pulito e collaborativo.'];
  hob text[] := array['Musica','Cinema','Cucina','Lettura','Viaggi','Gaming','Arte','Fotografia','Serie TV','Yoga'];
  spo text[] := array['Calcio','Basket','Tennis','Ciclismo','Corsa','Palestra','Nuoto','Arrampicata','Padel','Yoga'];
  lng2 text[] := array['Inglese','Spagnolo','Francese','Tedesco'];
  sch text[] := array['Mattiniero','Notturno','Flessibile','9-18','Smart working'];
  i int; v_id uuid; c int; tot int; av int; v_email text; v_pw text; v_type text; v_demo boolean; fem boolean; bmin int;
begin
  for i in 0..49 loop
    if i < 24 then v_type := 'LANDLORD'; v_demo := true; v_email := 'bot.proprietario'||i||'@matchhouse.demo'; v_pw := null;
    elsif i < 48 then v_type := 'SEEKER'; v_demo := true; v_email := 'bot.cercatore'||(i-24)||'@matchhouse.demo'; v_pw := null;
    elsif i = 48 then v_type := 'SEEKER'; v_demo := false; v_email := 'demo.cercatore@matchhouse.demo'; v_pw := 'MatchHouseDemo2026';
    else v_type := 'LANDLORD'; v_demo := false; v_email := 'demo.proprietario@matchhouse.demo'; v_pw := 'MatchHouseDemo2026'; end if;
    v_id := md5('matchhouse:' || v_email)::uuid;
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
    values ('00000000-0000-0000-0000-000000000000',v_id,'authenticated','authenticated',v_email,
      case when v_pw is null then '' else extensions.crypt(v_pw, extensions.gen_salt('bf')) end, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('user_type',v_type,'is_demo',v_demo), now() - make_interval(mins => 100 - i), now(),'','','','')
    on conflict (id) do nothing;
    if v_pw is not null then
      insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
      values (v_id,v_id,v_id::text,jsonb_build_object('sub',v_id::text,'email',v_email,'email_verified',true),'email',now(),now(),now())
      on conflict do nothing;
    end if;
    insert into public.profiles (id,user_type,is_demo) values (v_id, v_type::public.user_type, v_demo) on conflict (id) do nothing;
    c := 1 + (i % 6);
    if v_type = 'LANDLORD' then
      tot := 2 + (i % 4); av := 1 + (i % 2);
      insert into public.landlord_profiles (user_id,title,address,city,latitude,longitude,rent,total_rooms,available_rooms,current_tenants,square_meters,floor,furnished,bills_included,pets_allowed,smoking_allowed,wifi_included,parking_available,available_from,description,house_rules,neighborhood_info)
      values (v_id, titles[1+(i%10)], streets[1+((i*3)%10)]||', '||(3+(i*7)%90), cities[c],
        lats[c] + ((i*37)%60 - 30)/1000.0, lngs[c] + ((i*53)%60 - 30)/1000.0,
        rents[1+((i*7)%10)], tot, av, tot-av, 55+(i*13)%85, i%6, i%5<>0, i%3=0, i%3=1, i%7=0, true, i%4=0,
        date '2026-11-20' + (i*5)%80, descs[1+(i%3)], rules[1+(i%3)], zones[1+((i+1)%3)])
      on conflict do nothing;
      insert into public.photos (user_id,url,position)
      select v_id, '/seed/room-'||(1+((i+k*3)%8))||'.jpg', k from generate_series(0,2) k
      where not exists (select 1 from public.photos where user_id = v_id);
    else
      fem := i % 2 = 0; bmin := 300 + (i%3)*50;
      insert into public.seeker_profiles (user_id,first_name,last_name,age,bio,occupation,university,company,smoker,has_pets,schedule,cleanliness,noise_level,budget_min,budget_max,preferred_city,hobbies,sports,languages)
      values (v_id, case when fem then women[1+(i%10)] else men[1+(i%10)] end, lasts[1+(i%12)], 19+(i*7)%16,
        bios[1+(i%3)], occs[1+(i%10)], unis[1+(i%10)], comps[1+(i%10)], i%6=0, i%5=0, sch[1+(i%5)],
        3+(i%3), 1+(i%3), bmin, bmin + 250 + (i%4)*100, cities[c],
        array[hob[1+(i%10)], hob[1+((i+3)%10)], hob[1+((i+6)%10)]],
        array[spo[1+(i%10)], spo[1+((i+4)%10)]],
        array['Italiano', lng2[1+(i%4)]])
      on conflict do nothing;
      insert into public.photos (user_id,url,position)
      select v_id, 'https://randomuser.me/api/portraits/'||case when fem then 'women' else 'men' end||'/'||(3+(i*7)%90)||'.jpg', 0
      where not exists (select 1 from public.photos where user_id = v_id);
    end if;
  end loop;
end $$;