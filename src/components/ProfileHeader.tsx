
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export function ProfileHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, bio, avatar_url')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      
      toast({
        title: "Success!",
        description: "Profile picture updated",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const updateBio = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: tempBio })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, bio: tempBio } : null);
      setEditingBio(false);
      
      toast({
        title: "Success!",
        description: "Bio updated",
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Error",
        description: "Failed to update bio",
        variant: "destructive",
      });
    }
  };

  const startEditBio = () => {
    setTempBio(profile?.bio || '');
    setEditingBio(true);
  };

  if (loading) {
    return (
      <Card className="w-full p-6 animate-pulse">
        <div className="flex items-center">
          <div className="w-24 h-24 rounded-full bg-gray-300"></div>
          <div className="ml-6 space-y-2">
            <div className="h-6 w-48 bg-gray-300 rounded"></div>
            <div className="h-4 w-72 bg-gray-300 rounded"></div>
            <div className="h-4 w-56 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
            <AvatarFallback className="text-2xl">
              {profile?.username?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <label 
            className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full cursor-pointer text-white hover:bg-blue-600"
            htmlFor="avatar-upload"
          >
            <Camera size={16} />
            <input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadingImage}
            />
          </label>
        </div>
        
        <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
          <h2 className="text-2xl font-bold">
            {profile?.full_name || profile?.username || 'Climber'}
          </h2>
          <div className="text-sm text-gray-500">@{profile?.username || 'anonymous'}</div>
          
          <div className="mt-2">
            {editingBio ? (
              <div className="flex flex-col space-y-2">
                <Input
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="min-w-[300px]"
                  maxLength={160}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={updateBio}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingBio(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <p className="text-gray-700">
                  {profile?.bio || 'No bio yet. Tell others about your climbing journey!'}
                </p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={startEditBio}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
