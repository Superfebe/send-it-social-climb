
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserMinus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Friend {
  id: string;
  username: string | null;
  full_name: string | null;
  friendship_id: string;
}

export function FriendsList() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const friendsData = await Promise.all(
        (data || []).map(async (friendship) => {
          const isRequester = friendship.requester_id === user.id;
          const friendId = isRequester ? friendship.addressee_id : friendship.requester_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name')
            .eq('id', friendId)
            .single();

          return {
            id: profile?.id || friendId,
            username: profile?.username || null,
            full_name: profile?.full_name || null,
            friendship_id: friendship.id
          };
        })
      );

      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      
      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const viewProfile = (friendId: string) => {
    window.location.href = `/profile/${friendId}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading friends...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Your Friends
          </CardTitle>
          <CardDescription>
            Connect with fellow climbers to share your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
            <p className="text-gray-500 mb-4">
              Start building your climbing community by finding and adding friends!
            </p>
            <Button onClick={() => window.location.href = '#discover'}>
              Find Friends
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Your Friends ({friends.length})
        </CardTitle>
        <CardDescription>
          Your climbing community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {friend.username?.charAt(0).toUpperCase() || friend.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {friend.full_name || friend.username || 'Anonymous Climber'}
                  </p>
                  {friend.username && friend.full_name && (
                    <p className="text-sm text-gray-500">@{friend.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewProfile(friend.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFriend(friend.friendship_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
