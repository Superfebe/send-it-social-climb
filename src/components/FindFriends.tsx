
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  friendship_status: 'none' | 'pending' | 'accepted';
}

export function FindFriends() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setLoading(true);
    try {
      // Search for users by username or full name
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', user.id)
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Check friendship status for each user
      const resultsWithStatus = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: friendship } = await supabase
            .from('friendships')
            .select('status')
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`)
            .maybeSingle();

          return {
            ...profile,
            friendship_status: (friendship ? friendship.status : 'none') as 'none' | 'pending' | 'accepted'
          };
        })
      );

      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      // Update the local state
      setSearchResults(results =>
        results.map(result =>
          result.id === friendId
            ? { ...result, friendship_status: 'pending' as const }
            : result
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Find Friends
        </CardTitle>
        <CardDescription>
          Search for climbers to connect with
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={searchUsers} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {result.username?.charAt(0).toUpperCase() || 
                         result.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {result.full_name || result.username || 'Anonymous Climber'}
                      </p>
                      {result.username && result.full_name && (
                        <p className="text-sm text-gray-500">@{result.username}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {result.friendship_status === 'none' && (
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(result.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Friend
                      </Button>
                    )}
                    {result.friendship_status === 'pending' && (
                      <Button size="sm" disabled variant="outline">
                        Request Sent
                      </Button>
                    )}
                    {result.friendship_status === 'accepted' && (
                      <Button size="sm" disabled variant="outline">
                        Friends
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !loading && (
            <div className="text-center py-6">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                Try searching with a different username or name.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
