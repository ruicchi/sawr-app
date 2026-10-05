-- Payment capture migration. Creates the order before E-Wallet transfer so the exact amount is locked.

create or replace function public.place_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_fulfillment text,
  p_payment_method text,
  p_payment_reference text default '',
  p_order_note text default '',
  p_voucher_code text default null,
  p_idempotency_key uuid default gen_random_uuid()
)
returns table(order_id uuid, order_code text, total_centavos integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_customer_id uuid := (select auth.uid());
  v_line jsonb;
  v_addon_id text;
  v_product public.products%rowtype;
  v_addon public.addons%rowtype;
  v_voucher public.vouchers%rowtype;
  v_lines jsonb := '[]'::jsonb;
  v_line_addons jsonb;
  v_line_addon_total integer;
  v_quantity integer;
  v_subtotal bigint := 0;
  v_discount integer := 0;
  v_order_id uuid;
  v_order_code text;
  v_item_id uuid;
  v_payment_reference text := trim(coalesce(p_payment_reference, ''));
begin
  if v_customer_id is null then
    raise exception 'Sign in before placing an order' using errcode = '28000';
  end if;
  if p_idempotency_key is null then
    raise exception 'An order request ID is required' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_customer_id::text || p_idempotency_key::text, 0)
  );
  select o.id, o.order_code, o.total_centavos into v_order_id, v_order_code, total_centavos
  from public.orders o
  where o.customer_id = v_customer_id and o.idempotency_key = p_idempotency_key;
  if found then
    order_id := v_order_id;
    order_code := v_order_code;
    return next;
    return;
  end if;

  if length(trim(coalesce(p_customer_name, ''))) not between 1 and 120
     or length(trim(coalesce(p_phone, ''))) not between 7 and 30
     or length(coalesce(p_order_note, '')) > 1000 then
    raise exception 'Invalid customer details' using errcode = '22023';
  end if;
  if p_fulfillment not in ('pickup', 'courier')
     or (p_fulfillment = 'courier' and length(trim(coalesce(p_address, ''))) = 0)
     or p_payment_method not in ('Cash', 'E-Wallet')
     or (p_fulfillment = 'courier' and p_payment_method = 'Cash') then
    raise exception 'Invalid fulfillment or payment details' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'An order needs 1 to 50 line items' using errcode = '22023';
  end if;

  for v_line in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_line) is distinct from 'object'
       or coalesce(v_line->>'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or coalesce(v_line->>'quantity', '') !~ '^[0-9]{1,2}$' then
      raise exception 'Invalid product or quantity' using errcode = '22023';
    end if;
    v_quantity := (v_line->>'quantity')::integer;
    if v_quantity not between 1 and 99 then
      raise exception 'Invalid quantity' using errcode = '22023';
    end if;
    select * into v_product from public.products
    where id = (v_line->>'product_id')::uuid and deleted_at is null and is_available;
    if not found or v_product.stock < v_quantity then
      raise exception 'A product is unavailable or out of stock' using errcode = '22023';
    end if;

    v_line_addons := '[]'::jsonb;
    v_line_addon_total := 0;
    if v_line ? 'addon_ids' then
      if jsonb_typeof(v_line->'addon_ids') is distinct from 'array'
         or jsonb_array_length(v_line->'addon_ids') > 20 then
        raise exception 'Invalid add-ons' using errcode = '22023';
      end if;
      for v_addon_id in select value from jsonb_array_elements_text(v_line->'addon_ids') loop
        if v_addon_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           or v_line_addons @> jsonb_build_array(jsonb_build_object('id', v_addon_id)) then
          raise exception 'Invalid or duplicate add-on' using errcode = '22023';
        end if;
        select * into v_addon from public.addons
        where id = v_addon_id::uuid and deleted_at is null and is_available;
        if not found then
          raise exception 'An add-on is unavailable' using errcode = '22023';
        end if;
        v_line_addon_total := v_line_addon_total + v_addon.price_centavos;
        v_line_addons := v_line_addons || jsonb_build_array(jsonb_build_object(
          'id', v_addon.id::text, 'name', v_addon.name, 'price', v_addon.price_centavos
        ));
      end loop;
    end if;
    v_subtotal := v_subtotal + v_quantity::bigint * (v_product.price_centavos + v_line_addon_total);
    if v_subtotal > 100000000 then
      raise exception 'Order total is too large' using errcode = '22023';
    end if;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id, 'name', v_product.name, 'category', v_product.category,
      'quantity', v_quantity, 'unit_price', v_product.price_centavos,
      'line_total', v_quantity::bigint * (v_product.price_centavos + v_line_addon_total),
      'addons', v_line_addons
    ));
  end loop;

  if nullif(trim(coalesce(p_voucher_code, '')), '') is not null then
    select * into v_voucher from public.vouchers
    where code = upper(trim(p_voucher_code)) and is_active and deleted_at is null
    for update;
    if not found
       or (v_voucher.starts_at is not null and v_voucher.starts_at > now())
       or (v_voucher.ends_at is not null and v_voucher.ends_at < now())
       or v_subtotal < v_voucher.min_spend_centavos then
      raise exception 'Voucher is invalid or ineligible' using errcode = '22023';
    end if;
    if v_voucher.max_redemptions is not null and
       (select count(*) from public.voucher_redemptions where voucher_id = v_voucher.id) >= v_voucher.max_redemptions then
      raise exception 'Voucher redemption limit reached' using errcode = '22023';
    end if;
    if v_voucher.discount_type = 'percent' then
      v_discount := floor(v_subtotal::numeric * v_voucher.discount_value / 100)::integer;
    else
      v_discount := v_voucher.discount_value;
    end if;
    v_discount := least(v_discount, v_subtotal)::integer;
  end if;

  insert into public.orders(customer_id, idempotency_key, customer_name, phone, address,
    fulfillment, order_note, subtotal_centavos, discount_centavos, total_centavos, voucher_id)
  values (v_customer_id, p_idempotency_key, trim(p_customer_name), trim(p_phone),
    trim(coalesce(p_address, '')), p_fulfillment, coalesce(p_order_note, ''),
    v_subtotal, v_discount, v_subtotal - v_discount, v_voucher.id)
  returning id, public.orders.order_code into v_order_id, v_order_code;

  for v_line in select value from jsonb_array_elements(v_lines) loop
    insert into public.order_items(order_id, product_id, product_name, category,
      quantity, unit_price_centavos, line_total_centavos)
    values (v_order_id, (v_line->>'product_id')::uuid, v_line->>'name', v_line->>'category',
      (v_line->>'quantity')::integer, (v_line->>'unit_price')::integer,
      (v_line->>'line_total')::integer)
    returning id into v_item_id;
    for v_addon_id in select value::text from jsonb_array_elements(v_line->'addons') loop
      insert into public.order_item_addons(order_item_id, addon_id, addon_name, unit_price_centavos)
      values (v_item_id, (v_addon_id::jsonb->>'id')::uuid,
        v_addon_id::jsonb->>'name', (v_addon_id::jsonb->>'price')::integer);
    end loop;
  end loop;

  insert into public.payments(order_id, method, reference)
  values (v_order_id, p_payment_method, v_payment_reference);
  insert into public.order_status_events(order_id, actor_id, from_status, to_status)
  values (v_order_id, v_customer_id, null, 'Pending');
  if v_voucher.id is not null and v_discount > 0 then
    insert into public.voucher_redemptions(voucher_id, order_id, customer_id, discount_centavos)
    values (v_voucher.id, v_order_id, v_customer_id, v_discount);
  end if;

  order_id := v_order_id;
  order_code := v_order_code;
  total_centavos := v_subtotal - v_discount;
  return next;
