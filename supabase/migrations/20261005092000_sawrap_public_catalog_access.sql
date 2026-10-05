-- The public catalog RLS policy calls this helper for both anon and authenticated roles.
-- It returns false when auth.uid() is null; granting execution does not grant staff access.
grant execute on function public.is_active_staff() to anon;
