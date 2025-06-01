
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

interface StrengthLog {
  id: string;
  exercise_name: string;
  value: number;
  measurement_unit: string;
  test_date: string;
  notes?: string;
}

interface StrengthProgressChartProps {
  logs: StrengthLog[];
  standards: Array<{
    exercise_name: string;
    description: string;
    measurement_unit: string;
    benchmarks: {
      beginner: number;
      intermediate: number;
      advanced: number;
      elite: number;
    };
  }>;
}

const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87d068', '#ff9999', '#87ceeb'
];

export function StrengthProgressChart({ logs, standards }: StrengthProgressChartProps) {
  const [viewMode, setViewMode] = useState<'individual' | 'overlay'>('individual');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [visibleExercises, setVisibleExercises] = useState<Set<string>>(new Set());

  // Get unique exercises that have logs
  const availableExercises = [...new Set(logs.map(log => log.exercise_name))].sort();

  // Set default selection
  if (!selectedExercise && availableExercises.length > 0) {
    setSelectedExercise(availableExercises[0]);
  }

  // Process data for individual view
  const getIndividualData = (exerciseName: string) => {
    return logs
      .filter(log => log.exercise_name === exerciseName)
      .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
      .map((log, index) => ({
        test: `Test ${index + 1}`,
        date: new Date(log.test_date).toLocaleDateString(),
        value: log.value,
        fullDate: log.test_date
      }));
  };

  // Process data for overlay view
  const getOverlayData = () => {
    const allDates = [...new Set(logs.map(log => log.test_date))].sort();
    
    return allDates.map(date => {
      const dataPoint: any = {
        date: new Date(date).toLocaleDateString(),
        fullDate: date
      };
      
      visibleExercises.forEach(exerciseName => {
        const log = logs.find(l => l.test_date === date && l.exercise_name === exerciseName);
        if (log) {
          // Normalize values to percentage of elite standard for comparison
          const standard = standards.find(s => s.exercise_name === exerciseName);
          if (standard) {
            const normalizedValue = (log.value / standard.benchmarks.elite) * 100;
            dataPoint[exerciseName] = normalizedValue;
            dataPoint[`${exerciseName}_raw`] = log.value;
            dataPoint[`${exerciseName}_unit`] = log.measurement_unit;
          }
        }
      });
      
      return dataPoint;
    });
  };

  const toggleExerciseVisibility = (exerciseName: string) => {
    const newVisible = new Set(visibleExercises);
    if (newVisible.has(exerciseName)) {
      newVisible.delete(exerciseName);
    } else {
      newVisible.add(exerciseName);
    }
    setVisibleExercises(newVisible);
  };

  const individualData = selectedExercise ? getIndividualData(selectedExercise) : [];
  const overlayData = getOverlayData();

  const chartConfig = viewMode === 'individual' 
    ? {
        value: {
          label: selectedExercise ? standards.find(s => s.exercise_name === selectedExercise)?.measurement_unit || "Value" : "Value",
          color: colors[0],
        },
      }
    : Object.fromEntries(
        Array.from(visibleExercises).map((exercise, index) => [
          exercise, {
            label: standards.find(s => s.exercise_name === exercise)?.description || exercise,
            color: colors[index % colors.length],
          }
        ])
      );

  if (logs.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <TrendingUp className="h-5 w-5 mr-2" />
            Strength Progress
          </CardTitle>
          <CardDescription className="text-gray-300">
            Track your strength development over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No strength test data available yet</p>
            <p className="text-sm text-gray-500 mt-2">Log some strength tests to see your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Strength Progress
          </span>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'individual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('individual')}
              className="text-xs"
            >
              Individual
            </Button>
            <Button
              variant={viewMode === 'overlay' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overlay')}
              className="text-xs"
            >
              Overlay
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-gray-300">
          {viewMode === 'individual' 
            ? 'View progress for individual exercises' 
            : 'Compare multiple exercises to identify weak points (normalized as % of elite standard)'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {viewMode === 'individual' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Select Exercise</label>
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {availableExercises.map((exercise) => {
                    const standard = standards.find(s => s.exercise_name === exercise);
                    return (
                      <SelectItem key={exercise} value={exercise}>
                        {standard?.description || exercise}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {individualData.length > 0 && (
              <div className="h-64">
                <ChartContainer config={chartConfig}>
                  <LineChart data={individualData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: any) => [
                        `${value} ${standards.find(s => s.exercise_name === selectedExercise)?.measurement_unit || ''}`,
                        name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={colors[0]} 
                      strokeWidth={2}
                      dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Select Exercises to Compare</label>
              <div className="flex flex-wrap gap-2">
                {availableExercises.map((exercise) => {
                  const standard = standards.find(s => s.exercise_name === exercise);
                  const isVisible = visibleExercises.has(exercise);
                  return (
                    <Button
                      key={exercise}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExerciseVisibility(exercise)}
                      className={`text-xs ${
                        isVisible 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {isVisible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      {standard?.description || exercise}
                    </Button>
                  );
                })}
              </div>
            </div>

            {visibleExercises.size > 0 && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400">
                  Note: Values are normalized as percentage of elite standard for comparison
                </div>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={overlayData}>
                      <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        className="text-xs"
                        tickFormatter={(value) => `${value}%`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any, name: any, props: any) => {
                          const rawValue = props.payload[`${name}_raw`];
                          const unit = props.payload[`${name}_unit`];
                          return [
                            `${rawValue}${unit} (${Math.round(value)}% of elite)`,
                            standards.find(s => s.exercise_name === name)?.description || name
                          ];
                        }}
                      />
                      <Legend />
                      {Array.from(visibleExercises).map((exercise, index) => (
                        <Line
                          key={exercise}
                          type="monotone"
                          dataKey={exercise}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ChartContainer>
                </div>
                
                {visibleExercises.size > 1 && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Weak Point Analysis</h4>
                    <div className="text-xs text-gray-400">
                      Compare the lines to identify exercises where you're furthest from the elite standard. 
                      Lower percentages indicate areas that need more focus in your training.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
