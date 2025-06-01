
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Play, CheckCircle, Clock, Dumbbell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrainingSession {
  id: string;
  week_number: number;
  day_number: number;
  session_type: 'climbing' | 'strength' | 'mobility' | 'rest';
  title: string;
  description: string;
  estimated_duration_minutes: number;
  intensity_level: 'low' | 'medium' | 'high';
  exercises: any[];
}

interface TodaysSession {
  session: TrainingSession | null;
  isCompleted: boolean;
}

export function TrainingCalendar() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [todaysSession, setTodaysSession] = useState<TodaysSession>({ session: null, isCompleted: false });
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadTrainingSessions();
      loadTodaysSession();
      loadCompletedSessions();
    }
  }, [user, currentWeek]);

  const loadTrainingSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('week_number', currentWeek + 1)
        .order('day_number');

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading training sessions:', error);
    }
  };

  const loadTodaysSession = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('day_number', dayOfWeek === 0 ? 0 : dayOfWeek)
        .eq('week_number', currentWeek + 1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTodaysSession({ session: data, isCompleted: false });
      } else {
        setTodaysSession({ session: null, isCompleted: false });
      }
    } catch (error) {
      console.error('Error loading today\'s session:', error);
    }
  };

  const loadCompletedSessions = async () => {
    // This would typically come from a user_session_completions table
    // For now, we'll simulate it with localStorage
    const completed = JSON.parse(localStorage.getItem(`completed_sessions_${user?.id}`) || '[]');
    setCompletedSessions(completed);
  };

  const markSessionCompleted = (sessionId: string) => {
    const newCompleted = [...completedSessions, sessionId];
    setCompletedSessions(newCompleted);
    localStorage.setItem(`completed_sessions_${user?.id}`, JSON.stringify(newCompleted));
    
    if (todaysSession.session?.id === sessionId) {
      setTodaysSession(prev => ({ ...prev, isCompleted: true }));
    }
  };

  const getDayName = (day: number) => {
    if (day === 0) return 'Sunday';
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day - 1];
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-teal-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="h-4 w-4" />;
      case 'climbing': return <span className="text-sm">🧗</span>;
      case 'mobility': return <span className="text-sm">🧘</span>;
      case 'rest': return <span className="text-sm">😴</span>;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Session Card */}
      {todaysSession.session && (
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  {getTypeIcon(todaysSession.session.session_type)}
                  <span className="ml-2">Today's Training</span>
                </CardTitle>
                <CardDescription className="text-orange-100">
                  {todaysSession.session.title}
                </CardDescription>
              </div>
              {todaysSession.isCompleted ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge className="bg-white text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {todaysSession.session.estimated_duration_minutes}min
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100 mb-4">{todaysSession.session.description}</p>
            <div className="flex gap-2">
              {!todaysSession.isCompleted && (
                <Button 
                  onClick={() => markSessionCompleted(todaysSession.session!.id)}
                  className="bg-white text-orange-600 hover:bg-orange-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}
              <Badge className={`${getIntensityColor(todaysSession.session.intensity_level)} text-white`}>
                {todaysSession.session.intensity_level} intensity
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calendar */}
      <Card className="bg-white border-orange-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Training Schedule
              </CardTitle>
              <CardDescription className="text-gray-600">
                Week {currentWeek + 1} training plan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                disabled={currentWeek === 0}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                Week {currentWeek + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek + 1)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="grid gap-3">
              {sessions.map((session) => {
                const isCompleted = completedSessions.includes(session.id);
                const isToday = todaysSession.session?.id === session.id;
                
                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isToday 
                        ? 'border-orange-400 bg-orange-50' 
                        : isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-orange-200 bg-white hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(session.session_type)}
                          <span className="font-medium text-gray-900">
                            {getDayName(session.day_number)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600">{session.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {isToday && !isCompleted && (
                          <Badge className="bg-orange-500 text-white">
                            Today
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-orange-200 text-orange-600">
                          {session.estimated_duration_minutes}min
                        </Badge>
                        <Badge className={`${getIntensityColor(session.intensity_level)} text-white`}>
                          {session.intensity_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No training sessions scheduled for this week.</p>
              <p className="text-gray-500 text-sm mt-1">Create a training plan to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
