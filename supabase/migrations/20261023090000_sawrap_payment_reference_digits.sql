-- Keep existing references untouched; validate new and changed references only.
create or replace function public.validate_payment_reference_digits()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.reference <> '' and
     (new.method <> 'E-Wallet' or new.reference !~ '^[0-9]{4,40}$') then
    raise exception 'E-Wallet reference must be 4 to 40 digits'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'payments_reference_digits'
      and tgrelid = 'public.payments'::regclass
  ) then
    create trigger payments_reference_digits
    before insert or update of reference on public.payments
    for each row execute function public.validate_payment_reference_digits();
  end if;
end;
$$;
