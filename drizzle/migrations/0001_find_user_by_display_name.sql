create or replace function public.find_user_by_display_name(_display_name text)
returns table (id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where lower(btrim(p.display_name)) = lower(btrim(_display_name))
  limit 1;
$$;

revoke all on function public.find_user_by_display_name(text) from public, anon;
grant execute on function public.find_user_by_display_name(text) to authenticated;