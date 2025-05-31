
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
      // Show each day of the current month
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const displayKey = day.toString();
        
        const existingData = data.find(d => d.month === dateKey);
        result.push({
          month: displayKey,
          climbs: existingData?.climbs || 0,
          sessions: existingData?.sessions || 0
        });
      }
    } else if (period === 'yearly') {
      // Show each month of the current year
      const year = now.getFullYear();
      
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        const existingData = data.find(d => d.month.startsWith(yearMonth) || d.month === monthKey);
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
