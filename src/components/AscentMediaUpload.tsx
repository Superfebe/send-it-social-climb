
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, Video } from 'lucide-react';

interface AscentMediaUploadProps {
  ascentId: string;
  onMediaUploaded: () => void;
}

export function AscentMediaUpload({ ascentId, onMediaUploaded }: AscentMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!user || !selectedFile) return;

    setUploading(true);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/ascents/${ascentId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('session-media')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save metadata to database using direct query since types aren't updated
      const { error: dbError } = await supabase
        .from('ascent_media' as any)
        .insert({
          ascent_id: ascentId,
          user_id: user.id,
          file_path: fileName,
          file_name: selectedFile.name,
          file_type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
          mime_type: selectedFile.type,
          file_size: selectedFile.size
        });

      if (dbError) throw dbError;

      toast({
        title: 'Video uploaded successfully',
        description: 'Your climb video has been attached.',
      });

      setSelectedFile(null);
      onMediaUploaded();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-2">
      <div>
        <Input
          type="file"
          accept="video/*,image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`media-upload-${ascentId}`}
        />
        <label htmlFor={`media-upload-${ascentId}`}>
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Add Video/Photo
            </span>
          </Button>
        </label>
      </div>

      {selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span className="text-sm truncate">{selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={uploadFile}
            disabled={uploading}
            size="sm"
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </div>
      )}
    </div>
  );
}
