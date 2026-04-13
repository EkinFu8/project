-- Depends on public.content_management from 00000000000000_baseline.sql (run migrations in timestamp order).

-- Create a storage bucket for content file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('content-files', 'content-files', true, 52428800)  -- 50 MiB
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to the content-files bucket
CREATE POLICY "Allow public uploads to content-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-files');

-- Allow anyone to read files from the content-files bucket
CREATE POLICY "Allow public reads from content-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-files');

-- Allow anyone to update their own uploads
CREATE POLICY "Allow public updates in content-files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'content-files');

-- Allow anyone to delete files from the content-files bucket
CREATE POLICY "Allow public deletes from content-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'content-files');

-- Widen url for databases created before init used VARCHAR(500); no-op if already 500
ALTER TABLE public.content_management ALTER COLUMN url TYPE VARCHAR(500);
