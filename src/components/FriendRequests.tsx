
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FriendRequest {
  id: string;
  requester_id: string;
  created_at: string;
  requester_profile?: {
    username: string | null;
    full_name: string | null;
  };
}

export function FriendRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          created_at
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Fetch profile data separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', request.requester_id)
            .single();

          return {
            ...request,
            requester_profile: profile
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchFriendRequests();
    } catch (error) {
      console.error(`Error ${action} friend request:`, error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading friend requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Friend Requests ({requests.length})
        </CardTitle>
        <CardDescription>
          People who want to connect with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500">
              When someone sends you a friend request, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {request.requester_profile?.username?.charAt(0).toUpperCase() || 
                       request.requester_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request.requester_profile?.full_name || request.requester_profile?.username || 'Anonymous Climber'}
                    </p>
                    {request.requester_profile?.username && request.requester_profile?.full_name && (
                      <p className="text-sm text-gray-500">@{request.requester_profile.username}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => respondToRequest(request.id, 'accepted')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => respondToRequest(request.id, 'rejected')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
