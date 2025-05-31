
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

interface EndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
  onSessionEnded: () => void;
}

export function EndSessionDialog({ open, onOpenChange, session, onSessionEnded }: EndSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });

  const calculateSessionStats = () => {
    const start = new Date(session.start_time);
    const end = new Date();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return {
      durationMinutes,
      durationDisplay: `${hours}h ${minutes}m`
    };
  };

  const fetchSessionClimbs = async () => {
    const { data: climbs, error } = await supabase
      .from('ascents')
      .select('*')
      .eq('session_id', session.id);

    if (error) throw error;

    const sends = climbs?.filter(c => c.attempts === 1) || [];
    const totalAttempts = climbs?.reduce((sum, c) => sum + (c.attempts || 0), 0) || 0;

    return {
      totalClimbs: climbs?.length || 0,
      sends: sends.length,
      totalAttempts,
    };
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      const stats = calculateSessionStats();
      const endTime = new Date().toISOString();

      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: endTime,
          duration_minutes: stats.durationMinutes,
          notes: data.notes || null,
        })
        .eq('id', session.id);

      if (error) throw error;

      form.reset();
      onSessionEnded();
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Error ending session',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchSessionClimbs().then(stats => setSessionStats(stats));
    }
  }, [open]);

  const stats = calculateSessionStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>End Session</DialogTitle>
          <DialogDescription>
            Review your session and add any notes
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{stats.durationDisplay}</span>
              </div>
              {sessionStats && (
                <>
                  <div className="flex justify-between">
                    <span>Total Climbs:</span>
                    <span className="font-medium">{sessionStats.totalClimbs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sends:</span>
                    <span className="font-medium">{sessionStats.sends}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Attempts:</span>
                    <span className="font-medium">{sessionStats.totalAttempts}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How did the session go? Any observations?"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Ending...' : 'End Session'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
