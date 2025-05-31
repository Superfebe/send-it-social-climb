
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GradePyramidChart } from './charts/GradePyramidChart';
import { ProgressOverTimeChart } from './charts/ProgressOverTimeChart';
import { SendRateChart } from './charts/SendRateChart';
import { ClimbTypeDistribution } from './charts/ClimbTypeDistribution';

interface ProgressStats {
  totalClimbs: number;
  hardestGrades: Record<string, string>;
  averageGrades: Record<string, string>;
  sendRate: number;
  flashRate: number;
  outdoorVsIndoor: { outdoor: number; indoor: number };
  monthlyTrends: Array<{ month: string; climbs: number; avgGrade: number }>;
  gradePyramid: Array<{ grade: string; count: number; type: string }>;
}

export function ProgressDashboard() {
  const [stats, setStats] = useState<ProgressStats>({
    totalClimbs: 0,
    hardestGrades: {},
    averageGrades: {},
    sendRate: 0,
    flashRate: 0,
    outdoorVsIndoor: { outdoor: 0, indoor: 0 },
    monthlyTrends: [],
    gradePyramid: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProgressStats() {
      if (!user) return;

      try {
        // Fetch all user ascents with route data
        const { data: ascents, error } = await supabase
          .from('ascents')
          .select(`
            *,
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
          .order('date_climbed', { ascending: true });

        if (error) throw error;

        if (ascents) {
          const processedStats = processProgressData(ascents);
          setStats(processedStats);
        }
      } catch (error) {
        console.error('Error fetching progress stats:', error);
      }
      
      setLoading(false);
    }

    fetchProgressStats();
  }, [user]);

  const processProgressData = (ascents: any[]): ProgressStats => {
    const stats: ProgressStats = {
      totalClimbs: ascents.length,
      hardestGrades: {},
      averageGrades: {},
      sendRate: 0,
      flashRate: 0,
      outdoorVsIndoor: { outdoor: 0, indoor: 0 },
      monthlyTrends: [],
      gradePyramid: []
    };

    // Calculate send rates
    const successfulClimbs = ascents.filter(a => a.attempts > 0);
    const flashClimbs = ascents.filter(a => a.style === 'flash');
    stats.sendRate = ascents.length > 0 ? (successfulClimbs.length / ascents.length) * 100 : 0;
    stats.flashRate = ascents.length > 0 ? (flashClimbs.length / ascents.length) * 100 : 0;

    // Calculate outdoor vs indoor
    ascents.forEach(ascent => {
      const isGym = ascent.routes?.areas?.name?.toLowerCase().includes('gym') || false;
      if (isGym) {
        stats.outdoorVsIndoor.indoor++;
      } else {
        stats.outdoorVsIndoor.outdoor++;
      }
    });

    // Group by climb type for hardest grades
    const typeGroups = ascents.reduce((acc, ascent) => {
      const type = ascent.routes?.climb_type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(ascent);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate hardest grades per type
    Object.keys(typeGroups).forEach(type => {
      const grades = typeGroups[type].map(a => a.routes?.grade).filter(Boolean);
      if (grades.length > 0) {
        // Simple grade comparison - in real app you'd want proper grade conversion
        stats.hardestGrades[type] = grades.sort().pop() || '';
      }
    });

    // Calculate monthly trends
    const monthlyData = ascents.reduce((acc, ascent) => {
      const month = new Date(ascent.date_climbed).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(ascent);
      return acc;
    }, {} as Record<string, any[]>);

    stats.monthlyTrends = Object.keys(monthlyData)
      .sort()
      .slice(-12) // Last 12 months
      .map(month => ({
        month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        climbs: monthlyData[month].length,
        avgGrade: 0 // Simplified for now
      }));

    // Calculate grade pyramid
    const gradeCount = ascents.reduce((acc, ascent) => {
      const key = `${ascent.routes?.grade}-${ascent.routes?.climb_type}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.gradePyramid = Object.keys(gradeCount).map(key => {
      const [grade, type] = key.split('-');
      return {
        grade: grade || 'Unknown',
        count: gradeCount[key],
        type: type || 'Unknown'
      };
    });

    return stats;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Dashboard
          </CardTitle>
          <CardDescription>
            Track your climbing progress and achievements
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalClimbs}</div>
            <div className="text-xs text-gray-500">Total Climbs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sendRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Send Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.flashRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Flash Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.outdoorVsIndoor.outdoor + stats.outdoorVsIndoor.indoor > 0 
                ? Math.round((stats.outdoorVsIndoor.outdoor / (stats.outdoorVsIndoor.outdoor + stats.outdoorVsIndoor.indoor)) * 100)
                : 0}%
            </div>
            <div className="text-xs text-gray-500">Outdoor</div>
          </CardContent>
        </Card>
      </div>

      {/* Hardest Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(stats.hardestGrades).map(type => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}: {stats.hardestGrades[type]}
              </Badge>
            ))}
            {Object.keys(stats.hardestGrades).length === 0 && (
              <p className="text-gray-500 text-sm">No records yet - keep climbing!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Detailed Analysis */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="pyramid">Grade Pyramid</TabsTrigger>
          <TabsTrigger value="distribution">Types</TabsTrigger>
          <TabsTrigger value="success">Success Rate</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <ProgressOverTimeChart data={stats.monthlyTrends} />
        </TabsContent>

        <TabsContent value="pyramid" className="mt-6">
          <GradePyramidChart data={stats.gradePyramid} />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <ClimbTypeDistribution 
            outdoor={stats.outdoorVsIndoor.outdoor} 
            indoor={stats.outdoorVsIndoor.indoor} 
          />
        </TabsContent>

        <TabsContent value="success" className="mt-6">
          <SendRateChart 
            sendRate={stats.sendRate}
            flashRate={stats.flashRate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
