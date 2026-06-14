
-- 1. Privacy + edit tracking
ALTER TABLE public.study_groups ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- 2. Membership table for private groups
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 3. Helper: is the user a member of a group?
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.can_access_group(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_groups g
    WHERE g.id = _group_id
      AND (g.is_private = false OR g.created_by = _user_id OR public.is_group_member(g.id, _user_id))
  );
$$;

-- 4. group_members policies
DROP POLICY IF EXISTS "Members can view their memberships" ON public.group_members;
CREATE POLICY "Members can view their memberships" ON public.group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.study_groups g WHERE g.id = group_id AND g.created_by = auth.uid()
  ));

DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;
CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    added_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.study_groups g WHERE g.id = group_id AND g.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Creators or self can remove membership" ON public.group_members;
CREATE POLICY "Creators or self can remove membership" ON public.group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.study_groups g WHERE g.id = group_id AND g.created_by = auth.uid()
  ));

-- 5. Update study_groups SELECT policy for privacy
DROP POLICY IF EXISTS "Groups viewable by authenticated" ON public.study_groups;
CREATE POLICY "Public or member groups viewable" ON public.study_groups
  FOR SELECT TO authenticated
  USING (
    is_private = false
    OR created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );

-- 6. Update group_messages policies for privacy + edits
DROP POLICY IF EXISTS "Messages viewable by authenticated" ON public.group_messages;
CREATE POLICY "Messages viewable to group viewers" ON public.group_messages
  FOR SELECT TO authenticated
  USING (public.can_access_group(group_id, auth.uid()));

DROP POLICY IF EXISTS "Users can post messages" ON public.group_messages;
CREATE POLICY "Users can post messages in accessible groups" ON public.group_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.can_access_group(group_id, auth.uid()));

DROP POLICY IF EXISTS "Users can edit own messages" ON public.group_messages;
CREATE POLICY "Users can edit own messages" ON public.group_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Realtime for edits + full row data
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'group_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
  END IF;
END $$;
