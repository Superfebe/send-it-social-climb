import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar, Trophy, Star, Mountain, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GradePyramidChart } from './charts/GradePyramidChart';
import { ProgressOverTimeChart } from './charts/ProgressOverTimeChart';
import { SendRateChart } from './charts/SendRateChart';
import { ClimbTypeDistribution } from './charts/ClimbTypeDistribution';
import { MonthlyVolumeChart } from './charts/MonthlyVolumeChart';
import { GradeProgressionChart } from './charts/GradeProgressionChart';
import { AttemptsAnalysisChart } from './charts/AttemptsAnalysisChart';
import { StyleAnalysisChart } from './charts/StyleAnalysisChart';
import { StatsSelector } from './StatsSelector';

interface ProgressStats {
  totalClimbs: number;
  totalSessions: number;
  avgClimbsPerSession: number;
  hardestGrades: Record<string, string>;
  averageGrades: Record<string, string>;
  sendRate: number;
  flashRate: number;
  onsightRate: number;
  outdoorVsIndoor: { outdoor: number; indoor: number };
  monthlyTrends: Array<{ month: string; climbs: number; avgGrade: number }>;
  monthlyVolume: Array<{ month: string; climbs: number; sessions: number }>;
  gradePyramid: Array<{ grade: string; count: number; type: string }>;
  gradeProgression: Array<{ date: string; hardestGrade: number; avgGrade: number; type: string }>;
  attemptsDistribution: Array<{ attempts: string; count: number }>;
  styleDistribution: Array<{ style: string; count: number; percentage: number }>;
  currentStreak: number;
  longestStreak: number;
  favoriteGrades: Array<{ grade: string; count: number }>;
}

