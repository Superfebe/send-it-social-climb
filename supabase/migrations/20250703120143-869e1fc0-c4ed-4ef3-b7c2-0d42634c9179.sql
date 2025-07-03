-- Update storage policy for session media uploads to be more permissive but secure
DROP POLICY IF EXISTS "Users can upload session media" ON storage.objects;

CREATE POLICY "Users can upload session media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'session-media' AND 
  auth.uid() IS NOT NULL AND
  -- Allow users to upload files in their own folder structure
  (storage.foldername(name))[1] = auth.uid()::text
);