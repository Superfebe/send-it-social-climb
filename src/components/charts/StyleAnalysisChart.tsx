
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

interface StyleData {
  style: string;
  count: number;
  percentage: number;
}

interface StyleAnalysisChartProps {
  data: StyleData[];
}

const chartConfig = {
  flash: { label: "Flash", color: "hsl(var(--chart-1))" },
  onsight: { label: "Onsight", color: "hsl(var(--chart-2))" },
  redpoint: { label: "Redpoint", color: "hsl(var(--chart-3))" },
  project: { label: "Project", color: "hsl(var(--chart-4))" },
};

export function StyleAnalysisChart({ data }: StyleAnalysisChartProps) {
  console.log('StyleAnalysisChart received data:', data);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Climbing Styles
          </CardTitle>
          <CardDescription>How do you typically send routes?</CardDescription>
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
          <Star className="h-5 w-5 mr-2" />
          Climbing Styles
        </CardTitle>
        <CardDescription>Your preferred sending styles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="style"
                cx="50%"
                cy="50%"
                innerRadius={60}
                strokeWidth={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig[entry.style.toLowerCase() as keyof typeof chartConfig]?.color || '#8884d8'} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            {data.map((item) => (
              <div key={item.style} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chartConfig[item.style.toLowerCase() as keyof typeof chartConfig]?.color || '#8884d8' }}
                  ></div>
                  <span className="text-sm capitalize">{item.style}</span>
                </div>
                <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
