-- SaWrap core schema. Run on a new project; no demo products or staff users are seeded.
-- All money is stored as integer Philippine centavos.

create sequence if not exists public.sawrap_order_number_seq;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_active_staff()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.staff_members
  where user_id = (select auth.uid()) and active
); $$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.staff_members
  where user_id = (select auth.uid()) and active and role = 'owner'
); $$;

revoke all on function public.is_active_staff() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_active_staff() to anon, authenticated;
grant execute on function public.is_owner() to authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  category text not null default '',
  description text not null default '',
  price_centavos integer not null check (price_centavos between 0 and 10000000),
  stock integer not null default 0 check (stock >= 0),
  is_available boolean not null default true,
  image_path text,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  price_centavos integer not null check (price_centavos between 0 and 1000000),
  is_available boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'SaWrap',
  phone text not null default '',
  address text not null default '',
  hours text not null default '',
  qr_image_path text,
  ewallet_account_name text not null default '',
  ewallet_account_number text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.store_settings(id) values (1);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and length(code) between 3 and 32),
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value integer not null check (discount_value > 0),
  min_spend_centavos integer not null default 0 check (min_spend_centavos >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions > 0),
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default ('SW-' || lpad(nextval('public.sawrap_order_number_seq')::text, 8, '0')),
  customer_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  customer_name text not null check (length(trim(customer_name)) between 1 and 120),
  phone text not null check (length(trim(phone)) between 7 and 30),
  address text not null default '',
  fulfillment text not null check (fulfillment in ('pickup', 'courier')),
  order_note text not null default '',
  courier_reference text not null default '',
  status text not null default 'Pending' check (status in ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
  subtotal_centavos integer not null check (subtotal_centavos >= 0),
  discount_centavos integer not null default 0 check (discount_centavos >= 0),
  total_centavos integer not null check (total_centavos >= 0),
  voucher_id uuid references public.vouchers(id),
  cancel_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, idempotency_key),
  check (total_centavos = subtotal_centavos - discount_centavos),
  check (fulfillment <> 'courier' or length(trim(address)) > 0)
);
create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  category text not null default '',
  quantity integer not null check (quantity between 1 and 99),
  unit_price_centavos integer not null check (unit_price_centavos >= 0),
  line_total_centavos integer not null check (line_total_centavos >= 0)
);
create index order_items_order_idx on public.order_items(order_id);

create table public.order_item_addons (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  addon_id uuid references public.addons(id) on delete set null,
  addon_name text not null,
  unit_price_centavos integer not null check (unit_price_centavos >= 0),
  unique (order_item_id, addon_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  method text not null check (method in ('Cash', 'E-Wallet')),
  reference text not null default '',
  proof_path text,
  state text not null default 'unverified' check (state in ('unverified', 'verified', 'rejected')),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.voucher_redemptions (
  voucher_id uuid not null references public.vouchers(id),
  order_id uuid primary key references public.orders(id) on delete cascade,
  customer_id uuid not null references auth.users(id),
  discount_centavos integer not null check (discount_centavos > 0),
  created_at timestamptz not null default now()
);
create index voucher_redemptions_voucher_idx on public.voucher_redemptions(voucher_id);

create table public.order_status_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid references auth.users(id),
  from_status text,
  to_status text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_customer_idx on public.notifications(customer_id, created_at desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references auth.users(id) on delete cascade,
  customer_name text not null default '',
  phone text not null default '',
  unread_by_store boolean not null default false,
  unread_by_customer boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_role text not null check (sender_role in ('customer', 'staff')),
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

create table public.favorites (
  customer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (customer_id, product_id)
);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = ''
as $$ begin
  insert into public.profiles(user_id, full_name, phone, address)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'address', ''));
  return new;
end; $$;
create trigger sawrap_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.staff_members enable row level security;
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.banners enable row level security;
alter table public.store_settings enable row level security;
alter table public.vouchers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_addons enable row level security;
alter table public.payments enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.order_status_events enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated
using (user_id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy staff_self_read on public.staff_members for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_owner()));
create policy staff_owner_manage on public.staff_members for all to authenticated
using ((select public.is_owner())) with check ((select public.is_owner()));

create policy products_public_read on public.products for select to anon, authenticated
using ((deleted_at is null and is_available) or (select public.is_active_staff()));
create policy products_staff_write on public.products for all to authenticated
using ((select public.is_active_staff())) with check ((select public.is_active_staff()));
create policy addons_public_read on public.addons for select to anon, authenticated
using ((deleted_at is null and is_available) or (select public.is_active_staff()));
create policy addons_staff_write on public.addons for all to authenticated
using ((select public.is_active_staff())) with check ((select public.is_active_staff()));
create policy banners_public_read on public.banners for select to anon, authenticated
using ((deleted_at is null and is_active) or (select public.is_active_staff()));
create policy banners_staff_write on public.banners for all to authenticated
using ((select public.is_active_staff())) with check ((select public.is_active_staff()));
create policy store_settings_public_read on public.store_settings for select to anon, authenticated using (true);
create policy store_settings_staff_write on public.store_settings for update to authenticated
using ((select public.is_active_staff())) with check ((select public.is_active_staff()));
create policy vouchers_staff_manage on public.vouchers for all to authenticated
using ((select public.is_active_staff())) with check ((select public.is_active_staff()));

