
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Mountain } from 'lucide-react';

interface GradeData {
  grade: string;
  count: number;
  type: string;
}

interface GradePyramidChartProps {
  data: GradeData[];
}

const chartConfig = {
  count: {
    label: "Climbs",
    color: "hsl(var(--chart-2))",
  },
};

export function GradePyramidChart({ data }: GradePyramidChartProps) {
  // Group by grade and sum counts
  const groupedData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.grade === item.grade);
    if (existing) {
      existing.count += item.count;
    } else {
      acc.push({ grade: item.grade, count: item.count });
    }
    return acc;
  }, [] as Array<{ grade: string; count: number }>);

  // Sort by grade (simplified - in real app you'd want proper grade sorting)
  const sortedData = groupedData.sort((a, b) => a.grade.localeCompare(b.grade));

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mountain className="h-5 w-5 mr-2" />
            Grade Pyramid
          </CardTitle>
          <CardDescription>
            Distribution of climbs across different grades
          </CardDescription>
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
          <Mountain className="h-5 w-5 mr-2" />
          Grade Pyramid
        </CardTitle>
        <CardDescription>
          Your climbing volume by grade - build a solid base!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={sortedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis 
              dataKey="grade" 
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
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
