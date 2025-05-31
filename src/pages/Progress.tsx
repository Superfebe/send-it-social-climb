
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { TrainingPlanGenerator } from '@/components/ai/TrainingPlanGenerator';
import { DetailedTrainingPlan } from '@/components/ai/DetailedTrainingPlan';
import { StrengthTracker } from '@/components/ai/StrengthTracker';
import { SmartClimbSuggestions } from '@/components/ai/SmartClimbSuggestions';
import { SendPredictor } from '@/components/ai/SendPredictor';
import { SmartReminders } from '@/components/ai/SmartReminders';
import { MobileLayout } from '@/components/MobileLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Progress() {
  return (
    <MobileLayout title="Progress">
      <div className="p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6 space-y-6">
            <div className="grid gap-6">
              <SmartClimbSuggestions />
              <SendPredictor />
              <SmartReminders />
            </div>
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
