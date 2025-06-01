import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, Save, Play, Pause, CheckCircle, ArrowLeft, Clock, Dumbbell, Trash } from 'lucide-react';
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
  instructions?: string;
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
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
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
    
    // Generate sessions for each week (using actual duration from form)
    for (let week = 1; week <= planForm.durationWeeks; week++) {
      const isDeloadWeek = week % 4 === 0;
      const weekProgress = (week - 1) / (planForm.durationWeeks - 1); // 0 to 1 progression
      const difficultyMultiplier = 0.7 + (weekProgress * 0.3); // Start at 70%, progress to 100%
      
      // Monday - Strength Training
      const strengthSets = isDeloadWeek ? 3 : Math.min(3 + Math.floor(weekProgress * 3), 6);
      const hangboardDuration = isDeloadWeek ? '7s' : `${Math.min(7 + Math.floor(weekProgress * 5), 12)}s`;
      
      sessions.push({
        week,
        day: 1,
        type: 'strength',
        title: isDeloadWeek ? 'Deload Strength' : `Max Strength - Week ${week}`,
        description: isDeloadWeek ? 'Reduced intensity strength work' : `Focus on maximum strength development - ${Math.round(difficultyMultiplier * 100)}% intensity`,
        duration: isDeloadWeek ? 60 : Math.min(90 + Math.floor(weekProgress * 20), 120),
        intensity: isDeloadWeek ? 'low' : (weekProgress > 0.6 ? 'high' : 'medium'),
        exercises: [
          { 
            name: 'Weighted Pull-ups', 
            sets: strengthSets, 
            reps: isDeloadWeek ? '3-5' : (weekProgress > 0.5 ? '1-3' : '3-5'), 
            rest: '3min', 
            notes: `Add ${Math.round(weekProgress * 20)}% bodyweight progressively`,
            instructions: 'Start with bodyweight warm-up. Use belt or vest for added weight. Focus on full range of motion, dead hang to chin over bar. Rest fully between sets.'
          },
          { 
            name: 'Hangboard Max Hangs', 
            sets: strengthSets, 
            duration: hangboardDuration, 
            rest: '3min', 
            notes: `20mm edge, ${isDeloadWeek ? 'bodyweight' : `+${Math.round(weekProgress * 15)}kg`}`,
            instructions: 'Warm up thoroughly first. Use 20mm edge in half-crimp position. Hang with shoulders engaged, not passive. If too easy, add weight; if too hard, use resistance band for assistance.'
          },
          { 
            name: 'Core Circuit', 
            sets: 3, 
            duration: `${Math.min(45 + Math.floor(weekProgress * 15), 60)}s`, 
            rest: '15s', 
            notes: 'Plank, side planks, hollow body',
            instructions: 'Perform each exercise for duration with 15s transition: 1) Front plank with perfect form, 2) Right side plank, 3) Left side plank, 4) Hollow body hold. Focus on quality over quantity.'
          },
          { 
            name: 'Antagonist Training', 
            sets: 2, 
            reps: '10-15', 
            rest: '1min', 
            notes: 'Push-ups, tricep dips, wrist curls',
            instructions: 'Balance your climbing training: Push-ups for chest/triceps, tricep dips for elbow health, wrist curls both directions for forearm balance. Light resistance, focus on mobility.'
          }
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
          { 
            name: 'Light Stretching', 
            duration: '15min', 
            notes: 'Focus on shoulders and forearms',
            instructions: 'Gentle static stretches: shoulder circles, doorway chest stretch, forearm stretches, neck rolls. Hold each stretch 30-60 seconds, never force.'
          },
          { 
            name: 'Foam Rolling', 
            duration: '10min', 
            notes: 'Full body, especially lats and legs',
            instructions: 'Roll slowly over tight areas. Spend extra time on lats, IT band, calves. Avoid rolling directly on spine or joints. 1-2 minutes per muscle group.'
          },
          { 
            name: 'Breathing Exercises', 
            duration: '5min', 
            notes: 'Diaphragmatic breathing for recovery',
            instructions: 'Lie down comfortably. Place one hand on chest, one on belly. Breathe so only the hand on belly moves. 4 counts in, 6 counts out. Promotes recovery.'
          }
        ]
      });

      // Wednesday - Climbing Volume
      const arcDuration = isDeloadWeek ? '15min' : `${Math.min(20 + Math.floor(weekProgress * 15), 35)}min`;
      const pyramidSets = isDeloadWeek ? 2 : Math.min(3 + Math.floor(weekProgress * 2), 5);
      
      sessions.push({
        week,
        day: 3,
        type: 'climbing',
        title: isDeloadWeek ? 'Easy Volume' : `Endurance Training - Week ${week}`,
        description: isDeloadWeek ? 'Easy climbing at low grades' : `Build climbing endurance and technique - ${Math.round(difficultyMultiplier * 100)}% volume`,
        duration: isDeloadWeek ? 60 : Math.min(90 + Math.floor(weekProgress * 30), 150),
        intensity: isDeloadWeek ? 'low' : (weekProgress > 0.7 ? 'high' : 'medium'),
        exercises: [
          { 
            name: 'Warm-up', 
            duration: '15min', 
            notes: 'Easy traversing and mobility',
            instructions: 'Start with arm circles, leg swings. Then easy traverse problems or routes 2-3 grades below your limit. Gradually increase intensity.'
          },
          { 
            name: 'ARC Training', 
            duration: arcDuration, 
            notes: `Continuous climbing at ${Math.round(60 + weekProgress * 10)}% intensity`,
            instructions: 'Aerobic Restoration and Capillarity training. Climb continuously at easy grade (flash -2 to -3). Keep moving, minimal rest on holds. Build capillary density.'
          },
          { 
            name: '4x4 Pyramid', 
            sets: pyramidSets, 
            notes: `Flash grade -${3 - Math.floor(weekProgress)}, rest 1min between problems`,
            instructions: `Climb 4 problems in sequence with 1min rest between each. Problems should be flash grade -${3 - Math.floor(weekProgress)}. Rest 5min between sets. Builds power endurance.`
          }
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
      const limitSets = isDeloadWeek ? 3 : Math.min(4 + Math.floor(weekProgress * 3), 8);
      
      sessions.push({
        week,
        day: 5,
        type: 'climbing',
        title: isDeloadWeek ? 'Light Bouldering' : `Limit Bouldering - Week ${week}`,
        description: isDeloadWeek ? 'Easy problems for movement' : `Work at maximum grade - ${Math.round(difficultyMultiplier * 100)}% intensity`,
        duration: isDeloadWeek ? 60 : Math.min(75 + Math.floor(weekProgress * 25), 120),
        intensity: isDeloadWeek ? 'low' : 'high',
        exercises: [
          { 
            name: 'Dynamic Warm-up', 
            duration: '20min', 
            notes: 'Easy problems with dynamic moves',
            instructions: 'Start with gentle movements, progress to dynamic problems 3-4 grades below limit. Include coordination moves, mantles, and different hold types.'
          },
          { 
            name: 'Limit Problems', 
            sets: limitSets, 
            notes: `Flash grade to ${planForm.targetGrade}${weekProgress > 0.6 ? ' and beyond' : ''}`, 
            rest: '5min',
            instructions: `Try problems from flash grade up to ${planForm.targetGrade}${weekProgress > 0.6 ? ' and one grade harder' : ''}. Focus on perfect technique. Rest fully between attempts. Quality over quantity.`
          }
        ]
      });

      // Saturday - Project Day
      sessions.push({
        week,
        day: 6,
        type: 'climbing',
        title: `Project Session - Week ${week}`,
        description: `Work on target grade projects - ${Math.round(difficultyMultiplier * 100)}% focus`,
        duration: Math.min(90 + Math.floor(weekProgress * 20), 120),
        intensity: weekProgress > 0.5 ? 'high' : 'medium',
        exercises: [
          { 
            name: 'Warm-up Pyramid', 
            duration: '30min', 
            notes: 'V0 to flash grade progression',
            instructions: 'Progressive warm-up: Start V0, work up to flash grade over 30min. Include variety of hold types and movement styles.'
          },
          { 
            name: 'Project Attempts', 
            sets: Math.min(2 + Math.floor(weekProgress * 2), 4), 
            notes: `Focus on ${planForm.targetGrade} problems${weekProgress > 0.7 ? ' and harder projects' : ''}`, 
            rest: '10min',
            instructions: `Work specifically on ${planForm.targetGrade} problems${weekProgress > 0.7 ? ' and attempt projects one grade harder' : ''}. Break down sequences, work moves individually, then link. Film yourself for analysis.`
          }
        ]
      });

      // Sunday - Mobility
      sessions.push({
        week,
        day: 0,
        type: 'mobility',
        title: `Mobility & Recovery - Week ${week}`,
        description: 'Maintain flexibility and aid recovery',
        duration: Math.min(45 + Math.floor(weekProgress * 15), 60),
        intensity: 'low',
        exercises: [
          { 
            name: 'Yoga Flow', 
            duration: `${Math.min(25 + Math.floor(weekProgress * 10), 35)}min`, 
            notes: 'Focus on shoulders, hips, and spine',
            instructions: 'Flowing sequence: cat-cow, downward dog, warrior poses, pigeon pose. Hold poses 1-2 minutes. Focus on areas tight from climbing.'
          },
          { 
            name: 'Finger Stretches', 
            duration: '10min', 
            notes: 'Gentle finger and forearm stretches',
            instructions: 'Prayer stretch, reverse prayer, individual finger extensions, wrist circles. Very gentle - fingers are delicate. Hold 30-60 seconds each.'
          },
          { 
            name: 'Meditation', 
            duration: '10min', 
            notes: 'Mental recovery and focus training',
            instructions: 'Comfortable seated position. Focus on breath or use guided meditation app. Mental training is crucial for climbing performance and recovery.'
          }
        ]
      });
    }

    const newPlan: TrainingPlan = {
      title: `${planForm.targetGrade} Training Plan (${planForm.durationWeeks} weeks)`,
      description: `${planForm.durationWeeks}-week progressive plan to achieve ${planForm.targetGoal}`,
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
            notes: exercise.notes,
            instructions: exercise.instructions
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
          notes: exercise.notes,
          instructions: exercise.instructions
        }))
      }));

      const { error: sessionError } = await supabase
        .from('training_sessions')
        .insert(sessionInserts);

      if (sessionError) throw sessionError;

      toast.success('Training plan saved successfully!');
      loadSavedPlans();
      
      // Return to the plans list after saving
      setCurrentPlan(null);
      setIsCreating(false);
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save training plan');
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast.success('Training plan deleted successfully!');
      loadSavedPlans();
      
      // If the deleted plan was currently viewed, go back to plans list
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }
      
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete training plan');
    }
  };

  const loadPlan = (plan: TrainingPlan) => {
    setCurrentPlan(plan);
    setIsCreating(false);
    setSelectedSession(null);
  };

  const getDayName = (day: number) => {
    if (day === 0) return 'Sunday';
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day - 1];
  };

  // Session Detail View
  if (selectedSession) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedSession(null)}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-white">
                {getDayName(selectedSession.day)} - {selectedSession.title}
              </CardTitle>
              <CardDescription className="text-gray-300">
                Week {selectedSession.week} • {selectedSession.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              <Clock className="h-3 w-3 mr-1" />
              {selectedSession.duration}min
            </Badge>
            <Badge 
              variant={selectedSession.intensity === 'high' ? 'destructive' : selectedSession.intensity === 'medium' ? 'default' : 'secondary'}
            >
              {selectedSession.intensity} intensity
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
              {selectedSession.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedSession.exercises.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center">
                <Dumbbell className="h-4 w-4 mr-2" />
                Exercises ({selectedSession.exercises.length})
              </h4>
              {selectedSession.exercises.map((exercise, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-white text-lg">{exercise.name}</h5>
                    <div className="flex gap-2 text-sm">
                      {exercise.sets && (
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          {exercise.sets} sets
                        </Badge>
                      )}
                      {exercise.reps && (
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          {exercise.reps} reps
                        </Badge>
                      )}
                      {exercise.duration && (
                        <Badge variant="secondary" className="bg-purple-600 text-white">
                          {exercise.duration}
                        </Badge>
                      )}
                      {exercise.rest && (
                        <Badge variant="secondary" className="bg-orange-600 text-white">
                          Rest: {exercise.rest}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {exercise.instructions && (
                    <div className="mb-3">
                      <h6 className="font-medium text-blue-300 mb-1">Instructions:</h6>
                      <p className="text-gray-300 text-sm leading-relaxed">{exercise.instructions}</p>
                    </div>
                  )}
                  
                  {exercise.notes && (
                    <div>
                      <h6 className="font-medium text-yellow-300 mb-1">Notes:</h6>
                      <p className="text-gray-400 text-sm">{exercise.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Rest day - no exercises planned</p>
              <p className="text-gray-500 text-sm mt-1">Focus on recovery and light movement</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
            
            {Array.from({length: Math.min(4, currentPlan.durationWeeks)}, (_, weekIndex) => (
              <div key={weekIndex} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h5 className="font-medium mb-3 text-white">
                  Week {weekIndex + 1} {(weekIndex + 1) % 4 === 0 ? '(Deload Week)' : ''}
                </h5>
                <div className="grid gap-2">
                  {currentPlan.sessions
                    .filter(session => session.week === weekIndex + 1)
                    .map((session, sessionIndex) => (
                      <div 
                        key={sessionIndex} 
                        className="flex items-center justify-between p-3 bg-gray-700 rounded text-sm cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => setSelectedSession(session)}
                      >
                        <span className="font-medium text-white">
                          {getDayName(session.day)}
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
            
            {currentPlan.durationWeeks > 4 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Showing first 4 weeks. Click on any day to see detailed exercises.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Full {currentPlan.durationWeeks}-week plan includes progressive difficulty scaling.
                </p>
              </div>
            )}
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
                    <Badge variant="outline" className="border-gray-600 text-gray-300">{plan.durationWeeks} weeks</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => loadPlan(plan)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    View Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deletePlan(plan.id!)}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
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
