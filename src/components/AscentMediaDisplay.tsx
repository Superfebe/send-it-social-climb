
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface AscentMediaDisplayProps {
  ascentId: string;
  compact?: boolean;
}

export function AscentMediaDisplay({ ascentId, compact = false }: AscentMediaDisplayProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      // Use type assertion to bypass TypeScript issues with the new table
      const { data, error } = await (supabase as any)
        .from('ascent_media')
        .select('*')
        .eq('ascent_id', ascentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        setMedia([]);
        return;
      }

      // Get signed URLs for each media item
      const mediaWithUrls = await Promise.all(
        (data || []).map(async (item: any) => {
          try {
            const { data: signedUrl } = await supabase.storage
              .from('session-media')
              .createSignedUrl(item.file_path, 3600); // 1 hour expiry

            return {
              ...item,
              url: signedUrl?.signedUrl
            };
          } catch (urlError) {
            console.error('Error creating signed URL:', urlError);
            return {
              ...item,
              url: undefined
            };
          }
        })
      );

      setMedia(mediaWithUrls);
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [ascentId]);

  if (loading) return null;
  if (media.length === 0) return null;

  if (compact) {
    return (
      <div className="flex gap-1">
        {media.slice(0, 3).map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <div className="relative w-8 h-8 bg-gray-100 rounded overflow-hidden cursor-pointer flex-shrink-0">
                {item.file_type === 'image' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Play className="h-3 w-3 text-gray-600" />
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {item.file_type === 'image' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : item.url ? (
                  <video
                    src={item.url}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-white">Media not available</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
        {media.length > 3 && (
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
            +{media.length - 3}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h5 className="text-sm font-medium mb-2">Media ({media.length})</h5>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {media.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 group">
                {item.file_type === 'image' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Play className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  {item.file_type === 'image' ? (
                    <ImageIcon className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Play className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {item.file_type === 'image' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : item.url ? (
                  <video
                    src={item.url}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-white">Media not available</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
