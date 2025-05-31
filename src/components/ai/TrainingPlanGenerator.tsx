
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  focus: string[];
  schedule: {
    day: string;
    activity: string;
    intensity: 'Low' | 'Medium' | 'High';
  }[];
  goal: string;
}

export function TrainingPlanGenerator() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<TrainingPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [userStats, setUserStats] = useState({
    primaryDiscipline: 'boulder',
    recentGrade: 'V4',
    weeklyVolume: 3,
    weaknesses: ['finger strength', 'overhang technique']
  });

  useEffect(() => {
    if (user) {
      analyzeUserHistory();
    }
  }, [user]);

  const analyzeUserHistory = async () => {
    try {
      const { data: ascents } = await supabase
        .from('ascents')
        .select('*, routes(*)')
        .eq('user_id', user?.id)
        .order('date_climbed', { ascending: false })
        .limit(50);

      if (ascents && ascents.length > 0) {
        // Analyze primary discipline
        const disciplineCounts = ascents.reduce((acc, ascent) => {
          const type = ascent.routes?.climb_type || 'boulder';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const primaryDiscipline = Object.keys(disciplineCounts).reduce((a, b) => 
          disciplineCounts[a] > disciplineCounts[b] ? a : b
        );

        // Find recent best grade
        const sentAscents = ascents.filter(a => a.attempts > 0);
        const recentGrade = sentAscents.length > 0 ? sentAscents[0].routes?.grade || 'V4' : 'V4';

        setUserStats({
          primaryDiscipline,
          recentGrade,
          weeklyVolume: Math.min(Math.max(Math.floor(ascents.length / 4), 2), 6),
          weaknesses: ['finger strength', 'technique refinement']
        });
      }
    } catch (error) {
      console.error('Error analyzing user history:', error);
    }
  };

  const generatePlan = async () => {
    setGenerating(true);
    
    // Simulate AI generation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan: TrainingPlan = {
      id: '1',
      title: `${userStats.primaryDiscipline} Progression Plan`,
      duration: '4 weeks',
      focus: userStats.weaknesses,
      schedule: [
        { day: 'Monday', activity: 'Technique Focus Session', intensity: 'Medium' },
        { day: 'Tuesday', activity: 'Rest Day', intensity: 'Low' },
        { day: 'Wednesday', activity: 'Power Training', intensity: 'High' },
        { day: 'Thursday', activity: 'Rest Day', intensity: 'Low' },
        { day: 'Friday', activity: 'Volume Session', intensity: 'Medium' },
        { day: 'Saturday', activity: 'Project Session', intensity: 'High' },
        { day: 'Sunday', activity: 'Active Recovery', intensity: 'Low' }
      ],
      goal: `Send ${userStats.recentGrade.includes('V') ? 'V' + (parseInt(userStats.recentGrade.slice(1)) + 1) : '5.' + (parseFloat(userStats.recentGrade.slice(2)) + 0.1).toFixed(1)} consistently`
    };

    setCurrentPlan(plan);
    setGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          AI Training Plans
        </CardTitle>
        <CardDescription>
          Personalized training plans based on your climbing history and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlan ? (
          <div className="text-center py-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Primary Discipline:</span>
                  <Badge variant="outline" className="ml-2 capitalize">{userStats.primaryDiscipline}</Badge>
                </div>
                <div>
                  <span className="text-gray-500">Recent Grade:</span>
                  <Badge variant="outline" className="ml-2">{userStats.recentGrade}</Badge>
                </div>
                <div>
                  <span className="text-gray-500">Weekly Volume:</span>
                  <Badge variant="outline" className="ml-2">{userStats.weeklyVolume} sessions</Badge>
                </div>
                <div>
                  <span className="text-gray-500">Focus Areas:</span>
                  <Badge variant="outline" className="ml-2">{userStats.weaknesses[0]}</Badge>
                </div>
              </div>
              <Button onClick={generatePlan} disabled={generating} className="w-full">
                {generating ? 'Generating Plan...' : 'Generate Training Plan'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{currentPlan.title}</h3>
              <Badge>{currentPlan.duration}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Focus Areas
                </h4>
                <div className="space-y-1">
                  {currentPlan.focus.map((area, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Goal
                </h4>
                <p className="text-sm text-gray-600">{currentPlan.goal}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Weekly Schedule
              </h4>
              <div className="space-y-2">
                {currentPlan.schedule.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-sm">{day.activity}</span>
                    <Badge variant={day.intensity === 'High' ? 'destructive' : day.intensity === 'Medium' ? 'default' : 'secondary'}>
                      {day.intensity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={() => setCurrentPlan(null)} className="w-full">
              Generate New Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
