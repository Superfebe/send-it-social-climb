
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  climbType: z.enum(['sport', 'trad', 'boulder', 'aid', 'mixed', 'ice']),
  areaName: z.string().min(1, 'Location is required'),
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

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionStarted: (session: Session) => void;
}

export function StartSessionDialog({ open, onOpenChange, onSessionStarted }: StartSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      climbType: 'boulder',
      areaName: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // First, find or create the area
      let { data: areas, error: areaError } = await supabase
        .from('areas')
        .select('id')
        .eq('name', data.areaName)
        .maybeSingle();

      if (areaError) throw areaError;

      let areaId = areas?.id;

      if (!areaId) {
        const { data: newArea, error: newAreaError } = await supabase
          .from('areas')
          .insert({
            name: data.areaName,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (newAreaError) throw newAreaError;
        areaId = newArea.id;
      }

      // Create the session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          area_id: areaId,
          climb_type: data.climbType,
          start_time: new Date().toISOString(),
        })
        .select(`
          *,
          areas (
            name
          )
        `)
        .single();

      if (sessionError) throw sessionError;

      form.reset();
      onSessionStarted(session);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Error starting session',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
          <DialogDescription>
            Choose your climbing discipline and location
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="climbType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Climbing Discipline</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="boulder">Bouldering</SelectItem>
                      <SelectItem value="sport">Sport Climbing</SelectItem>
                      <SelectItem value="trad">Trad Climbing</SelectItem>
                      <SelectItem value="aid">Aid Climbing</SelectItem>
                      <SelectItem value="mixed">Mixed Climbing</SelectItem>
                      <SelectItem value="ice">Ice Climbing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith Rock, Local Gym" {...field} />
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
                {loading ? 'Starting...' : 'Start Session'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
