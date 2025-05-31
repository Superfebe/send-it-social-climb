
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Mountain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  routeName: z.string().min(1, 'Route name is required'),
  areaName: z.string().min(1, 'Location is required'),
  climbType: z.enum(['sport', 'trad', 'boulder', 'aid', 'mixed', 'ice']),
  grade: z.string().min(1, 'Grade is required'),
  difficultySystem: z.enum(['yds', 'french', 'v_scale', 'uiaa']),
  style: z.string().optional(),
  attempts: z.number().min(1, 'At least 1 attempt required'),
  sent: z.boolean(),
  notes: z.string().optional(),
  dateClimbed: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof formSchema>;

interface LogClimbFormProps {
  onSuccess?: () => void;
}

export function LogClimbForm({ onSuccess }: LogClimbFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeName: '',
      areaName: '',
      climbType: 'sport',
      grade: '',
      difficultySystem: 'yds',
      style: '',
      attempts: 1,
      sent: false,
      notes: '',
      dateClimbed: new Date().toISOString().split('T')[0],
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

      // Then, find or create the route
      let { data: routes, error: routeError } = await supabase
        .from('routes')
        .select('id')
        .eq('name', data.routeName)
        .eq('area_id', areaId)
        .maybeSingle();

      if (routeError) throw routeError;

      let routeId = routes?.id;

      if (!routeId) {
        const { data: newRoute, error: newRouteError } = await supabase
          .from('routes')
          .insert({
            name: data.routeName,
            area_id: areaId,
            climb_type: data.climbType,
            grade: data.grade,
            difficulty_system: data.difficultySystem,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (newRouteError) throw newRouteError;
        routeId = newRoute.id;
      }

      // Finally, create the ascent
      const { error: ascentError } = await supabase
        .from('ascents')
        .insert({
          user_id: user.id,
          route_id: routeId,
          date_climbed: data.dateClimbed,
          style: data.style || null,
          attempts: data.attempts,
          notes: data.notes || null,
          rating: null, // Can be added later via edit
        });

      if (ascentError) throw ascentError;

      toast({
        title: 'Climb logged successfully!',
        description: `${data.routeName} has been added to your climbing log.`,
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error logging climb:', error);
      toast({
        title: 'Error logging climb',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Log New Climb
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mountain className="h-5 w-5 mr-2" />
            Log New Climb
          </DialogTitle>
          <DialogDescription>
            Record your climbing session details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="routeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Crimpy McFace" {...field} />
                  </FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="climbType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sport">Sport</SelectItem>
                        <SelectItem value="trad">Trad</SelectItem>
                        <SelectItem value="boulder">Boulder</SelectItem>
                        <SelectItem value="aid">Aid</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="ice">Ice</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultySystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yds">YDS (5.10a)</SelectItem>
                        <SelectItem value="french">French (6a)</SelectItem>
                        <SelectItem value="v_scale">V-Scale (V5)</SelectItem>
                        <SelectItem value="uiaa">UIAA (VII)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5.10a, V5, 6a" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="onsight">Onsight</SelectItem>
                        <SelectItem value="flash">Flash</SelectItem>
                        <SelectItem value="redpoint">Redpoint</SelectItem>
                        <SelectItem value="toprope">Top Rope</SelectItem>
                        <SelectItem value="hangdog">Hangdog</SelectItem>
                        <SelectItem value="attempt">Attempt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attempts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateClimbed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Climbed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How did it feel? Any beta or conditions to note?"
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging Climb...' : 'Log Climb'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