end; $$;


create or replace function public.submit_payment_reference(p_order_id uuid, p_reference text)
returns public.payments
language plpgsql security definer set search_path = ''
as $$
declare
  v_customer_id uuid := (select auth.uid());
  v_reference text := trim(coalesce(p_reference, ''));
  v_payment public.payments%rowtype;
begin
  if v_customer_id is null or length(v_reference) not between 4 and 120 then
    raise exception 'Invalid payment reference' using errcode = '22023';
  end if;
  update public.payments p set reference = v_reference
  from public.orders o
  where p.order_id = o.id and o.id = p_order_id and o.customer_id = v_customer_id
    and o.status = 'Pending' and p.method = 'E-Wallet'
    and p.reference = '' and p.state = 'unverified'
  returning p.* into v_payment;
  if found then return v_payment; end if;
  select p.* into v_payment from public.payments p
  join public.orders o on o.id = p.order_id
  where o.id = p_order_id and o.customer_id = v_customer_id
    and p.method = 'E-Wallet' and p.reference = v_reference and p.state = 'unverified';
  if found then return v_payment; end if;
  raise exception 'Payment reference cannot be submitted for this order' using errcode = '42501';
end; $$;

revoke all on function public.submit_payment_reference(uuid, text) from public, anon;
grant execute on function public.submit_payment_reference(uuid, text) to authenticated;
