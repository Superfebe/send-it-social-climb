
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Mountain, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Stats {
  totalClimbs: number;
  uniqueRoutes: number;
  thisMonthClimbs: number;
  averageRating: number;
}

export function ClimbingStats() {
  const [stats, setStats] = useState<Stats>({
    totalClimbs: 0,
    uniqueRoutes: 0,
    thisMonthClimbs: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        // Get total climbs
        const { count: totalClimbs } = await supabase
          .from('ascents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get unique routes
        const { data: uniqueRoutesData } = await supabase
          .from('ascents')
          .select('route_id')
          .eq('user_id', user.id);

        const uniqueRoutes = new Set(uniqueRoutesData?.map(a => a.route_id)).size;

        // Get this month's climbs
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const { count: thisMonthClimbs } = await supabase
          .from('ascents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('date_climbed', firstDayOfMonth.toISOString().split('T')[0]);

        // Get average rating
        const { data: ratingsData } = await supabase
          .from('ascents')
          .select('rating')
          .eq('user_id', user.id)
          .not('rating', 'is', null);

        const averageRating = ratingsData && ratingsData.length > 0
          ? ratingsData.reduce((sum, a) => sum + (a.rating || 0), 0) / ratingsData.length
          : 0;

        setStats({
          totalClimbs: totalClimbs || 0,
          uniqueRoutes,
          thisMonthClimbs: thisMonthClimbs || 0,
          averageRating: Math.round(averageRating * 10) / 10
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Climbing Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Mountain className="h-4 w-4 text-primary mr-1" />
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalClimbs}</div>
            <div className="text-xs text-muted-foreground">Total Climbs</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-teal-500 mr-1" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{stats.uniqueRoutes}</div>
            <div className="text-xs text-muted-foreground">Unique Routes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-accent mr-1" />
            </div>
            <div className="text-2xl font-bold text-accent">{stats.thisMonthClimbs}</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-orange-400">★</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {stats.averageRating > 0 ? stats.averageRating : '-'}
            </div>
            <div className="text-xs text-muted-foreground">Avg Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
