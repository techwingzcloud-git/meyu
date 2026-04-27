create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.customizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  customization jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  address jsonb not null default '{}'::jsonb,
  payment_method text not null,
  total_amount numeric(10, 2) not null default 0,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customizations_set_updated_at on public.customizations;
create trigger customizations_set_updated_at
before update on public.customizations
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.customizations enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "customizations_manage_own" on public.customizations;
create policy "customizations_manage_own" on public.customizations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cart_items_manage_own" on public.cart_items;
create policy "cart_items_manage_own" on public.cart_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "orders_manage_own" on public.orders;
create policy "orders_manage_own" on public.orders
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
