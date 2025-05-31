
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Profile = {
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: ''
  });

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
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!validateUsername(formData.username)) {
      toast({
        title: "Invalid Username",
        description: "Username must be 3-20 characters and can only contain letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev!,
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio
      }));

      toast({
        title: "Success!",
        description: "Profile settings updated",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Check for username uniqueness error
      if (error.message?.includes('duplicate key') && error.message?.includes('username')) {
        toast({
          title: "Username Taken",
          description: "This username is already in use. Please choose a different one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile settings",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
          <div className="h-4 w-72 bg-gray-300 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
              <div className="h-10 w-full bg-gray-300 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your username"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-gray-500">
              Must be 3-20 characters, can only contain letters, numbers, and underscores.
            </p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about your climbing journey"
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">
              Maximum 160 characters
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
