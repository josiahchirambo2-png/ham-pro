
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_access_group(uuid, uuid) TO authenticated, anon;
