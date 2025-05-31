
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Mountain, Star, Search, MapPin, Menu, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function RoutesPage() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const NavItems = () => (
    <>
      <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
        Dashboard
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
        Progress
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/social'}>
        Social
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/profile'}>
        <User className="h-4 w-4 mr-2" />
        Profile
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
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Route Discovery</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Explore climbing routes and manage your wishlist</p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6">
            <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
            <TabsTrigger value="wishlist" className="text-xs sm:text-sm">Wishlist</TabsTrigger>
            <TabsTrigger value="areas" className="text-xs sm:text-sm">Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Routes
                </CardTitle>
                <CardDescription className="text-sm">
                  Discover new climbing routes in your area and beyond
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 lg:py-12">
                  <Mountain className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Route Database Coming Soon</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
                    We're building a comprehensive database of climbing routes from around the world.
                  </p>
                  <div className="space-y-3 max-w-sm mx-auto">
                    <Button className="w-full" size={isMobile ? "sm" : "default"}>
                      <Search className="h-4 w-4 mr-2" />
                      Search Routes by Area
                    </Button>
                    <Button variant="outline" className="w-full" size={isMobile ? "sm" : "default"}>
                      <Mountain className="h-4 w-4 mr-2" />
                      Filter by Difficulty
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Star className="h-5 w-5 mr-2" />
                  My Wishlist
                </CardTitle>
                <CardDescription className="text-sm">
                  Routes you want to climb in the future
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 lg:py-12">
                  <Star className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Your Wishlist is Empty</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
                    Start building your climbing wishlist by browsing routes and saving the ones you want to try.
                  </p>
                  <Button size={isMobile ? "sm" : "default"}>
                    <Star className="h-4 w-4 mr-2" />
                    Browse Routes to Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2" />
                  Climbing Areas
                </CardTitle>
                <CardDescription className="text-sm">
                  Explore different climbing locations and crags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 lg:py-12">
                  <MapPin className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Area Directory Coming Soon</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
                    Discover climbing areas near you and around the world, with detailed information about access, conditions, and route quality.
                  </p>
                  <div className="space-y-3 max-w-sm mx-auto">
                    <Button className="w-full" size={isMobile ? "sm" : "default"}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Areas Near Me
                    </Button>
                    <Button variant="outline" className="w-full" size={isMobile ? "sm" : "default"}>
                      <Mountain className="h-4 w-4 mr-2" />
                      Popular Destinations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
