
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Star, Search, MapPin } from 'lucide-react';

export default function Routes() {
  const { user, signOut } = useAuth();

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
              <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                Progress
              </Button>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Route Discovery</h1>
            <p className="mt-2 text-gray-600">Explore climbing routes and manage your wishlist</p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Routes</TabsTrigger>
              <TabsTrigger value="wishlist">My Wishlist</TabsTrigger>
              <TabsTrigger value="areas">Areas</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Routes
                  </CardTitle>
                  <CardDescription>
                    Discover new climbing routes in your area and beyond
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Mountain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Route Database Coming Soon</h3>
                    <p className="text-gray-500 mb-6">
                      We're building a comprehensive database of climbing routes from around the world.
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full max-w-sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search Routes by Area
                      </Button>
                      <Button variant="outline" className="w-full max-w-sm">
                        <Mountain className="h-4 w-4 mr-2" />
                        Filter by Difficulty
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    My Wishlist
                  </CardTitle>
                  <CardDescription>
                    Routes you want to climb in the future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-500 mb-6">
                      Start building your climbing wishlist by browsing routes and saving the ones you want to try.
                    </p>
                    <Button>
                      <Star className="h-4 w-4 mr-2" />
                      Browse Routes to Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="areas" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Climbing Areas
                  </CardTitle>
                  <CardDescription>
                    Explore different climbing locations and crags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Area Directory Coming Soon</h3>
                    <p className="text-gray-500 mb-6">
                      Discover climbing areas near you and around the world, with detailed information about access, conditions, and route quality.
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full max-w-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Find Areas Near Me
                      </Button>
                      <Button variant="outline" className="w-full max-w-sm">
                        <Mountain className="h-4 w-4 mr-2" />
                        Popular Destinations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
