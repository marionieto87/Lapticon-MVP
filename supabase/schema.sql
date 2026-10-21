-- Lapticon MVP schema. Run once in the Supabase SQL editor.

-- Profiles: one row per auth user, created by trigger on sign-up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  city text,
  role text not null default 'both' check (role in ('send', 'travel', 'both')),
  created_at timestamptz not null default now()
);

-- Phone numbers are private: only the owner reads them, and the other party
-- gets them through contact_for_request() once a request is accepted.
create table public.profile_contacts (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, city, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'city',
    coalesce(new.raw_user_meta_data ->> 'role', 'both')
  );
  insert into public.profile_contacts (id, phone)
  values (new.id, new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trips posted by travelers (Bogotá -> Montreal for the pilot).
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  flight_date date not null,
  origin text not null default 'BOG',
  destination text not null default 'YUL',
  space_kg numeric(5, 1) not null check (space_kg > 0 and space_kg <= 46),
  notes text,
  created_at timestamptz not null default now()
);

-- Requests ("encargos") posted by people in Montreal.
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('sweets', 'coffee', 'gift', 'medicine', 'dairy', 'other')),
  photo_path text,
  length_cm numeric(5, 1) not null check (length_cm > 0),
  width_cm numeric(5, 1) not null check (width_cm > 0),
  height_cm numeric(5, 1) not null check (height_cm > 0),
  weight_kg numeric(5, 2) not null check (weight_kg > 0 and weight_kg <= 23),
  item_value numeric(10, 2),
  item_currency text not null default 'COP' check (item_currency in ('COP', 'CAD')),
  pickup_mode text not null default 'requester_delivers' check (pickup_mode in ('requester_delivers', 'traveler_buys', 'either')),
  needed_by date not null,
  offer_cad numeric(8, 2) not null check (offer_cad >= 0),
  terms_accepted_at timestamptz not null,
  medicine_rules_accepted_at timestamptz,
  status text not null default 'open' check (status in ('open', 'accepted', 'handed_over', 'in_transit', 'delivered', 'cancelled')),
  traveler_id uuid references public.profiles (id),
  trip_id uuid references public.trips (id),
  traveler_buys boolean,
  accepted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint medicine_needs_rules check (category <> 'medicine' or medicine_rules_accepted_at is not null)
);

create index requests_status_idx on public.requests (status, needed_by);

-- Two-way ratings, one per person per request.
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  ratee_id uuid not null references public.profiles (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (request_id, rater_id)
);

-- Public reputation per person. Requester level is based on how many
-- requests they have had delivered through Lapticon.
create or replace view public.profile_stats
with (security_invoker = false) as
select
  p.id,
  p.full_name,
  p.city,
  (select count(*) from public.requests r where r.requester_id = p.id and r.status = 'delivered') as requests_delivered,
  (select count(*) from public.requests r where r.requester_id = p.id and r.status <> 'cancelled') as requests_posted,
  (select count(*) from public.requests r where r.traveler_id = p.id and r.status = 'delivered') as trips_delivered,
  (select round(avg(stars)::numeric, 1) from public.ratings g where g.ratee_id = p.id) as avg_stars,
  (select count(*) from public.ratings g where g.ratee_id = p.id) as ratings_count
from public.profiles p;

-- Row level security
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.requests enable row level security;
alter table public.ratings enable row level security;
alter table public.profile_contacts enable row level security;

create policy "users read own contact" on public.profile_contacts
  for select to authenticated using (id = auth.uid());
create policy "users update own contact" on public.profile_contacts
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles readable by signed-in users" on public.profiles
  for select to authenticated using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "trips readable by signed-in users" on public.trips
  for select to authenticated using (true);
create policy "travelers manage own trips" on public.trips
  for all to authenticated using (traveler_id = auth.uid()) with check (traveler_id = auth.uid());

create policy "requests readable by signed-in users" on public.requests
  for select to authenticated using (true);
create policy "requesters create own requests" on public.requests
  for insert to authenticated with check (requester_id = auth.uid() and status = 'open' and traveler_id is null);
create policy "requesters edit own open requests" on public.requests
  for update to authenticated
  using (requester_id = auth.uid() and status = 'open')
  with check (requester_id = auth.uid() and status in ('open', 'cancelled') and traveler_id is null);

create policy "ratings readable by signed-in users" on public.ratings
  for select to authenticated using (true);
create policy "participants rate after delivery" on public.ratings
  for insert to authenticated with check (
    rater_id = auth.uid()
    and exists (
      select 1 from public.requests r
      where r.id = request_id
        and r.status = 'delivered'
        and ((r.requester_id = auth.uid() and r.traveler_id = ratee_id)
          or (r.traveler_id = auth.uid() and r.requester_id = ratee_id))
    )
  );

grant select on public.profile_stats to authenticated;

-- Contact details are only shared once a request is accepted.
create or replace function public.contact_for_request(req uuid)
returns table (full_name text, phone text)
language sql
security definer set search_path = public
stable
as $$
  select p.full_name, c.phone
  from public.requests r
  join public.profiles p
    on p.id = case when r.requester_id = auth.uid() then r.traveler_id else r.requester_id end
  join public.profile_contacts c on c.id = p.id
  where r.id = req
    and r.status <> 'open'
    and auth.uid() in (r.requester_id, r.traveler_id);
$$;

-- Status changes after a request is accepted go through this function, so
-- each side can only make the moves that belong to it.
create or replace function public.advance_request(req uuid, next_status text, trip uuid default null, buys boolean default null)
returns public.requests
language plpgsql
security definer set search_path = public
as $$
declare
  r public.requests;
  me uuid := auth.uid();
begin
  select * into r from public.requests where id = req for update;
  if not found then raise exception 'request not found'; end if;

  if next_status = 'accepted' then
    if r.status <> 'open' then raise exception 'request is no longer open'; end if;
    if r.requester_id = me then raise exception 'you cannot carry your own request'; end if;
    if trip is not null and not exists (select 1 from public.trips t where t.id = trip and t.traveler_id = me) then
      raise exception 'trip does not belong to you';
    end if;
    update public.requests set
      status = 'accepted', traveler_id = me, trip_id = trip, accepted_at = now(),
      traveler_buys = case r.pickup_mode
        when 'traveler_buys' then true
        when 'requester_delivers' then false
        else coalesce(buys, false) end
    where id = req returning * into r;
  elsif next_status = 'handed_over' and r.status = 'accepted' and me in (r.requester_id, r.traveler_id) then
    update public.requests set status = 'handed_over' where id = req returning * into r;
  elsif next_status = 'in_transit' and r.status = 'handed_over' and me = r.traveler_id then
    update public.requests set status = 'in_transit' where id = req returning * into r;
  elsif next_status = 'delivered' and r.status in ('handed_over', 'in_transit') and me = r.requester_id then
    update public.requests set status = 'delivered', delivered_at = now() where id = req returning * into r;
  elsif next_status = 'open' and r.status = 'accepted' and me = r.traveler_id then
    update public.requests set status = 'open', traveler_id = null, trip_id = null, traveler_buys = null, accepted_at = null
    where id = req returning * into r;
  elsif next_status = 'cancelled' and r.status in ('open', 'accepted') and me = r.requester_id then
    update public.requests set status = 'cancelled' where id = req returning * into r;
  else
    raise exception 'that change is not allowed';
  end if;
  return r;
end;
$$;

grant execute on function public.advance_request(uuid, text, uuid, boolean) to authenticated;
grant execute on function public.contact_for_request(uuid) to authenticated;

-- Photo storage: public bucket, users upload into a folder named after their id.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "users upload own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
