
-- Create table for ascent media (videos/photos for individual climbs)
CREATE TABLE public.ascent_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ascent_id UUID NOT NULL REFERENCES ascents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' or 'video'
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ascent_media
ALTER TABLE public.ascent_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ascent_media
CREATE POLICY "Users can view media from public ascents"
  ON public.ascent_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ascents 
      JOIN sessions ON ascents.session_id = sessions.id
      WHERE ascents.id = ascent_media.ascent_id 
      AND sessions.is_public = true
    )
    OR 
    EXISTS (
      SELECT 1 FROM ascents 
      WHERE ascents.id = ascent_media.ascent_id 
      AND ascents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for their own ascents"
  ON public.ascent_media
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ascents 
      WHERE ascents.id = ascent_media.ascent_id 
      AND ascents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own ascent media"
  ON public.ascent_media
  FOR DELETE
  USING (auth.uid() = user_id);
