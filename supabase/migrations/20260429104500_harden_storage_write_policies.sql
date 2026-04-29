-- Keep existing public reads for now so stored content/photo URLs continue to render.
-- Tighten writes so the anon key alone cannot upload, overwrite, or delete storage objects.

DROP POLICY IF EXISTS "Allow public uploads to content-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates in content-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes in content-files" ON storage.objects;

DROP POLICY IF EXISTS "Allow public uploads to employee-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates in employee-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes in employee-photos" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to content-files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated updates in content-files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-files')
  WITH CHECK (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated deletes in content-files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated uploads to employee-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'employee-photos');

CREATE POLICY "Allow authenticated updates in employee-photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'employee-photos')
  WITH CHECK (bucket_id = 'employee-photos');

CREATE POLICY "Allow authenticated deletes in employee-photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'employee-photos');
