
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { MobileLayout } from '@/components/MobileLayout';

export default function Progress() {
  return (
    <MobileLayout title="Progress">
      <div className="p-4">
        <ProgressDashboard />
      </div>
    </MobileLayout>
  );
}
