
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Globe, ArrowLeft, UserMinus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
};

type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [canViewProfile, setCanViewProfile] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId && user) {
      fetchUserProfile();
      if (!isOwnProfile) {
        checkFriendshipStatus();
      }
    }
  }, [userId, user, isOwnProfile]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, is_public')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Could not load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!userId || !user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);

      if (error) throw error;

      if (data && data.length > 0) {
        const friendship = data[0];
        if (friendship.status === 'accepted') {
          setFriendshipStatus('friends');
          setCanViewProfile(true);
        } else if (friendship.requester_id === user.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      // User can view profile if it's their own, public, or they are friends
      setCanViewProfile(isOwnProfile || profile.is_public || friendshipStatus === 'friends');
    }
  }, [profile, friendshipStatus, isOwnProfile]);

  const sendFriendRequest = async () => {
    if (!userId || !user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      setFriendshipStatus('pending_sent');
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent.",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Could not send friend request",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async () => {
    if (!userId || !user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);

      if (error) throw error;

      setFriendshipStatus('none');
      setCanViewProfile(profile?.is_public || false);
      toast({
        title: "Friend removed",
        description: "You are no longer friends with this user.",
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Could not remove friend",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="w-full p-6 animate-pulse">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-gray-300"></div>
            <div className="ml-6 space-y-2">
              <div className="h-6 w-48 bg-gray-300 rounded"></div>
              <div className="h-4 w-72 bg-gray-300 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="w-full p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">This user profile could not be found.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="w-full p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="text-2xl">
                {profile.username?.charAt(0).toUpperCase() || profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">
                {profile.full_name || profile.username || 'Climber'}
              </h2>
              <Badge variant={profile.is_public ? "default" : "secondary"} className="w-fit">
                {profile.is_public ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mb-4">@{profile.username || 'anonymous'}</div>
            
            {canViewProfile ? (
              <div className="mb-4">
                <p className="text-gray-700">
                  {profile.bio || 'No bio available.'}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-500 italic">
                  This profile is private. Send a friend request to view their information.
                </p>
              </div>
            )}

            {!isOwnProfile && (
              <div className="flex items-center space-x-2">
                {friendshipStatus === 'none' && (
                  <Button onClick={sendFriendRequest}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                )}
                {friendshipStatus === 'pending_sent' && (
                  <Button disabled variant="outline">
                    Friend Request Sent
                  </Button>
                )}
                {friendshipStatus === 'friends' && (
                  <Button variant="outline" onClick={removeFriend}>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove Friend
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
