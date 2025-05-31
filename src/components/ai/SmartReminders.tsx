
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Reminder {
  id: string;
  type: 'activity' | 'goal' | 'motivation' | 'streak';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
}

export function SmartReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateReminders();
    }
  }, [user]);

  const generateReminders = async () => {
    setLoading(true);
    
    try {
      // Get user's recent activity
      const { data: recentSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false })
        .limit(10);

      // Get user's recent ascents
      const { data: recentAscents } = await supabase
        .from('ascents')
        .select('*, routes(*)')
        .eq('user_id', user?.id)
        .order('date_climbed', { ascending: false })
        .limit(20);

      const generatedReminders: Reminder[] = [];

      // Check for inactivity
      if (recentSessions && recentSessions.length > 0) {
        const lastSession = new Date(recentSessions[0].start_time);
        const daysSinceLastSession = Math.floor((Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastSession >= 5) {
          generatedReminders.push({
            id: '1',
            type: 'activity',
            title: 'Time to climb!',
            message: `You haven't logged a session in ${daysSinceLastSession} days. Your muscles are probably rested and ready to go!`,
            priority: 'medium',
            actionable: true,
            action: 'Start a new session'
          });
        }
      }

      // Check for goal progress (mock goal for now)
      if (recentAscents && recentAscents.length > 0) {
        const hardestGrade = recentAscents
          .filter(a => a.attempts > 0)
          .map(a => a.routes?.grade)
          .filter(Boolean)[0];

        if (hardestGrade) {
          generatedReminders.push({
            id: '2',
            type: 'goal',
            title: 'Keep pushing your limits',
            message: `You've been consistently climbing ${hardestGrade}. Time to try the next grade up!`,
            priority: 'medium',
            actionable: true,
            action: 'Log a harder climb'
          });
        }
      }

      // Motivational reminder
      generatedReminders.push({
        id: '3',
        type: 'motivation',
        title: 'Weekly inspiration',
        message: 'Every expert was once a beginner. Every pro was once an amateur. Keep climbing!',
        priority: 'low',
        actionable: false
      });

      // Streak reminder
      if (recentSessions && recentSessions.length >= 3) {
        const consecutiveDays = calculateStreak(recentSessions);
        if (consecutiveDays >= 3) {
          generatedReminders.push({
            id: '4',
            type: 'streak',
            title: 'Streak alert!',
            message: `You're on a ${consecutiveDays}-session streak! Don't break it now.`,
            priority: 'high',
            actionable: true,
            action: 'Continue streak'
          });
        }
      }

      setReminders(generatedReminders);
    } catch (error) {
      console.error('Error generating reminders:', error);
    }
    
    setLoading(false);
  };

  const calculateStreak = (sessions: any[]) => {
    // Simple streak calculation - consecutive sessions within reasonable timeframes
    let streak = 0;
    const sortedSessions = sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const current = new Date(sortedSessions[i].start_time);
      const next = new Date(sortedSessions[i + 1].start_time);
      const daysDiff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) { // Sessions within 3 days count as streak
        streak++;
      } else {
        break;
      }
    }
    
    return streak + 1; // Include the current session
  };

  const dismissReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return Clock;
      case 'goal': return Target;
      case 'motivation': return TrendingUp;
      case 'streak': return Bell;
      default: return Bell;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Smart Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Analyzing your activity...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Smart Reminders
        </CardTitle>
        <CardDescription>
          AI-powered reminders to keep you motivated and on track
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No reminders at the moment</p>
            <p className="text-sm text-gray-400">Keep climbing and we'll help keep you motivated!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const IconComponent = getTypeIcon(reminder.type);
              return (
                <div key={reminder.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <h4 className="font-medium">{reminder.title}</h4>
                      <Badge variant={getPriorityColor(reminder.priority)} className="text-xs">
                        {reminder.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissReminder(reminder.id)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{reminder.message}</p>
                  
                  {reminder.actionable && reminder.action && (
                    <Button size="sm" variant="outline">
                      {reminder.action}
                    </Button>
                  )}
                </div>
              );
            })}
            
            <Button variant="outline" onClick={generateReminders} className="w-full mt-4">
              Refresh Reminders
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
