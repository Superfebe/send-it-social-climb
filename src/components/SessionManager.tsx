
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Mountain } from 'lucide-react';
import { StartSessionDialog } from './StartSessionDialog';
import { SessionTimer } from './SessionTimer';
import { EndSessionDialog } from './EndSessionDialog';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  area_id: string | null;
  climb_type: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  areas?: {
    name: string;
  };
}

interface SessionManagerProps {
  onSessionChange?: () => void;
}

export function SessionManager({ onSessionChange }: SessionManagerProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkActiveSession();
    }
  }, [user]);

  const checkActiveSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          areas (
            name
          )
        `)
        .eq('user_id', user.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveSession(data);
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleSessionStarted = (session: Session) => {
    setActiveSession(session);
    setShowStartDialog(false);
    onSessionChange?.();
    toast({
      title: 'Session started!',
      description: `Started ${session.climb_type} session`,
    });
  };

  const handleEndSession = () => {
    setShowEndDialog(true);
  };

  const handleSessionEnded = () => {
    setActiveSession(null);
    setShowEndDialog(false);
    onSessionChange?.();
    toast({
      title: 'Session ended!',
      description: 'Session has been saved successfully',
    });
  };

  const getClimbTypeDisplay = (climbType: string) => {
    const types: Record<string, string> = {
      boulder: 'Bouldering',
      sport: 'Sport Climbing',
      trad: 'Trad Climbing',
      aid: 'Aid Climbing',
      mixed: 'Mixed Climbing',
      ice: 'Ice Climbing'
    };
    return types[climbType] || climbType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mountain className="h-5 w-5 mr-2" />
          Session Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSession ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <span className="font-medium">
                    {getClimbTypeDisplay(activeSession.climb_type)}
                  </span>
                </div>
                {activeSession.areas && (
                  <p className="text-sm text-gray-600">
                    at {activeSession.areas.name}
                  </p>
                )}
              </div>
            </div>

            <SessionTimer startTime={activeSession.start_time} />

            <Button 
              onClick={handleEndSession}
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <Square className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No active session</p>
            </div>
            <Button 
              onClick={() => setShowStartDialog(true)}
              className="w-full"
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>
        )}

        <StartSessionDialog
          open={showStartDialog}
          onOpenChange={setShowStartDialog}
          onSessionStarted={handleSessionStarted}
        />

        {activeSession && (
          <EndSessionDialog
            open={showEndDialog}
            onOpenChange={setShowEndDialog}
            session={activeSession}
            onSessionEnded={handleSessionEnded}
          />
        )}
      </CardContent>
    </Card>
  );
}
