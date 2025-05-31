
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { TimePeriodSelector, TimePeriod } from '../TimePeriodSelector';
import { useState } from 'react';

interface MonthlyData {
  month: string;
  climbs: number;
  sessions: number;
}

interface MonthlyVolumeChartProps {
  data: MonthlyData[];
}

const chartConfig = {
  climbs: {
    label: "Total Climbs",
    color: "hsl(var(--chart-1))",
  },
  sessions: {
    label: "Sessions",
    color: "hsl(var(--chart-2))",
  },
};

export function MonthlyVolumeChart({ data }: MonthlyVolumeChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const generateCompleteTimeSpan = (period: TimePeriod) => {
    const now = new Date();
    const result = [];

    if (period === 'weekly') {
      // Show last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = date.toISOString().split('T')[0];
        
        const existingData = data.find(d => d.month === dateKey);
        result.push({
          month: dayKey,
          climbs: existingData?.climbs || 0,
          sessions: existingData?.sessions || 0
        });
      }
    } else if (period === 'monthly') {
      // Show last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const displayKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        const existingData = data.find(d => d.month === displayKey || d.month === monthKey);
        result.push({
          month: displayKey,
          climbs: existingData?.climbs || 0,
          sessions: existingData?.sessions || 0
        });
      }
    } else if (period === 'yearly') {
      // Show last 5 years by month
      for (let i = 59; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const existingData = data.find(d => d.month === monthKey);
        result.push({
          month: monthKey,
          climbs: existingData?.climbs || 0,
          sessions: existingData?.sessions || 0
        });
      }
    }

    return result;
  };

  const chartData = generateCompleteTimeSpan(timePeriod);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Volume Trends
            </CardTitle>
            <CardDescription>Track your climbing volume and session frequency</CardDescription>
          </div>
          <TimePeriodSelector value={timePeriod} onValueChange={setTimePeriod} />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Not enough data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Volume Trends
          </CardTitle>
          <CardDescription>Your climbing consistency and volume trends</CardDescription>
        </div>
        <TimePeriodSelector value={timePeriod} onValueChange={setTimePeriod} />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="climbs" fill="var(--color-climbs)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
