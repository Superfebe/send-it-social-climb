
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Mountain, Users, UserPlus, Activity, Menu, User } from 'lucide-react';
import { SocialFeed } from '@/components/SocialFeed';
import { FriendsList } from '@/components/FriendsList';
import { FriendRequests } from '@/components/FriendRequests';
import { FindFriends } from '@/components/FindFriends';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Social() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const NavItems = () => (
    <>
      <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
        Dashboard
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/routes'}>
        Routes
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
        Progress
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Social</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Connect with fellow climbers and share your progress</p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 lg:mb-6">
            <TabsTrigger value="feed" className="text-xs sm:text-sm">
              <Activity className="h-4 w-4 mr-1" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="discover" className="text-xs sm:text-sm">
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>

          <TabsContent value="requests">
            <FriendRequests />
          </TabsContent>

          <TabsContent value="discover">
            <FindFriends />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
