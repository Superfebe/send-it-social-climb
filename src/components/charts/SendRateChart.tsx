
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface SendRateChartProps {
  sendRate: number;
  flashRate: number;
}

export function SendRateChart({ sendRate, flashRate }: SendRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Success Rates
        </CardTitle>
        <CardDescription>
          How often you're sending climbs on the first try vs. eventually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Send Rate</span>
            <span className="text-sm text-gray-600">{sendRate.toFixed(1)}%</span>
          </div>
          <Progress value={sendRate} className="w-full" />
          <p className="text-xs text-gray-500">
            Percentage of climbs you successfully complete
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Flash Rate</span>
            <span className="text-sm text-gray-600">{flashRate.toFixed(1)}%</span>
          </div>
          <Progress value={flashRate} className="w-full" />
          <p className="text-xs text-gray-500">
            Percentage of climbs you send on the first attempt
          </p>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{sendRate.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Send Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{flashRate.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Flash Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
