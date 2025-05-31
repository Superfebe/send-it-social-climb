
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileActivity } from '@/components/ProfileActivity';
import { ProfileSettings } from '@/components/ProfileSettings';
import { MobileLayout } from '@/components/MobileLayout';

export default function Profile() {
  return (
    <MobileLayout title="Profile">
      <div className="p-4 space-y-4">
        <ProfileHeader />
        
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <ProfileActivity />
          </TabsContent>
          
          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
