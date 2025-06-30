
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Play, Image as ImageIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  url?: string;
}

interface SessionMediaDisplayProps {
  sessionId: string;
}

export function SessionMediaDisplay({ sessionId }: SessionMediaDisplayProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('session_media')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for each media item
      const mediaWithUrls = await Promise.all(
        (data || []).map(async (item) => {
          const { data: signedUrl } = await supabase.storage
            .from('session-media')
            .createSignedUrl(item.file_path, 3600); // 1 hour expiry

          return {
            ...item,
            url: signedUrl?.signedUrl
          };
        })
      );

      setMedia(mediaWithUrls);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [sessionId]);

  if (loading) return null;
  if (media.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Media ({media.length})</h4>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {media.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 group">
                {item.file_type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Play className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  {item.file_type === 'image' ? (
                    <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {item.file_type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="max-w-full max-h-full"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
