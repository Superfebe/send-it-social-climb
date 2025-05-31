
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, TrendingUp, Target, MapPin, Plus } from 'lucide-react';
import { RecentAscents } from '@/components/RecentAscents';
import { ClimbingStats } from '@/components/ClimbingStats';
import { LogClimbForm } from '@/components/LogClimbForm';
import { SessionManager } from '@/components/SessionManager';
import { QuickLogForm } from '@/components/QuickLogForm';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  area_id: string | null;
  climb_type: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  areas?: {
    name: string;
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const handleClimbLogged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSessionChange = () => {
    setRefreshTrigger(prev => prev + 1);
    checkActiveSession();
  };

  const checkActiveSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          areas (
            name
          )
        `)
        .eq('user_id', user.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveSession(data);
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkActiveSession();
    }
  }, [user]);

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <h2 className="text-lg font-semibold">Welcome back!</h2>
          <p className="text-blue-100 text-sm">{user?.email}</p>
        </div>

        {/* Session Manager */}
        <SessionManager onSessionChange={handleSessionChange} />
        
        {/* Quick Actions */}
        {activeSession ? (
          <QuickLogForm session={activeSession} onSuccess={handleClimbLogged} />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Plus className="h-4 w-4 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LogClimbForm onSuccess={handleClimbLogged} />
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/routes'}>
                <MapPin className="h-4 w-4 mr-2" />
                Explore Routes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <ClimbingStats key={refreshTrigger} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <RecentAscents key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Climbing Progress
                </CardTitle>
                <CardDescription className="text-sm">
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 space-y-4">
                  <TrendingUp className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">View your detailed progress analysis</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/progress'}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Full Progress Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Target className="h-4 w-4 mr-2" />
                  Goals & Challenges
                </CardTitle>
                <CardDescription className="text-sm">
                  Set and track your climbing goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Target className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Goal tracking coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
