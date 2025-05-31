
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface GradeProgressionData {
  date: string;
  hardestGrade: number;
  avgGrade: number;
  type: string;
}

interface GradeProgressionChartProps {
  data: GradeProgressionData[];
}

const chartConfig = {
  hardestGrade: {
    label: "Hardest Grade",
    color: "hsl(var(--chart-1))",
  },
  avgGrade: {
    label: "Average Grade",
    color: "hsl(var(--chart-2))",
  },
};

export function GradeProgressionChart({ data }: GradeProgressionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Grade Progression
          </CardTitle>
          <CardDescription>Track your hardest sends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Log more climbs to see progression!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Grade Progression
        </CardTitle>
        <CardDescription>Your hardest sends and average difficulty over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line 
              dataKey="hardestGrade" 
              stroke="var(--color-hardestGrade)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-hardestGrade)", strokeWidth: 2, r: 4 }}
            />
            <Line 
              dataKey="avgGrade" 
              stroke="var(--color-avgGrade)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-avgGrade)", strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
