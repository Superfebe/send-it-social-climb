import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Target, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StrengthProgressChart } from '@/components/charts/StrengthProgressChart';

interface StrengthStandard {
  exercise_name: string;
  description: string;
  measurement_unit: string;
  benchmarks: {
    beginner: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
}

interface StrengthLog {
  id: string;
  exercise_name: string;
  value: number;
  measurement_unit: string;
  test_date: string;
  notes?: string;
}

export function StrengthTracker() {
  const { user } = useAuth();
  const [standards, setStandards] = useState<StrengthStandard[]>([]);
  const [logs, setLogs] = useState<StrengthLog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);
  const [logForm, setLogForm] = useState({
    value: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadStrengthStandards();
      loadStrengthLogs();
    }
  }, [user]);

  const loadStrengthStandards = async () => {
    try {
      const { data, error } = await supabase
        .from('strength_standards')
        .select('*')
        .order('exercise_name');

      if (error) throw error;
      
      const formattedStandards = data?.map(item => ({
        exercise_name: item.exercise_name,
        description: item.description || '',
        measurement_unit: item.measurement_unit,
        benchmarks: item.benchmarks as any
      })) || [];
      
      setStandards(formattedStandards);
    } catch (error) {
      console.error('Error loading strength standards:', error);
    }
  };

  const loadStrengthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('strength_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading strength logs:', error);
    }
  };

  const logStrengthTest = async () => {
    if (!selectedExercise || !logForm.value) {
      toast.error('Please select an exercise and enter a value');
      return;
    }

    try {
      const standard = standards.find(s => s.exercise_name === selectedExercise);
      if (!standard) return;

      const { error } = await supabase
        .from('strength_logs')
        .insert({
          user_id: user?.id,
          exercise_name: selectedExercise,
          value: parseFloat(logForm.value),
          measurement_unit: standard.measurement_unit,
          notes: logForm.notes
        });

      if (error) throw error;

      toast.success('Strength test logged successfully!');
      setLogForm({ value: '', notes: '' });
      setIsLogging(false);
      loadStrengthLogs();
    } catch (error) {
      console.error('Error logging strength test:', error);
      toast.error('Failed to log strength test');
    }
  };

  const getStrengthLevel = (exerciseName: string, value: number): string => {
    const standard = standards.find(s => s.exercise_name === exerciseName);
    if (!standard) return 'unknown';

    const { benchmarks } = standard;
    if (value >= benchmarks.elite) return 'elite';
    if (value >= benchmarks.advanced) return 'advanced';
    if (value >= benchmarks.intermediate) return 'intermediate';
    if (value >= benchmarks.beginner) return 'beginner';
    return 'developing';
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'elite': return 'bg-purple-500';
      case 'advanced': return 'bg-red-500';
      case 'intermediate': return 'bg-blue-500';
      case 'beginner': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getProgressPercentage = (exerciseName: string, value: number): number => {
    const standard = standards.find(s => s.exercise_name === exerciseName);
    if (!standard) return 0;

    const { benchmarks } = standard;
    const maxValue = benchmarks.elite;
    return Math.min((value / maxValue) * 100, 100);
  };

  const getLatestLog = (exerciseName: string): StrengthLog | undefined => {
    return logs.find(log => log.exercise_name === exerciseName);
  };

  const getExerciseHistory = (exerciseName: string) => {
    return logs
      .filter(log => log.exercise_name === exerciseName)
      .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
      .map(log => ({
        date: new Date(log.test_date).toLocaleDateString(),
        value: log.value
      }));
  };

  if (isLogging) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Log Strength Test</CardTitle>
          <CardDescription className="text-gray-300">Record your latest strength test results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise" className="text-gray-300">Exercise</Label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {standards.map((standard) => (
                  <SelectItem key={standard.exercise_name} value={standard.exercise_name}>
                    {standard.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExercise && (
            <div className="space-y-2">
              <Label htmlFor="value" className="text-gray-300">
                Value ({standards.find(s => s.exercise_name === selectedExercise)?.measurement_unit})
              </Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={logForm.value}
                onChange={(e) => setLogForm({...logForm, value: e.target.value})}
                placeholder="Enter your result"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={logForm.notes}
              onChange={(e) => setLogForm({...logForm, notes: e.target.value})}
              placeholder="Any observations about the test..."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={logStrengthTest} disabled={!selectedExercise || !logForm.value} className="bg-green-600 hover:bg-green-700">
              Save Test
            </Button>
            <Button variant="outline" onClick={() => setIsLogging(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StrengthProgressChart logs={logs} standards={standards} />
      
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-white">
              <TrendingUp className="h-5 w-5 mr-2" />
              Strength Tracking
            </span>
            <Button onClick={() => setIsLogging(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Log Test
            </Button>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Track your climbing-specific strength metrics and compare to standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {standards.map((standard) => {
              const latestLog = getLatestLog(standard.exercise_name);
              const level = latestLog ? getStrengthLevel(standard.exercise_name, latestLog.value) : 'not tested';
              const progress = latestLog ? getProgressPercentage(standard.exercise_name, latestLog.value) : 0;
              const history = getExerciseHistory(standard.exercise_name);

              return (
                <div key={standard.exercise_name} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{standard.description}</h4>
                      <p className="text-sm text-gray-400">
                        Current: {latestLog ? `${latestLog.value} ${standard.measurement_unit}` : 'Not tested'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {level !== 'not tested' && (
                        <Badge variant="secondary" className={`${getLevelColor(level)} text-white`}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {latestLog && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress to Elite</span>
                        <span className="text-gray-300">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                        <div>Beginner: {standard.benchmarks.beginner}{standard.measurement_unit}</div>
                        <div>Intermediate: {standard.benchmarks.intermediate}{standard.measurement_unit}</div>
                        <div>Advanced: {standard.benchmarks.advanced}{standard.measurement_unit}</div>
                        <div>Elite: {standard.benchmarks.elite}{standard.measurement_unit}</div>
                      </div>
                    </div>
                  )}

                  {history.length > 1 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2 text-gray-300">Progress Chart</h5>
                      <div className="h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
