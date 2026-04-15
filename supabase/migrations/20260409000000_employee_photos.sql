-- Add photo_url column to users and create a storage bucket for employee photos.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS photo_url text NULL;

-- Storage bucket for employee photo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('employee-photos', 'employee-photos', true, 5242880)  -- 5 MiB
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads to employee-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'employee-photos');

CREATE POLICY "Allow public reads from employee-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'employee-photos');

CREATE POLICY "Allow public updates in employee-photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'employee-photos');

CREATE POLICY "Allow public deletes from employee-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'employee-photos');
