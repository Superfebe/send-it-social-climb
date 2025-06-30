
-- Create storage bucket for session media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-media',
  'session-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
);

-- Create table to track session media
CREATE TABLE public.session_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' or 'video'
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on session_media
ALTER TABLE public.session_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for session_media
CREATE POLICY "Users can view media from public sessions"
  ON public.session_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_media.session_id 
      AND sessions.is_public = true
    )
  );

CREATE POLICY "Users can insert media for their own sessions"
  ON public.session_media
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_media.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own session media"
  ON public.session_media
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage policies for the bucket
CREATE POLICY "Users can upload session media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'session-media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view session media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'session-media');

CREATE POLICY "Users can delete their own session media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'session-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
