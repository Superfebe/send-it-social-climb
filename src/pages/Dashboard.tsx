import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Mountain, TrendingUp, Target, MapPin, Menu } from 'lucide-react';
import { RecentAscents } from '@/components/RecentAscents';
import { ClimbingStats } from '@/components/ClimbingStats';
import { LogClimbForm } from '@/components/LogClimbForm';
import { SessionManager } from '@/components/SessionManager';
import { QuickLogForm } from '@/components/QuickLogForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  const NavItems = () => (
    <>
      <Button variant="ghost" onClick={() => window.location.href = '/routes'}>
        Routes
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
        Progress
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <span className="text-sm text-gray-700 truncate">Welcome, {user?.email}</span>
        <Button variant="outline" onClick={signOut} size={isMobile ? "sm" : "default"}>
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mountain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">ClimbTracker</span>
            </div>
            
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavItems />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-4">
                <NavItems />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Quick Actions - Full width on mobile, sidebar on desktop */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            <SessionManager onSessionChange={handleSessionChange} />
            
            {activeSession ? (
              <QuickLogForm session={activeSession} onSuccess={handleClimbLogged} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Mountain className="h-5 w-5 mr-2" />
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

            <ClimbingStats key={refreshTrigger} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6">
                <TabsTrigger value="recent" className="text-xs sm:text-sm">Recent</TabsTrigger>
                <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
                <TabsTrigger value="goals" className="text-xs sm:text-sm">Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <RecentAscents key={refreshTrigger} />
              </TabsContent>

              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Climbing Progress
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track your improvement over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 lg:py-8 space-y-4">
                      <TrendingUp className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
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
                    <CardTitle className="flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2" />
                      Goals & Challenges
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Set and track your climbing goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 lg:py-8">
                      <Target className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">Goal tracking coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
