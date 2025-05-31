
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapPin } from 'lucide-react';

interface ClimbTypeDistributionProps {
  outdoor: number;
  indoor: number;
}

const chartConfig = {
  outdoor: {
    label: "Outdoor",
    color: "hsl(var(--chart-1))",
  },
  indoor: {
    label: "Indoor",
    color: "hsl(var(--chart-2))",
  },
};

export function ClimbTypeDistribution({ outdoor, indoor }: ClimbTypeDistributionProps) {
  const data = [
    { name: 'Outdoor', value: outdoor, color: 'var(--color-outdoor)' },
    { name: 'Indoor', value: indoor, color: 'var(--color-indoor)' },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Indoor vs Outdoor
          </CardTitle>
          <CardDescription>
            Distribution of your climbing sessions
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

  const total = outdoor + indoor;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Indoor vs Outdoor
        </CardTitle>
        <CardDescription>
          Where do you spend most of your climbing time?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                strokeWidth={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Outdoor: {outdoor} ({Math.round((outdoor/total)*100)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Indoor: {indoor} ({Math.round((indoor/total)*100)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
