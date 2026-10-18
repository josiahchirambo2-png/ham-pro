CREATE TABLE public.lesson_board_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 payload text NOT NULL CHECK (left(payload, 5) = 'hpx1:' AND length(payload) <= 4000000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lesson_board_events TO authenticated;
GRANT ALL ON public.lesson_board_events TO service_role;
ALTER TABLE public.lesson_board_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read encrypted board" ON public.lesson_board_events FOR SELECT TO authenticated USING (public.can_access_group(group_id, auth.uid()));
CREATE POLICY "Members append encrypted board" ON public.lesson_board_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.can_access_group(group_id, auth.uid()));
CREATE INDEX lesson_board_group_created ON public.lesson_board_events(group_id, created_at, id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_board_events;