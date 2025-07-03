
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, Image, Video } from 'lucide-react';

interface SessionMediaUploadProps {
  sessionId: string;
  onMediaUploaded: () => void;
}

export function SessionMediaUpload({ sessionId, onMediaUploaded }: SessionMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const uploadFiles = async () => {
    console.log('Starting upload process', { user: !!user, fileCount: selectedFiles.length, sessionId });
    
    if (!user || selectedFiles.length === 0) {
      console.log('Upload aborted:', { user: !!user, fileCount: selectedFiles.length });
      return;
    }

    setUploading(true);
    
    try {
      for (const file of selectedFiles) {
        console.log('Processing file:', file.name, file.type, file.size);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${sessionId}/${Date.now()}.${fileExt}`;
        
        console.log('Uploading to storage:', fileName);
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('session-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        console.log('Storage upload successful, saving to database');

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('session_media')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            file_path: fileName,
            file_name: file.name,
            file_type: file.type.startsWith('image/') ? 'image' : 'video',
            mime_type: file.type,
            file_size: file.size
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        }
        
        console.log('File upload completed successfully:', file.name);
      }

      toast({
        title: 'Media uploaded successfully',
        description: `${selectedFiles.length} file(s) uploaded to your session.`,
      });

      setSelectedFiles([]);
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

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Add Photos/Videos
            </span>
          </Button>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            size="sm"
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}
