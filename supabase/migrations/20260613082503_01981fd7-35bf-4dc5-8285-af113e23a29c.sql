DROP POLICY IF EXISTS "Avatars readable by authenticated" ON storage.objects;
CREATE POLICY "Users read own avatar"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own identifications"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'identifications' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'identifications' AND auth.uid()::text = (storage.foldername(name))[1]);

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read group realtime" ON realtime.messages;
CREATE POLICY "Authenticated can read group realtime"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    (realtime.topic() LIKE 'group:%')
    OR realtime.messages.extension = 'postgres_changes'
  );

DROP POLICY IF EXISTS "Authenticated can write group realtime" ON realtime.messages;
CREATE POLICY "Authenticated can write group realtime"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (realtime.topic() LIKE 'group:%');