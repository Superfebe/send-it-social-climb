
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, TrendingUp, Star, Calendar } from 'lucide-react';
import { RecentAscents } from '@/components/RecentAscents';
import { ClimbingStats } from '@/components/ClimbingStats';
import { LogClimbForm } from '@/components/LogClimbForm';
import { useState } from 'react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleClimbLogged = () => {
    // Trigger refresh of stats and recent climbs
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mountain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ClimbTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mountain className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <LogClimbForm onSuccess={handleClimbLogged} />
                  <Button className="w-full" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    View Wishlist
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mountain className="h-4 w-4 mr-2" />
                    Browse Routes
                  </Button>
                </CardContent>
              </Card>

              <ClimbingStats key={refreshTrigger} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="recent">Recent Climbs</TabsTrigger>
                  <TabsTrigger value="routes">Routes</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="mt-6">
                  <RecentAscents key={refreshTrigger} />
                </TabsContent>

                <TabsContent value="routes" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Browse Routes</CardTitle>
                      <CardDescription>
                        Discover new climbing routes in your area
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Route browsing feature coming soon!</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Climbing Progress
                      </CardTitle>
                      <CardDescription>
                        Track your improvement over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 space-y-4">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">View your detailed progress analysis</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/progress'}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Full Progress Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Goals & Challenges
                      </CardTitle>
                      <CardDescription>
                        Set and track your climbing goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Goal tracking coming soon!</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
