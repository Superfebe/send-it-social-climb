
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

interface AttemptsData {
  attempts: string;
  count: number;
}

interface AttemptsAnalysisChartProps {
  data: AttemptsData[];
}

const chartConfig = {
  count: {
    label: "Climbs",
    color: "hsl(var(--chart-3))",
  },
};

export function AttemptsAnalysisChart({ data }: AttemptsAnalysisChartProps) {
  console.log('AttemptsAnalysisChart received data:', data);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Attempts Analysis
          </CardTitle>
          <CardDescription>How many tries does it take you to send?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Attempts Analysis
        </CardTitle>
        <CardDescription>Distribution of attempts needed to send routes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <XAxis dataKey="attempts" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
