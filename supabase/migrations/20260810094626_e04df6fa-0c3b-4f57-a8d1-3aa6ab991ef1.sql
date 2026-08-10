CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.group_secrets (
  group_id uuid PRIMARY KEY REFERENCES public.study_groups(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.group_secrets TO service_role;
ALTER TABLE public.group_secrets ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: passwords are only ever touched by SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION public.set_group_password(_group_id uuid, _password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.study_groups g WHERE g.id=_group_id AND g.created_by=uid) THEN
    RAISE EXCEPTION 'Only the group creator can change the password' USING ERRCODE='42501';
  END IF;
  IF _password IS NULL OR length(btrim(_password)) = 0 THEN
    DELETE FROM public.group_secrets WHERE group_id=_group_id;
    RETURN;
  END IF;
  IF length(_password) < 4 THEN RAISE EXCEPTION 'Password must be at least 4 characters' USING ERRCODE='22023'; END IF;
  INSERT INTO public.group_secrets(group_id, password_hash)
  VALUES (_group_id, extensions.crypt(_password, extensions.gen_salt('bf')))
  ON CONFLICT (group_id) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=now();
END; $$;

CREATE OR REPLACE FUNCTION public.group_has_password(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$ SELECT EXISTS(SELECT 1 FROM public.group_secrets WHERE group_id=_group_id); $$;

DROP FUNCTION IF EXISTS public.get_group_by_invite(text);
CREATE OR REPLACE FUNCTION public.get_group_by_invite(_token text)
RETURNS TABLE(id uuid, name text, description text, subject text, is_private boolean, requires_password boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT g.id, g.name, g.description, g.subject, g.is_private,
         EXISTS(SELECT 1 FROM public.group_secrets s WHERE s.group_id = g.id)
  FROM public.study_groups g
  WHERE g.invite_token = _token
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.join_group_by_invite(text);
CREATE OR REPLACE FUNCTION public.join_group_by_invite(_token text, _password text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE gid uuid; uid uuid; hash text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
  SELECT id INTO gid FROM public.study_groups WHERE invite_token = _token;
  IF gid IS NULL THEN RAISE EXCEPTION 'Invalid or expired invite' USING ERRCODE='22023'; END IF;
  SELECT password_hash INTO hash FROM public.group_secrets WHERE group_id = gid;
  IF hash IS NOT NULL THEN
    IF _password IS NULL OR extensions.crypt(_password, hash) <> hash THEN
      RAISE EXCEPTION 'Incorrect group password' USING ERRCODE='28000';
    END IF;
  END IF;
  INSERT INTO public.group_members(group_id, user_id, added_by)
  VALUES (gid, uid, uid) ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN gid;
END; $$;

REVOKE ALL ON FUNCTION public.set_group_password(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_group_by_invite(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.group_has_password(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_by_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_group_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_invite(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_has_password(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO anon, authenticated;