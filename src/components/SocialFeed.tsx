
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, MapPin, Clock, Mountain, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SessionComments } from '@/components/SessionComments';
import { formatDistanceToNow } from 'date-fns';

interface FeedSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  climb_type: string;
  notes: string | null;
  area_name?: string;
  user_profile?: {
    username: string;
    full_name: string;
  };
  ascents?: Array<{
    id: string;
    style: string | null;
    attempts: number | null;
    route_name?: string;
    route_grade?: string;
    route_climb_type?: string;
  }>;
  session_likes?: Array<{
    user_id: string;
  }>;
  _count?: {
    session_comments: number;
  };
}

export function SocialFeed() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FeedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForComments, setSelectedSessionForComments] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFeedSessions();
    }
  }, [user]);

  const fetchFeedSessions = async () => {
    try {
      // First get sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_public', true)
        .not('end_time', 'is', null)
        .order('end_time', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Enhance each session with additional data
      const enhancedSessions = await Promise.all(
        (sessionsData || []).map(async (session) => {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', session.user_id)
            .single();

          // Get area name
          const { data: area } = await supabase
            .from('areas')
            .select('name')
            .eq('id', session.area_id)
            .single();

          // Get ascents with route info
          const { data: ascents } = await supabase
            .from('ascents')
            .select(`
              id,
              style,
              attempts,
              route_id
            `)
            .eq('session_id', session.id);

          // Get route details for ascents
          const ascentsWithRoutes = await Promise.all(
            (ascents || []).map(async (ascent) => {
              const { data: route } = await supabase
                .from('routes')
                .select('name, grade, climb_type')
                .eq('id', ascent.route_id)
                .single();

              return {
                ...ascent,
                route_name: route?.name,
                route_grade: route?.grade,
                route_climb_type: route?.climb_type
              };
            })
          );

          // Get likes
          const { data: likes } = await supabase
            .from('session_likes')
            .select('user_id')
            .eq('session_id', session.id);

          // Get comment count
          const { count: commentCount } = await supabase
            .from('session_comments')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            user_profile: profile,
            area_name: area?.name,
            ascents: ascentsWithRoutes,
            session_likes: likes || [],
            _count: { session_comments: commentCount || 0 }
          };
        })
      );

      setSessions(enhancedSessions);
    } catch (error) {
      console.error('Error fetching feed sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (sessionId: string) => {
    if (!user) return;

    try {
      const existingLike = sessions.find(s => s.id === sessionId)?.session_likes?.find(l => l.user_id === user.id);

      if (existingLike) {
        // Unlike
        await supabase
          .from('session_likes')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('session_likes')
          .insert({
            session_id: sessionId,
            user_id: user.id
          });
      }

      // Refresh the feed
      fetchFeedSessions();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                  <div className="w-24 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No climbing sessions yet</h3>
            <p className="text-gray-500 mb-4">
              Follow friends to see their climbing sessions, or complete your first session!
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              <Mountain className="h-4 w-4 mr-2" />
              Start Climbing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const isLiked = session.session_likes?.some(like => like.user_id === user?.id);
        const likeCount = session.session_likes?.length || 0;
        const commentCount = session._count?.session_comments || 0;

        return (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {session.user_profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {session.user_profile?.full_name || session.user_profile?.username || 'Anonymous Climber'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(session.end_time!), { addSuffix: true })}
                      </span>
                      {session.area_name && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{session.area_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="capitalize font-medium">{session.climb_type}</div>
                  {session.duration_minutes && (
                    <div>{Math.round(session.duration_minutes)} min</div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {session.notes && (
                <p className="text-gray-700 mb-4">{session.notes}</p>
              )}

              {session.ascents && session.ascents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Ascents ({session.ascents.length})</h4>
                  <div className="space-y-2">
                    {session.ascents.slice(0, 3).map((ascent) => (
                      <div key={ascent.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">
                          {ascent.route_name || 'Unnamed Route'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">
                            {ascent.route_grade}
                          </span>
                          {ascent.style && (
                            <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                              {ascent.style}
                            </span>
                          )}
                          {ascent.attempts && ascent.attempts > 1 && (
                            <span className="text-gray-500 text-xs">
                              {ascent.attempts} attempts
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {session.ascents.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{session.ascents.length - 3} more ascents
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(session.id)}
                    className={isLiked ? 'text-red-600' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSessionForComments(
                      selectedSessionForComments === session.id ? null : session.id
                    )}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {commentCount}
                  </Button>
                </div>
              </div>

              {selectedSessionForComments === session.id && (
                <div className="mt-4 pt-4 border-t">
                  <SessionComments 
                    sessionId={session.id} 
                    onCommentAdded={() => fetchFeedSessions()}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
