
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { TimePeriodSelector, TimePeriod } from '../TimePeriodSelector';
import { useState } from 'react';

interface ProgressData {
  month: string;
  climbs: number;
  avgGrade: number;
}

interface ProgressOverTimeChartProps {
  data: ProgressData[];
}

const chartConfig = {
  climbs: {
    label: "Climbs",
    color: "hsl(var(--chart-1))",
  },
};

export function ProgressOverTimeChart({ data }: ProgressOverTimeChartProps) {
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
        
        // Find climbs for this specific date
        const existingData = data.find(d => {
          return d.month === dateKey;
        });
        
        result.push({
          month: dayKey,
          climbs: existingData?.climbs || 0,
          avgGrade: existingData?.avgGrade || 0
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
        
        // Find climbs for this specific date
        const existingData = data.find(d => {
          return d.month === dateKey;
        });
        
        result.push({
          month: displayKey,
          climbs: existingData?.climbs || 0,
          avgGrade: existingData?.avgGrade || 0
        });
      }
    } else if (period === 'yearly') {
      // Show each month of the current year
      const year = now.getFullYear();
      
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        // Find climbs for this month - sum up all days in the month
        const monthlyClimbs = data.filter(d => {
          return d.month && d.month.startsWith(yearMonth);
        }).reduce((sum, d) => sum + (d.climbs || 0), 0);
        
        // Calculate average grade for the month
        const monthlyData = data.filter(d => {
          return d.month && d.month.startsWith(yearMonth);
        });
        const avgGrade = monthlyData.length > 0 
          ? monthlyData.reduce((sum, d) => sum + (d.avgGrade || 0), 0) / monthlyData.length
          : 0;
        
        result.push({
          month: monthKey,
          climbs: monthlyClimbs,
          avgGrade: avgGrade
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
              <TrendingUp className="h-5 w-5 mr-2" />
              Climbing Trends Over Time
            </CardTitle>
            <CardDescription>Track your climbing volume and progression</CardDescription>
          </div>
          <TimePeriodSelector value={timePeriod} onValueChange={setTimePeriod} />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Not enough data yet - log more climbs to see trends!</p>
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
            <TrendingUp className="h-5 w-5 mr-2" />
            Climbing Trends Over Time
          </CardTitle>
          <CardDescription>Your climbing volume over time</CardDescription>
        </div>
        <TimePeriodSelector value={timePeriod} onValueChange={setTimePeriod} />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillClimbs" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-climbs)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-climbs)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="climbs"
              type="natural"
              fill="url(#fillClimbs)"
              fillOpacity={0.4}
              stroke="var(--color-climbs)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
