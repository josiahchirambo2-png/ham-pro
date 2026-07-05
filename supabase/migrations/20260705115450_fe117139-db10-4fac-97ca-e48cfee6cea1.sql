ALTER TABLE public.study_groups
  ADD COLUMN IF NOT EXISTS invite_token text UNIQUE;

UPDATE public.study_groups
SET invite_token = replace(replace(encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-')
WHERE invite_token IS NULL;

ALTER TABLE public.study_groups
  ALTER COLUMN invite_token SET NOT NULL,
  ALTER COLUMN invite_token SET DEFAULT replace(replace(encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-');

CREATE OR REPLACE FUNCTION public.get_group_by_invite(_token text)
RETURNS TABLE(id uuid, name text, description text, subject text, is_private boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description, subject, is_private
  FROM public.study_groups
  WHERE invite_token = _token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.join_group_by_invite(_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gid uuid;
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  SELECT id INTO gid FROM public.study_groups WHERE invite_token = _token;
  IF gid IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.group_members(group_id, user_id, added_by)
  VALUES (gid, uid, uid)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN gid;
END;
$$;

REVOKE ALL ON FUNCTION public.get_group_by_invite(text) FROM public;
REVOKE ALL ON FUNCTION public.join_group_by_invite(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_invite(text) TO authenticated;