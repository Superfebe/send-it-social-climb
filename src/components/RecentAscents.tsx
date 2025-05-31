
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mountain, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export function RecentAscents() {
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAscents() {
      if (!user) return;

      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching ascents:', error);
      } else {
        setAscents(data || []);
      }
      setLoading(false);
    }

    fetchAscents();
  }, [user]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Climbs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your climbs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ascents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Climbs</CardTitle>
          <CardDescription>Your latest climbing achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No climbs logged yet!</p>
            <p className="text-sm text-gray-400">Use the "Log New Climb" button to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Climbs</CardTitle>
        <CardDescription>Your latest climbing achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ascents.map((ascent) => (
            <div key={ascent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
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
      </CardContent>
    </Card>
  );
}
