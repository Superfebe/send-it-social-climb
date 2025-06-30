
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Star, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { RouteSearch, SearchFilters } from '@/components/RouteSearch';
import { RouteList } from '@/components/RouteList';
import { RouteSeedService } from '@/services/routeSeedService';
import { toast } from 'sonner';

export default function RoutesPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    climbType: '',
    gradeMin: '',
    gradeMax: '',
    area: ''
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isCheckingSeeded, setIsCheckingSeeded] = useState(true);

  useEffect(() => {
    checkSeedStatus();
  }, []);

  const checkSeedStatus = async () => {
    try {
      const seeded = await RouteSeedService.checkIfSeeded();
      setIsSeeded(seeded);
    } catch (error) {
      console.error('Error checking seed status:', error);
    } finally {
      setIsCheckingSeeded(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleSeedRoutes = async () => {
    setIsSeeding(true);
    try {
      toast.info('Importing popular climbing routes... This may take a moment.');
      const importedCount = await RouteSeedService.seedPopularRoutes();
      
      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} popular climbing routes!`);
        setIsSeeded(true);
        // Trigger a refresh of the route list
        setSearchFilters({ ...searchFilters });
      } else {
        toast.info('Routes are already up to date.');
        setIsSeeded(true);
      }
    } catch (error) {
      console.error('Error seeding routes:', error);
      toast.error('Failed to import routes. Please try again.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isCheckingSeeded) {
    return (
      <MobileLayout title="Routes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading routes...</span>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Routes">
      <div className="p-4 space-y-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Route Discovery</h1>
          <p className="text-sm text-gray-600">Explore climbing routes and manage your wishlist</p>
        </div>

        {!isSeeded && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-center">
                <Mountain className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">Get Started with Popular Routes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import a curated collection of popular climbing routes from famous areas like Yosemite, Joshua Tree, Red River Gorge, and more.
                </p>
                <Button 
                  onClick={handleSeedRoutes} 
                  disabled={isSeeding}
                  className="w-full"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing Routes...
                    </>
                  ) : (
                    <>
                      <Mountain className="h-4 w-4 mr-2" />
                      Import Popular Routes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
            <TabsTrigger value="wishlist" className="text-xs">Wishlist</TabsTrigger>
            <TabsTrigger value="areas" className="text-xs">Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-4">
              <RouteSearch onSearch={handleSearch} />
              <RouteList filters={searchFilters} />
            </div>
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
