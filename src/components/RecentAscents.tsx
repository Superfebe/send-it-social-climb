
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mountain } from 'lucide-react';
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
            <p className="text-gray-500">No climbs logged yet. Start by adding your first climb!</p>
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
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{ascent.routes.name}</h3>
                <Badge variant="secondary">{ascent.routes.grade}</Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
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

              <div className="flex items-center gap-2 mb-2">
                {ascent.style && (
                  <Badge variant="outline" className="text-xs">
                    {ascent.style}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {ascent.attempts} attempt{ascent.attempts !== 1 ? 's' : ''}
                </Badge>
                {ascent.rating && (
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
                )}
              </div>

              {ascent.notes && (
                <p className="text-sm text-gray-600 mt-2">{ascent.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
