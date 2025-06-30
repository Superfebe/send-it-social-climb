
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AscentMediaDisplay } from './AscentMediaDisplay';

interface Ascent {
  id: string;
  date_climbed: string;
  attempts: number;
  style: string | null;
  notes: string | null;
  routes: {
    name: string;
    grade: string;
    climb_type: string;
    areas: {
      name: string;
    } | null;
  } | null;
}

export function RecentAscents() {
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAscents();
    }
  }, [user]);

  const fetchAscents = async () => {
    try {
      const { data, error } = await supabase
        .from('ascents')
        .select(`
          id,
          date_climbed,
          attempts,
          style,
          notes,
          routes (
            name,
            grade,
            climb_type,
            areas (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('date_climbed', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAscents(data || []);
    } catch (error) {
      console.error('Error fetching ascents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Ascents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Ascents</CardTitle>
        <CardDescription>Your latest climbing achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ascents.length === 0 ? (
            <div className="text-center text-gray-500">
              No ascents logged yet. Start climbing!
            </div>
          ) : (
            ascents.map((ascent) => (
              <div key={ascent.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">
                      {ascent.routes?.name || 'Unknown Route'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {ascent.routes?.areas?.name || 'Unknown Area'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {ascent.routes?.grade}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(ascent.date_climbed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {ascent.routes?.climb_type}
                  </Badge>
                  {ascent.style && (
                    <Badge variant="outline" className="text-xs">
                      {ascent.style}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {ascent.attempts} attempt{ascent.attempts > 1 ? 's' : ''}
                  </Badge>
                </div>

                {ascent.notes && (
                  <p className="text-sm text-gray-600 mb-2">{ascent.notes}</p>
                )}

                <AscentMediaDisplay ascentId={ascent.id} compact />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
