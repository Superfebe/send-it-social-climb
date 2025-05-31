
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Activity } from 'lucide-react';
import { SocialFeed } from '@/components/SocialFeed';
import { FriendsList } from '@/components/FriendsList';
import { FriendRequests } from '@/components/FriendRequests';
import { FindFriends } from '@/components/FindFriends';
import { MobileLayout } from '@/components/MobileLayout';

export default function Social() {
  return (
    <MobileLayout title="Social">
      <div className="p-4 space-y-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Social</h1>
          <p className="text-sm text-gray-600">Connect with fellow climbers and share your progress</p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="feed" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="discover" className="text-xs">
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
      </div>
    </MobileLayout>
  );
}