create policy orders_private_read on public.orders for select to authenticated
using (customer_id = (select auth.uid()) or (select public.is_active_staff()));
create policy order_items_private_read on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id));
create policy order_item_addons_private_read on public.order_item_addons for select to authenticated
using (exists (select 1 from public.order_items i where i.id = order_item_id));
create policy payments_private_read on public.payments for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id));
create policy voucher_redemptions_private_read on public.voucher_redemptions for select to authenticated
using (customer_id = (select auth.uid()) or (select public.is_active_staff()));
create policy order_events_private_read on public.order_status_events for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id));
create policy notifications_private_read on public.notifications for select to authenticated
using (customer_id = (select auth.uid()));
create policy notifications_self_read_update on public.notifications for update to authenticated
using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));

create policy conversations_private_read on public.conversations for select to authenticated
using (customer_id = (select auth.uid()) or (select public.is_active_staff()));
create policy conversations_customer_insert on public.conversations for insert to authenticated
with check (customer_id = (select auth.uid()));
create policy conversations_private_update on public.conversations for update to authenticated
using (customer_id = (select auth.uid()) or (select public.is_active_staff()))
with check (customer_id = (select auth.uid()) or (select public.is_active_staff()));
create policy messages_private_read on public.messages for select to authenticated
using (exists (select 1 from public.conversations c where c.id = conversation_id));
create policy messages_private_insert on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid()) and
  exists (select 1 from public.conversations c where c.id = conversation_id) and
  ((sender_role = 'staff' and (select public.is_active_staff())) or
   (sender_role = 'customer' and exists (
      select 1 from public.conversations c where c.id = conversation_id and c.customer_id = (select auth.uid())
   )))
);

create policy favorites_self_read on public.favorites for select to authenticated
using (customer_id = (select auth.uid()));
create policy favorites_self_insert on public.favorites for insert to authenticated
with check (customer_id = (select auth.uid()));
create policy favorites_self_delete on public.favorites for delete to authenticated
using (customer_id = (select auth.uid()));

revoke all on public.profiles, public.staff_members, public.products, public.addons,
  public.banners, public.store_settings, public.vouchers, public.orders, public.order_items,
  public.order_item_addons, public.payments, public.voucher_redemptions,
  public.order_status_events, public.notifications, public.conversations, public.messages,
  public.favorites from anon, authenticated;
grant select on public.products, public.addons, public.banners, public.store_settings to anon;
grant select on public.profiles, public.staff_members, public.products, public.addons,
  public.banners, public.store_settings, public.vouchers, public.orders, public.order_items,
  public.order_item_addons, public.payments, public.voucher_redemptions,
  public.order_status_events, public.notifications, public.conversations, public.messages,
  public.favorites to authenticated;
grant update(full_name, phone, address, avatar_path, updated_at) on public.profiles to authenticated;
grant insert, update, delete on public.staff_members, public.products, public.addons,
  public.banners, public.vouchers to authenticated;
grant update(name, phone, address, hours, qr_image_path, ewallet_account_name,
  ewallet_account_number, updated_at) on public.store_settings to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant insert on public.conversations, public.messages, public.favorites to authenticated;
grant delete on public.favorites to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('catalog-images', 'catalog-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('banners', 'banners', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('store-assets', 'store-assets', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy sawrap_public_image_read on storage.objects for select to anon, authenticated
using (bucket_id in ('catalog-images', 'banners', 'store-assets'));
create policy sawrap_staff_image_insert on storage.objects for insert to authenticated
with check (bucket_id in ('catalog-images', 'banners', 'store-assets') and (select public.is_active_staff()));
create policy sawrap_staff_image_update on storage.objects for update to authenticated
using (bucket_id in ('catalog-images', 'banners', 'store-assets') and (select public.is_active_staff()))
with check (bucket_id in ('catalog-images', 'banners', 'store-assets') and (select public.is_active_staff()));
create policy sawrap_staff_image_delete on storage.objects for delete to authenticated
using (bucket_id in ('catalog-images', 'banners', 'store-assets') and (select public.is_active_staff()));
create policy sawrap_proof_read on storage.objects for select to authenticated
using (bucket_id = 'payment-proofs' and
  ((select public.is_active_staff()) or (storage.foldername(name))[1] = (select auth.uid())::text));
create policy sawrap_proof_insert on storage.objects for insert to authenticated
with check (bucket_id = 'payment-proofs' and
  (storage.foldername(name))[1] = (select auth.uid())::text);
create policy sawrap_avatar_read on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');
create policy sawrap_avatar_insert on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy sawrap_avatar_delete on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
