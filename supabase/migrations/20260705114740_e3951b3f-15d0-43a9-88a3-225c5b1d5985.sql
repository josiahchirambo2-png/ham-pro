CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id);
$function$;

CREATE OR REPLACE FUNCTION public.can_access_group(_group_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.study_groups g
    WHERE g.id = _group_id
      AND (g.is_private = false OR g.created_by = _user_id OR public.is_group_member(g.id, _user_id))
  );
$function$;