import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, Save, Play, Pause, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  notes?: string;
}

interface TrainingSession {
  week: number;
  day: number;
  type: 'climbing' | 'strength' | 'mobility' | 'rest';
  title: string;
  description: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  exercises: Exercise[];
}

interface TrainingPlan {
  id?: string;
  title: string;
  description: string;
  targetGoal: string;
  targetGrade: string;
  gradeSystem: string;
  durationWeeks: number;
  sessions: TrainingSession[];
  status: 'active' | 'completed' | 'paused';
}

const gradeSystemOptions = {
  'V-Scale': ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'],
  'Font': ['3', '4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+'],
  'YDS': ['5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d'],
  'UIAA': ['IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
};

export function DetailedTrainingPlan() {
  const { user } = useAuth();
  const [savedPlans, setSavedPlans] = useState<TrainingPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<TrainingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [planForm, setPlanForm] = useState({
    targetGoal: '',
    targetGrade: 'V5',
    gradeSystem: 'V-Scale',
    durationWeeks: 8,
    experience: 'intermediate'
  });

  useEffect(() => {
    if (user) {
      loadSavedPlans();
    }
  }, [user]);

  const loadSavedPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const plans = data?.map(plan => {
        const planData = plan.plan_data as any;
        return {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          targetGoal: plan.target_goal,
          targetGrade: plan.target_grade || 'V5',
          gradeSystem: planData?.gradeSystem || 'V-Scale',
          durationWeeks: plan.duration_weeks,
          status: plan.status as 'active' | 'completed' | 'paused',
          sessions: planData?.sessions || []
        };
      }) || [];

      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load training plans');
    }
  };

  const generateDetailedPlan = async () => {
    setGenerating(true);
    
    // Simulate realistic plan generation with detailed exercises
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sessions: TrainingSession[] = [];
    
    // Generate sessions for each week
    for (let week = 1; week <= planForm.durationWeeks; week++) {
      const isDeloadWeek = week % 4 === 0;
      
      // Monday - Strength Training
      sessions.push({
        week,
        day: 1,
        type: 'strength',
        title: isDeloadWeek ? 'Deload Strength' : 'Max Strength',
        description: isDeloadWeek ? 'Reduced intensity strength work' : 'Focus on maximum strength development',
        duration: isDeloadWeek ? 60 : 90,
        intensity: isDeloadWeek ? 'low' : 'high',
        exercises: [
          { name: 'Weighted Pull-ups', sets: isDeloadWeek ? 3 : 5, reps: isDeloadWeek ? '3-5' : '1-3', rest: '3min', notes: 'Add weight progressively' },
          { name: 'Hangboard Max Hangs', sets: isDeloadWeek ? 3 : 5, duration: isDeloadWeek ? '7s' : '10s', rest: '3min', notes: '20mm edge, body weight' },
          { name: 'Core Circuit', sets: 3, duration: '45s', rest: '15s', notes: 'Plank, side planks, hollow body' },
          { name: 'Antagonist Training', sets: 2, reps: '10-15', rest: '1min', notes: 'Push-ups, tricep dips, wrist curls' }
        ]
      });

      // Tuesday - Rest
      sessions.push({
        week,
        day: 2,
        type: 'rest',
        title: 'Active Recovery',
        description: 'Light movement and mobility work',
        duration: 30,
        intensity: 'low',
        exercises: [
          { name: 'Light Stretching', duration: '15min', notes: 'Focus on shoulders and forearms' },
          { name: 'Foam Rolling', duration: '10min', notes: 'Full body, especially lats and legs' },
          { name: 'Breathing Exercises', duration: '5min', notes: 'Diaphragmatic breathing for recovery' }
        ]
      });

      // Wednesday - Climbing Volume
      sessions.push({
        week,
        day: 3,
        type: 'climbing',
        title: isDeloadWeek ? 'Easy Volume' : 'Endurance Training',
        description: isDeloadWeek ? 'Easy climbing at low grades' : 'Build climbing endurance and technique',
        duration: isDeloadWeek ? 60 : 120,
        intensity: isDeloadWeek ? 'low' : 'medium',
        exercises: [
          { name: 'Warm-up', duration: '15min', notes: 'Easy traversing and mobility' },
          { name: 'ARC Training', duration: isDeloadWeek ? '15min' : '30min', notes: 'Continuous climbing at 60-70% intensity' },
          { name: '4x4 Pyramid', sets: isDeloadWeek ? 2 : 4, notes: 'Flash grade -2, rest 1min between problems' },
          { name: 'Technique Drills', duration: '20min', notes: 'Silent feet, flagging, precise footwork' }
        ]
      });

      // Thursday - Rest
      sessions.push({
        week,
        day: 4,
        type: 'rest',
        title: 'Complete Rest',
        description: 'Full recovery day',
        duration: 0,
        intensity: 'low',
        exercises: []
      });

      // Friday - Power Training
      sessions.push({
        week,
        day: 5,
        type: 'climbing',
        title: isDeloadWeek ? 'Light Bouldering' : 'Limit Bouldering',
        description: isDeloadWeek ? 'Easy problems for movement' : 'Work at maximum grade',
        duration: isDeloadWeek ? 60 : 90,
        intensity: isDeloadWeek ? 'low' : 'high',
        exercises: [
          { name: 'Dynamic Warm-up', duration: '20min', notes: 'Easy problems with dynamic moves' },
          { name: 'Limit Problems', sets: isDeloadWeek ? 3 : 6, notes: `Flash grade to ${planForm.targetGrade}`, rest: '5min' },
          { name: 'Campus Board', sets: isDeloadWeek ? 0 : 3, reps: '3-5', rest: '3min', notes: 'Progressive rungs 1-4 to 1-5' },
          { name: 'Cool Down', duration: '10min', notes: 'Easy traversing and stretching' }
        ]
      });

      // Saturday - Project Day
      sessions.push({
        week,
        day: 6,
        type: 'climbing',
        title: 'Project Session',
        description: 'Work on target grade projects',
        duration: 90,
        intensity: 'high',
        exercises: [
          { name: 'Warm-up Pyramid', duration: '30min', notes: 'V0 to flash grade progression' },
          { name: 'Project Attempts', sets: 3, notes: `Focus on ${planForm.targetGrade} problems`, rest: '10min' },
          { name: 'Beta Analysis', duration: '15min', notes: 'Study sequences and rest positions' },
          { name: 'Complementary Problems', sets: 2, notes: 'Similar style to project at lower grade' }
        ]
      });

      // Sunday - Mobility
      sessions.push({
        week,
        day: 0,
        type: 'mobility',
        title: 'Mobility & Recovery',
        description: 'Maintain flexibility and aid recovery',
        duration: 45,
        intensity: 'low',
        exercises: [
          { name: 'Yoga Flow', duration: '25min', notes: 'Focus on shoulders, hips, and spine' },
          { name: 'Finger Stretches', duration: '10min', notes: 'Gentle finger and forearm stretches' },
          { name: 'Meditation', duration: '10min', notes: 'Mental recovery and focus training' }
        ]
      });
    }

    const newPlan: TrainingPlan = {
      title: `${planForm.targetGrade} Training Plan`,
      description: `${planForm.durationWeeks}-week plan to achieve ${planForm.targetGoal}`,
      targetGoal: planForm.targetGoal,
      targetGrade: planForm.targetGrade,
      gradeSystem: planForm.gradeSystem,
      durationWeeks: planForm.durationWeeks,
      sessions,
      status: 'active'
    };

    setCurrentPlan(newPlan);
    setGenerating(false);
    setIsCreating(false);
  };

  const savePlan = async (plan: TrainingPlan) => {
    try {
      // Convert the plan data to a format compatible with Supabase Json type
      const planDataForDb = {
        sessions: plan.sessions.map(session => ({
          week: session.week,
          day: session.day,
          type: session.type,
          title: session.title,
          description: session.description,
          duration: session.duration,
          intensity: session.intensity,
          exercises: session.exercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            rest: exercise.rest,
            notes: exercise.notes
          }))
        })),
        gradeSystem: plan.gradeSystem
      };

      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          user_id: user?.id,
          title: plan.title,
          description: plan.description,
          target_goal: plan.targetGoal,
          target_grade: plan.targetGrade,
          duration_weeks: plan.durationWeeks,
          status: plan.status,
          plan_data: planDataForDb
        })
        .select()
        .single();

      if (error) throw error;

      // Save individual training sessions
      const sessionInserts = plan.sessions.map(session => ({
        training_plan_id: data.id,
        week_number: session.week,
        day_number: session.day,
        session_type: session.type,
        title: session.title,
        description: session.description,
        estimated_duration_minutes: session.duration,
        intensity_level: session.intensity,
        exercises: session.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          rest: exercise.rest,
          notes: exercise.notes
        }))
      }));

      const { error: sessionError } = await supabase
        .from('training_sessions')
        .insert(sessionInserts);

      if (sessionError) throw sessionError;

      toast.success('Training plan saved successfully!');
      loadSavedPlans();
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save training plan');
    }
  };

  const loadPlan = (plan: TrainingPlan) => {
    setCurrentPlan(plan);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Create Training Plan</CardTitle>
          <CardDescription className="text-gray-300">Design a personalized training plan for your climbing goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetGoal" className="text-gray-300">Training Goal</Label>
              <Input
                id="targetGoal"
                placeholder="e.g., Send V6 outdoors in 8 weeks"
                value={planForm.targetGoal}
                onChange={(e) => setPlanForm({...planForm, targetGoal: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeSystem" className="text-gray-300">Grade System</Label>
              <Select value={planForm.gradeSystem} onValueChange={(value) => setPlanForm({...planForm, gradeSystem: value, targetGrade: gradeSystemOptions[value as keyof typeof gradeSystemOptions][4]})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="V-Scale">V-Scale (USA Bouldering)</SelectItem>
                  <SelectItem value="Font">Font (European Bouldering)</SelectItem>
                  <SelectItem value="YDS">YDS (USA Sport)</SelectItem>
                  <SelectItem value="UIAA">UIAA (European Sport)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetGrade" className="text-gray-300">Target Grade</Label>
              <Select value={planForm.targetGrade} onValueChange={(value) => setPlanForm({...planForm, targetGrade: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeSystemOptions[planForm.gradeSystem as keyof typeof gradeSystemOptions].map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-300">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                min="4"
                max="16"
                value={planForm.durationWeeks}
                onChange={(e) => setPlanForm({...planForm, durationWeeks: parseInt(e.target.value)})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-gray-300">Experience Level</Label>
            <Select value={planForm.experience} onValueChange={(value) => setPlanForm({...planForm, experience: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateDetailedPlan} disabled={generating || !planForm.targetGoal} className="bg-blue-600 hover:bg-blue-700">
              {generating ? 'Generating...' : 'Generate Plan'}
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentPlan) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>{currentPlan.title}</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-gray-600 text-gray-300">{currentPlan.durationWeeks} weeks</Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-200">{currentPlan.status}</Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-300">{currentPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
            <div>
              <span className="text-sm text-gray-400">Target Goal:</span>
              <p className="font-medium text-white">{currentPlan.targetGoal}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Target Grade:</span>
              <p className="font-medium text-white">{currentPlan.targetGrade} ({currentPlan.gradeSystem})</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Duration:</span>
              <p className="font-medium text-white">{currentPlan.durationWeeks} weeks</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Weekly Schedule Preview
            </h4>
            
            {Array.from({length: Math.min(2, currentPlan.durationWeeks)}, (_, weekIndex) => (
              <div key={weekIndex} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h5 className="font-medium mb-3 text-white">
                  Week {weekIndex + 1} {weekIndex === 3 ? '(Deload Week)' : ''}
                </h5>
                <div className="grid gap-2">
                  {currentPlan.sessions
                    .filter(session => session.week === weekIndex + 1)
                    .map((session, sessionIndex) => (
                      <div key={sessionIndex} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                        <span className="font-medium text-white">
                          {session.day === 0 ? 'Sunday' : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.day - 1]}
                        </span>
                        <span className="text-gray-300">{session.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{session.duration}min</span>
                          <Badge 
                            variant={session.intensity === 'high' ? 'destructive' : session.intensity === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {session.intensity}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {!currentPlan.id && (
              <Button onClick={() => savePlan(currentPlan)} className="flex items-center bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            )}
            <Button variant="outline" onClick={() => setCurrentPlan(null)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Back to Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Training Plans</CardTitle>
        <CardDescription className="text-gray-300">Create and manage detailed climbing training plans</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedPlans.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Your Plans</h4>
            {savedPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800">
                <div>
                  <h5 className="font-medium text-white">{plan.title}</h5>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">{plan.targetGrade}</Badge>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-200">{plan.status}</Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => loadPlan(plan)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Plan
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No training plans yet. Create your first one!</p>
          </div>
        )}
        
        <Button onClick={() => setIsCreating(true)} className="w-full bg-blue-600 hover:bg-blue-700">
          <Target className="h-4 w-4 mr-2" />
          Create New Training Plan
        </Button>
      </CardContent>
    </Card>
  );
}
