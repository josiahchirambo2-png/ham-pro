-- Notes table for student note library
CREATE TABLE public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  syllabus text,
  level text,
  content text not null,
  source text default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notes" ON public.notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX notes_user_idx ON public.notes(user_id, created_at DESC);
CREATE INDEX notes_search_idx ON public.notes USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')));

-- Lock down SECURITY DEFINER helpers: only the database itself (and admin) should EXECUTE them.
-- They're called from RLS policies, which run as the table owner — no need for client EXECUTE.
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_group(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_group(uuid, uuid) TO service_role;