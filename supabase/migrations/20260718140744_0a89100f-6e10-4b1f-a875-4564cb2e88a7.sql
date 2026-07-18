
-- 1) Profile prefs for reminders
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quiet_hours_start text,
  ADD COLUMN IF NOT EXISTS quiet_hours_end text;

-- 2) Public visibility for public groups (anon can browse)
GRANT SELECT ON public.study_groups TO anon;
GRANT SELECT ON public.group_messages TO anon;
GRANT SELECT ON public.profiles TO anon;

DROP POLICY IF EXISTS "Public groups viewable by anyone" ON public.study_groups;
CREATE POLICY "Public groups viewable by anyone"
  ON public.study_groups FOR SELECT
  TO anon
  USING (is_private = false);

DROP POLICY IF EXISTS "Public group messages viewable by anyone" ON public.group_messages;
CREATE POLICY "Public group messages viewable by anyone"
  ON public.group_messages FOR SELECT
  TO anon
  USING (EXISTS (SELECT 1 FROM public.study_groups g WHERE g.id = group_messages.group_id AND g.is_private = false));

DROP POLICY IF EXISTS "Profiles display info viewable by anyone" ON public.profiles;
CREATE POLICY "Profiles display info viewable by anyone"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- 3) Lock down SECURITY DEFINER function execution surface
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_group(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_extras() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_payment(uuid, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_payment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_group_by_invite(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_group_by_invite(text) FROM PUBLIC;

-- Re-grant only where clients legitimately call these via RPC
GRANT EXECUTE ON FUNCTION public.verify_payment(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO anon, authenticated;
