
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for avatars (private bucket)
CREATE POLICY "Avatars readable by authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for identifications
CREATE POLICY "Users read own identifications" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'identifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own identifications" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'identifications' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own identifications" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'identifications' AND auth.uid()::text = (storage.foldername(name))[1]);
