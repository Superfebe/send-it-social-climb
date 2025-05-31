
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Star, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';

export default function RoutesPage() {
  return (
    <MobileLayout title="Routes">
      <div className="p-4 space-y-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Route Discovery</h1>
          <p className="text-sm text-gray-600">Explore climbing routes and manage your wishlist</p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
            <TabsTrigger value="wishlist" className="text-xs">Wishlist</TabsTrigger>
            <TabsTrigger value="areas" className="text-xs">Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Routes
                </CardTitle>
                <CardDescription className="text-sm">
                  Discover new climbing routes in your area and beyond
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">Route Database Coming Soon</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
                    We're building a comprehensive database of climbing routes from around the world.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search Routes by Area
                    </Button>
                    <Button variant="outline" className="w-full">
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
                <CardTitle className="flex items-center text-base">
                  <Star className="h-4 w-4 mr-2" />
                  My Wishlist
                </CardTitle>
                <CardDescription className="text-sm">
                  Routes you want to climb in the future
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">Your Wishlist is Empty</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
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

          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <MapPin className="h-4 w-4 mr-2" />
                  Climbing Areas
                </CardTitle>
                <CardDescription className="text-sm">
                  Explore different climbing locations and crags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">Area Directory Coming Soon</h3>
                  <p className="text-sm text-gray-500 mb-6 px-4">
                    Discover climbing areas near you and around the world, with detailed information about access, conditions, and route quality.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Areas Near Me
                    </Button>
                    <Button variant="outline" className="w-full">
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
    </MobileLayout>
  );
}
