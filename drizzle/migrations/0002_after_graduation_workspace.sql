CREATE TABLE public.aftergrad_workspaces (user_id uuid PRIMARY KEY, workspace jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(workspace) = 'object' AND octet_length(workspace::text) <= 80000));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aftergrad_workspaces TO authenticated;
GRANT ALL ON public.aftergrad_workspaces TO service_role;
ALTER TABLE public.aftergrad_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY aftergrad_owner ON public.aftergrad_workspaces FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);