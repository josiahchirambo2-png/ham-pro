-- 1. Onboarding fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS degree text,
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- 2. Lock down profiles: private info only visible to the owner
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles display info viewable by anyone" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
REVOKE SELECT ON public.profiles FROM anon;

-- Safe display-name lookup limited to people in the same group
CREATE OR REPLACE FUNCTION public.group_member_names(_group_id uuid)
RETURNS TABLE(id uuid, display_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT p.id, p.display_name
  FROM public.profiles p
  WHERE public.can_access_group(_group_id, auth.uid())
    AND (p.id = _group_id OR EXISTS (
      SELECT 1 FROM public.group_members m WHERE m.group_id = _group_id AND m.user_id = p.id
    ) OR EXISTS (
      SELECT 1 FROM public.study_groups g WHERE g.id = _group_id AND g.created_by = p.id
    ));
$$;
GRANT EXECUTE ON FUNCTION public.group_member_names(uuid) TO authenticated;

-- 3. No more public rooms
UPDATE public.study_groups SET is_private = true WHERE is_private = false;
ALTER TABLE public.study_groups ALTER COLUMN is_private SET DEFAULT true;
ALTER TABLE public.study_groups DROP CONSTRAINT IF EXISTS study_groups_private_only;
ALTER TABLE public.study_groups ADD CONSTRAINT study_groups_private_only CHECK (is_private = true);

DROP POLICY IF EXISTS "Public groups viewable by anyone" ON public.study_groups;
DROP POLICY IF EXISTS "Public or member groups viewable" ON public.study_groups;
CREATE POLICY "Members and owners can view groups"
  ON public.study_groups FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.is_group_member(id, auth.uid()));
REVOKE SELECT ON public.study_groups FROM anon;

DROP POLICY IF EXISTS "Public group messages viewable by anyone" ON public.group_messages;
REVOKE SELECT ON public.group_messages FROM anon;

CREATE OR REPLACE FUNCTION public.can_access_group(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_groups g
    WHERE g.id = _group_id
      AND (g.created_by = _user_id OR public.is_group_member(g.id, _user_id))
  );
$$;

-- 4. Encrypted chat support
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS encrypted boolean NOT NULL DEFAULT false;

-- 5. Room keys are mandatory for new groups (min 6 chars)
CREATE OR REPLACE FUNCTION public.set_group_password(_group_id uuid, _password text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions'
AS $$
DECLARE uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.study_groups g WHERE g.id=_group_id AND g.created_by=uid) THEN
    RAISE EXCEPTION 'Only the group creator can change the room key' USING ERRCODE='42501';
  END IF;
  IF _password IS NULL OR length(btrim(_password)) = 0 THEN
    DELETE FROM public.group_secrets WHERE group_id=_group_id;
    RETURN;
  END IF;
  IF length(_password) < 6 THEN RAISE EXCEPTION 'Room key must be at least 6 characters' USING ERRCODE='22023'; END IF;
  INSERT INTO public.group_secrets(group_id, password_hash)
  VALUES (_group_id, extensions.crypt(_password, extensions.gen_salt('bf')))
  ON CONFLICT (group_id) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=now();
END; $$;

-- Verify a room key without joining (used to unlock decryption)
CREATE OR REPLACE FUNCTION public.verify_group_key(_group_id uuid, _password text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public', 'extensions'
AS $$
DECLARE hash text;
BEGIN
  IF NOT public.can_access_group(_group_id, auth.uid()) THEN RETURN false; END IF;
  SELECT password_hash INTO hash FROM public.group_secrets WHERE group_id=_group_id;
  IF hash IS NULL THEN RETURN true; END IF;
  RETURN _password IS NOT NULL AND extensions.crypt(_password, hash) = hash;
END; $$;
GRANT EXECUTE ON FUNCTION public.verify_group_key(uuid, text) TO authenticated;