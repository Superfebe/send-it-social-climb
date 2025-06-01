
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { TrainingPlanGenerator } from '@/components/ai/TrainingPlanGenerator';
import { DetailedTrainingPlan } from '@/components/ai/DetailedTrainingPlan';
import { StrengthTracker } from '@/components/ai/StrengthTracker';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { MobileLayout } from '@/components/MobileLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Progress() {
  return (
    <MobileLayout title="Progress">
      <div className="p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <TrainingCalendar />
          </TabsContent>

          <TabsContent value="training" className="mt-6 space-y-6">
            <div className="grid gap-6">
              <TrainingPlanGenerator />
              <DetailedTrainingPlan />
            </div>
          </TabsContent>

          <TabsContent value="strength" className="mt-6">
            <StrengthTracker />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
