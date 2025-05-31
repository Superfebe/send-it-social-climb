
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Clock, Mountain, Trophy, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface Ascent {
  id: string;
  style: string;
  attempts: number;
  routes: {
    name: string;
    grade: string;
    difficulty_system: string;
  };
}

interface SessionDetailsProps {
  session: Session;
  onBack: () => void;
}

interface SessionStats {
  totalRoutes: number;
  totalAttempts: number;
  sends: number;
  sendRate: number;
  avgAttemptsPerRoute: number;
  mostClimbedGrade: string | null;
  hardestGrade: string | null;
  easiestGrade: string | null;
  gradeDistribution: { [key: string]: number };
}

export function SessionDetails({ session, onBack }: SessionDetailsProps) {
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, [session.id]);

  const fetchSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('ascents')
        .select(`
          id,
          style,
          attempts,
          routes (
            name,
            grade,
            difficulty_system
          )
        `)
        .eq('session_id', session.id)
        .order('id');

      if (error) throw error;

      setAscents(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ascentData: Ascent[]) => {
    if (ascentData.length === 0) {
      setStats({
        totalRoutes: 0,
        totalAttempts: 0,
        sends: 0,
        sendRate: 0,
        avgAttemptsPerRoute: 0,
        mostClimbedGrade: null,
        hardestGrade: null,
        easiestGrade: null,
        gradeDistribution: {}
      });
      return;
    }

    const totalRoutes = ascentData.length;
    const totalAttempts = ascentData.reduce((sum, a) => sum + a.attempts, 0);
    const sends = ascentData.filter(a => a.attempts === 1).length;
    const sendRate = (sends / totalRoutes) * 100;
    const avgAttemptsPerRoute = totalAttempts / totalRoutes;

    // Grade analysis
    const grades = ascentData.map(a => a.routes.grade);
    const gradeDistribution: { [key: string]: number } = {};
    
    grades.forEach(grade => {
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    const mostClimbedGrade = Object.entries(gradeDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    // For simplicity, we'll use basic grade comparison
    // This could be enhanced with proper grade conversion logic
    const sortedGrades = [...new Set(grades)].sort();
    const easiestGrade = sortedGrades[0] || null;
    const hardestGrade = sortedGrades[sortedGrades.length - 1] || null;

    setStats({
      totalRoutes,
      totalAttempts,
      sends,
      sendRate,
      avgAttemptsPerRoute,
      mostClimbedGrade,
      hardestGrade,
      easiestGrade,
      gradeDistribution
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Ongoing';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Loading session details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5" />
                Session at {session.areas?.name || 'Unknown Area'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {formatDate(session.start_time)}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                {formatDuration(session.duration_minutes)}
                <span className="mx-2">•</span>
                <Badge variant="outline" className="capitalize">
                  {session.climb_type}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {session.notes && (
            <p className="text-sm text-gray-600 italic mt-3">"{session.notes}"</p>
          )}
        </CardHeader>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRoutes}</div>
              <p className="text-xs text-gray-500">Routes Climbed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.sends}</div>
              <p className="text-xs text-gray-500">Sends ({stats.sendRate.toFixed(1)}%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.totalAttempts}</div>
              <p className="text-xs text-gray-500">Total Attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.avgAttemptsPerRoute.toFixed(1)}</div>
              <p className="text-xs text-gray-500">Avg Attempts/Route</p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Grade Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {stats.hardestGrade || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Hardest Grade</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {stats.mostClimbedGrade || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Most Climbed</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {stats.easiestGrade || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Easiest Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Routes Climbed</CardTitle>
        </CardHeader>
        <CardContent>
          {ascents.length === 0 ? (
            <div className="text-center py-8">
              <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No routes climbed in this session</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ascents.map((ascent) => (
                  <TableRow key={ascent.id}>
                    <TableCell className="font-medium">
                      {ascent.routes.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ascent.routes.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ascent.style && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${getStyleColor(ascent.style)}`}
                        >
                          <span className="flex items-center gap-1">
                            {getStyleIcon(ascent.style)}
                            {ascent.style}
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ascent.attempts === 1 ? "default" : "outline"}>
                        {ascent.attempts}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
