import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mountain, Trophy, Target, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SessionCard } from './SessionCard';
import { SessionDetails } from './SessionDetails';
import { DeleteClimbDialog, DeleteSessionDialog } from './DeleteActions';

interface Ascent {
  id: string;
  date_climbed: string;
  style: string;
  attempts: number;
  notes: string;
  rating: number;
  routes: {
    name: string;
    grade: string;
    climb_type: string;
    difficulty_system: string;
    areas: {
      name: string;
    };
  };
}

interface Session {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  climb_type: string;
  notes: string | null;
  areas?: {
    name: string;
  };
}

export function RecentAscents() {
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch individual ascents
      const { data: ascentsData, error: ascentsError } = await supabase
        .from('ascents')
        .select(`
          id,
          date_climbed,
          style,
          attempts,
          notes,
          rating,
          routes (
            name,
            grade,
            climb_type,
            difficulty_system,
            areas (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date_climbed', { ascending: false })
        .limit(10);

      if (ascentsError) throw ascentsError;

      // Fetch recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          start_time,
          end_time,
          duration_minutes,
          climb_type,
          notes,
          areas (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      setAscents(ascentsData || []);
      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const handleBackFromDetails = () => {
    setSelectedSession(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getStyleIcon = (style: string) => {
    switch (style?.toLowerCase()) {
      case 'onsight':
        return <Trophy className="h-3 w-3" />;
      case 'flash':
        return <Target className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStyleColor = (style: string) => {
    switch (style?.toLowerCase()) {
      case 'onsight':
        return 'bg-yellow-100 text-yellow-800';
      case 'flash':
        return 'bg-orange-100 text-orange-800';
      case 'redpoint':
        return 'bg-green-100 text-green-800';
      case 'toprope':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGradeSystem = (system: string) => {
    switch (system) {
      case 'yds': return 'YDS';
      case 'french': return 'French';
      case 'v_scale': return 'V-Scale';
      case 'uiaa': return 'UIAA';
      default: return system;
    }
  };

  if (selectedSession) {
    return (
      <SessionDetails 
        session={selectedSession} 
        onBack={handleBackFromDetails}
        onRefresh={handleRefresh}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your activity...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest climbing sessions and individual climbs</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="climbs">Individual Climbs</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No sessions logged yet!</p>
                <p className="text-sm text-gray-400">Start a session to track your climbing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="relative">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleSessionClick(session)}
                    >
                      <SessionCard session={session} />
                    </div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DeleteSessionDialog sessionId={session.id} onSuccess={handleRefresh}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Session
                            </DropdownMenuItem>
                          </DeleteSessionDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="climbs" className="mt-6">
            {ascents.length === 0 ? (
              <div className="text-center py-8">
                <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No climbs logged yet!</p>
                <p className="text-sm text-gray-400">Use the "Log New Climb" button to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ascents.map((ascent) => (
                  <div key={ascent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative">
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DeleteClimbDialog 
                            climbId={ascent.id} 
                            climbName={ascent.routes.name}
                            onSuccess={handleRefresh}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Climb
                            </DropdownMenuItem>
                          </DeleteClimbDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex justify-between items-start mb-3 pr-8">
                      <div>
                        <h3 className="font-semibold text-lg">{ascent.routes.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {ascent.routes.grade}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatGradeSystem(ascent.routes.difficulty_system)}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${ascent.style ? getStyleColor(ascent.style) : ''}`}
                      >
                        <span className="flex items-center gap-1">
                          {ascent.style && getStyleIcon(ascent.style)}
                          {ascent.style || 'Climbed'}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(ascent.date_climbed).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{ascent.routes.climb_type}</span>
                      {ascent.routes.areas && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{ascent.routes.areas.name}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {ascent.attempts} attempt{ascent.attempts !== 1 ? 's' : ''}
                      </Badge>
                      {ascent.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Rating:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < ascent.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {ascent.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{ascent.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
