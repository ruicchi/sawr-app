-- Validated order operations. Browser clients cannot write orders, prices, stock, or payments directly.

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

create or replace function public.transition_order(
  p_order_id uuid,
  p_new_status text,
  p_reason text default ''
)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_stock integer;
  v_line record;
  v_title text;
  v_body text;
begin
  if not (select public.is_active_staff()) then
    raise exception 'Staff access required' using errcode = '42501';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if not ((v_order.status = 'Pending' and p_new_status in ('Preparing', 'Cancelled'))
    or (v_order.status = 'Preparing' and p_new_status = 'Ready')
    or (v_order.status = 'Ready' and p_new_status = 'Completed')) then
    raise exception 'Invalid order status transition' using errcode = '22023';
  end if;
  if p_new_status = 'Cancelled' and length(trim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Cancellation reason required' using errcode = '22023';
  end if;

  if p_new_status = 'Preparing' then
    if exists (select 1 from public.payments
      where order_id = p_order_id and method = 'E-Wallet' and state <> 'verified') then
      raise exception 'Verify the E-Wallet payment before accepting this order' using errcode = '22023';
    end if;
    for v_line in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items where order_id = p_order_id
      group by product_id order by product_id
    loop
      if v_line.product_id is null then
        raise exception 'An ordered product no longer exists' using errcode = '22023';
      end if;
      select stock into v_stock from public.products where id = v_line.product_id for update;
      if not found or v_stock < v_line.quantity then
        raise exception 'Insufficient stock to accept order' using errcode = '22023';
      end if;
      update public.products set stock = stock - v_line.quantity, updated_at = now()
      where id = v_line.product_id;
    end loop;
  end if;

  update public.orders set status = p_new_status,
    cancel_reason = case when p_new_status = 'Cancelled' then trim(p_reason) else cancel_reason end,
    updated_at = now()
  where id = p_order_id returning * into v_order;
  insert into public.order_status_events(order_id, actor_id, from_status, to_status, reason)
  values (p_order_id, (select auth.uid()),
    case p_new_status when 'Preparing' then 'Pending' when 'Ready' then 'Preparing'
      when 'Completed' then 'Ready' else 'Pending' end,
    p_new_status, coalesce(p_reason, ''));

  v_title := case p_new_status when 'Preparing' then 'Order accepted'
    when 'Ready' then 'Order ready' when 'Completed' then 'Order completed'
    else 'Order cancelled' end;
  v_body := case p_new_status when 'Preparing' then 'We are preparing your order.'
    when 'Ready' then 'Your order is ready.' when 'Completed' then 'Thank you for ordering!'
    else 'Your order was cancelled: ' || trim(p_reason) end;
  insert into public.notifications(customer_id, order_id, title, body)
  values (v_order.customer_id, v_order.id, v_title, v_body);
  return v_order;
end; $$;

create or replace function public.verify_payment(p_order_id uuid, p_state text)
returns public.payments
language plpgsql security definer set search_path = ''
as $$
declare v_payment public.payments%rowtype;
begin
  if not (select public.is_active_staff()) then
    raise exception 'Staff access required' using errcode = '42501';
  end if;
  if p_state not in ('verified', 'rejected') then
    raise exception 'Invalid payment state' using errcode = '22023';
  end if;
  update public.payments set state = p_state, verified_by = (select auth.uid()), verified_at = now()
  where order_id = p_order_id and method = 'E-Wallet' and reference <> ''
    and state = 'unverified'
  returning * into v_payment;
  if not found then
    raise exception 'Payment not found' using errcode = 'P0002';
  end if;
  return v_payment;
end; $$;

create or replace function public.save_courier_reference(p_order_id uuid, p_reference text)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_reference text := trim(coalesce(p_reference, ''));
begin
  if (select auth.uid()) is null or length(v_reference) not between 3 and 100 then
    raise exception 'Invalid courier reference' using errcode = '22023';
  end if;
  update public.orders set courier_reference = v_reference, updated_at = now()
  where id = p_order_id and customer_id = (select auth.uid())
    and fulfillment = 'courier' and status in ('Preparing', 'Ready')
    and courier_reference = '';
  if not found then
    raise exception 'Courier reference cannot be changed' using errcode = '42501';
  end if;
  return v_reference;
end; $$;

create or replace function public.attach_payment_proof(p_order_id uuid, p_path text)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_customer_id uuid := (select auth.uid());
begin
  if v_customer_id is null or p_path is null
     or p_path !~ ('^' || v_customer_id::text || '/' || p_order_id::text || '/[0-9a-f-]+[.](jpg|jpeg|png|webp)$') then
    raise exception 'Invalid payment proof path' using errcode = '22023';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'payment-proofs' and name = p_path) then
    raise exception 'Payment proof not found' using errcode = 'P0002';
  end if;
  update public.payments p set proof_path = p_path
  from public.orders o
  where p.order_id = o.id and o.id = p_order_id and o.customer_id = v_customer_id
    and p.method = 'E-Wallet' and p.state = 'unverified';
  if not found then
    raise exception 'Payment proof cannot be attached' using errcode = '42501';
  end if;
  return p_path;
end; $$;

revoke all on function public.place_order(jsonb, text, text, text, text, text, text, text, text, uuid) from public, anon;
revoke all on function public.transition_order(uuid, text, text) from public, anon;
revoke all on function public.verify_payment(uuid, text) from public, anon;
revoke all on function public.save_courier_reference(uuid, text) from public, anon;
revoke all on function public.attach_payment_proof(uuid, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text, text, text, text, uuid),
  public.transition_order(uuid, text, text), public.verify_payment(uuid, text),
  public.save_courier_reference(uuid, text), public.attach_payment_proof(uuid, text) to authenticated;