export function ProgressDashboard() {
  const [stats, setStats] = useState<ProgressStats>({
    totalClimbs: 0,
    totalSessions: 0,
    avgClimbsPerSession: 0,
    hardestGrades: {},
    averageGrades: {},
    sendRate: 0,
    flashRate: 0,
    onsightRate: 0,
    outdoorVsIndoor: { outdoor: 0, indoor: 0 },
    monthlyTrends: [],
    monthlyVolume: [],
    gradePyramid: [],
    gradeProgression: [],
    attemptsDistribution: [],
    styleDistribution: [],
    currentStreak: 0,
    longestStreak: 0,
    favoriteGrades: []
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
          console.log('Fetched ascents:', ascents);
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
    console.log('Processing progress data for', ascents.length, 'ascents');
    
    const stats: ProgressStats = {
      totalClimbs: ascents.length,
      totalSessions: 0,
      avgClimbsPerSession: 0,
      hardestGrades: {},
      averageGrades: {},
      sendRate: 0,
      flashRate: 0,
      onsightRate: 0,
      outdoorVsIndoor: { outdoor: 0, indoor: 0 },
      monthlyTrends: [],
      monthlyVolume: [],
      gradePyramid: [],
      gradeProgression: [],
      attemptsDistribution: [],
      styleDistribution: [],
      currentStreak: 0,
      longestStreak: 0,
      favoriteGrades: []
    };

    // Calculate session count (unique dates)
    const uniqueDates = [...new Set(ascents.map(a => a.date_climbed))];
    stats.totalSessions = uniqueDates.length;
    stats.avgClimbsPerSession = stats.totalSessions > 0 ? stats.totalClimbs / stats.totalSessions : 0;

    // Calculate send rates
    const successfulClimbs = ascents.filter(a => a.attempts > 0);
    const flashClimbs = ascents.filter(a => a.style === 'flash');
    const onsightClimbs = ascents.filter(a => a.style === 'onsight');
    
    stats.sendRate = ascents.length > 0 ? (successfulClimbs.length / ascents.length) * 100 : 0;
    stats.flashRate = ascents.length > 0 ? (flashClimbs.length / ascents.length) * 100 : 0;
    stats.onsightRate = ascents.length > 0 ? (onsightClimbs.length / ascents.length) * 100 : 0;

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
        stats.hardestGrades[type] = grades.sort().pop() || '';
      }
    });

    // Create daily volume data for charts
    const dailyData = ascents.reduce((acc, ascent) => {
      const date = ascent.date_climbed; // This should be in YYYY-MM-DD format
      if (!acc[date]) {
        acc[date] = { climbs: 0, sessions: new Set() };
      }
      acc[date].climbs++;
      acc[date].sessions.add(ascent.date_climbed);
      return acc;
    }, {} as Record<string, { climbs: number, sessions: Set<string> }>);

    console.log('Daily data:', dailyData);

    // Convert to the format expected by charts
    stats.monthlyVolume = Object.keys(dailyData).map(date => ({
      month: date, // Use the full date as the key
      climbs: dailyData[date].climbs,
      sessions: dailyData[date].sessions.size
    }));

    console.log('Monthly volume data:', stats.monthlyVolume);

    // Calculate monthly trends (existing logic)
    const monthlyData = ascents.reduce((acc, ascent) => {
      const month = new Date(ascent.date_climbed).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { climbs: [], sessions: new Set() };
      acc[month].climbs.push(ascent);
      acc[month].sessions.add(ascent.date_climbed);
      return acc;
    }, {} as Record<string, { climbs: any[], sessions: Set<string> }>);

    stats.monthlyTrends = Object.keys(monthlyData)
      .sort()
      .slice(-12)
      .map(month => ({
        month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        climbs: monthlyData[month].climbs.length,
        avgGrade: 0
      }));

    // Calculate grade progression over time
    const sortedAscents = [...ascents].sort((a, b) => new Date(a.date_climbed).getTime() - new Date(b.date_climbed).getTime());
    const gradeProgressionData: { [key: string]: { hardestGrade: number; grades: number[]; type: string } } = {};
    
    sortedAscents.forEach(ascent => {
      const date = ascent.date_climbed;
      const grade = ascent.routes?.grade;
      const type = ascent.routes?.climb_type || 'unknown';
      
      if (grade) {
        // Simple numeric conversion for grade comparison (this is simplified)
        const numericGrade = parseFloat(grade.replace(/[^0-9.]/g, '')) || 0;
        
        if (!gradeProgressionData[date]) {
          gradeProgressionData[date] = { hardestGrade: numericGrade, grades: [numericGrade], type };
        } else {
          gradeProgressionData[date].grades.push(numericGrade);
          gradeProgressionData[date].hardestGrade = Math.max(gradeProgressionData[date].hardestGrade, numericGrade);
        }
      }
    });

    stats.gradeProgression = Object.keys(gradeProgressionData)
      .sort()
      .map(date => ({
        date,
        hardestGrade: gradeProgressionData[date].hardestGrade,
        avgGrade: gradeProgressionData[date].grades.reduce((a, b) => a + b, 0) / gradeProgressionData[date].grades.length,
        type: gradeProgressionData[date].type
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

    // Calculate attempts distribution
    const attemptsCount = ascents.reduce((acc, ascent) => {
      const attempts = ascent.attempts || 1;
      const key = attempts === 1 ? '1' : attempts <= 3 ? '2-3' : attempts <= 5 ? '4-5' : '6+';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.attemptsDistribution = Object.keys(attemptsCount).map(attempts => ({
      attempts,
      count: attemptsCount[attempts]
    }));

    // Calculate style distribution
    const styleCount = ascents.reduce((acc, ascent) => {
      const style = ascent.style || 'redpoint';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = ascents.length;
    stats.styleDistribution = Object.keys(styleCount).map(style => ({
      style,
      count: styleCount[style],
      percentage: (styleCount[style] / total) * 100
    }));

    // Calculate favorite grades (most climbed)
    const gradeOnlyCount = ascents.reduce((acc, ascent) => {
      const grade = ascent.routes?.grade;
      if (grade) {
        acc[grade] = (acc[grade] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    stats.favoriteGrades = Object.keys(gradeOnlyCount)
      .map(grade => ({ grade, count: gradeOnlyCount[grade] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    console.log('Final processed stats:', stats);
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
            Comprehensive analysis of your climbing journey
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Enhanced Key Stats Overview with Compact Selector */}
      <StatsSelector 
        totalClimbs={stats.totalClimbs}
        totalSessions={stats.totalSessions}
        avgClimbsPerSession={stats.avgClimbsPerSession}
        sendRate={stats.sendRate}
        flashRate={stats.flashRate}
        onsightRate={stats.onsightRate}
      />

      {/* Personal Records & Favorite Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Favorite Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.favoriteGrades.map((item, index) => (
                <div key={item.grade} className="flex justify-between items-center">
                  <span className="font-medium">{item.grade}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count} climbs</span>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.favoriteGrades.length === 0 && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Analysis */}
      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="pyramid">Pyramid</TabsTrigger>
          <TabsTrigger value="attempts">Attempts</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="mt-6">
          <MonthlyVolumeChart data={stats.monthlyVolume} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <ProgressOverTimeChart data={stats.monthlyTrends} />
        </TabsContent>

        <TabsContent value="pyramid" className="mt-6">
          <GradePyramidChart data={stats.gradePyramid} />
        </TabsContent>

        <TabsContent value="attempts" className="mt-6">
          <AttemptsAnalysisChart data={stats.attemptsDistribution} />
        </TabsContent>

        <TabsContent value="styles" className="mt-6">
          <StyleAnalysisChart data={stats.styleDistribution} />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <ClimbTypeDistribution 
            outdoor={stats.outdoorVsIndoor.outdoor} 
            indoor={stats.outdoorVsIndoor.indoor} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
