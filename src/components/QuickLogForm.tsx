
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  routeName: z.string().optional(),
  grade: z.string().min(1, 'Grade is required'),
  difficultySystem: z.enum(['yds', 'french', 'v_scale', 'uiaa']),
  style: z.string().optional(),
  attempts: z.number().min(1, 'At least 1 attempt required'),
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

interface QuickLogFormProps {
  session: Session;
  onSuccess?: () => void;
}

const gradeOptions = {
  v_scale: ['VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'],
  yds: ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d', '5.14a', '5.14b', '5.14c', '5.14d', '5.15a', '5.15b', '5.15c', '5.15d'],
  french: ['1', '2', '3', '4a', '4b', '4c', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'],
  uiaa: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VII+', 'VIII-', 'VIII', 'VIII+', 'IX-', 'IX', 'IX+', 'X-', 'X', 'X+', 'XI-', 'XI', 'XI+', 'XII-', 'XII']
};

export function QuickLogForm({ session, onSuccess }: QuickLogFormProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeName: '',
      grade: '',
      difficultySystem: session.climb_type === 'boulder' ? 'v_scale' : 'yds',
      style: '',
      attempts: 1,
    },
  });

  const selectedDifficultySystem = form.watch('difficultySystem');

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Auto-generate route name if not provided and it's gym bouldering
      let finalRouteName = data.routeName;
      if (!finalRouteName && session.climb_type === 'boulder' && session.areas?.name.toLowerCase().includes('gym')) {
        finalRouteName = `${data.grade} Boulder Problem`;
      }
      
      if (!finalRouteName) {
        finalRouteName = `Unnamed ${session.climb_type} route`;
      }

      // Look for existing route with the same name, grade, and climb type in this area
      let { data: routes, error: routeError } = await supabase
        .from('routes')
        .select('id, grade, climb_type')
        .eq('name', finalRouteName)
        .eq('area_id', session.area_id)
        .eq('grade', data.grade)
        .eq('climb_type', session.climb_type)
        .maybeSingle();

      if (routeError) throw routeError;

      let routeId = routes?.id;

      if (!routeId) {
        const { data: newRoute, error: newRouteError } = await supabase
          .from('routes')
          .insert({
            name: finalRouteName,
            area_id: session.area_id,
            climb_type: session.climb_type,
            grade: data.grade,
            difficulty_system: data.difficultySystem,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (newRouteError) throw newRouteError;
        routeId = newRoute.id;
      }

      // Create the ascent linked to the session
      const { error: ascentError } = await supabase
        .from('ascents')
        .insert({
          user_id: user.id,
          route_id: routeId,
          session_id: session.id,
          date_climbed: new Date().toISOString().split('T')[0],
          style: data.style || null,
          attempts: data.attempts,
        });

      if (ascentError) throw ascentError;

      toast({
        title: 'Climb logged!',
        description: `${finalRouteName} (${data.grade}) added to session`,
      });

      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Plus className="h-5 w-5 mr-2" />
          Quick Log
        </CardTitle>
        <CardDescription>
          Log a climb to your active session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="yds">YDS</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="v_scale">V-Scale</SelectItem>
                        <SelectItem value="uiaa">UIAA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeOptions[selectedDifficultySystem].map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="routeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Leave empty for auto-naming" 
                      {...field} 
                    />
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
                    <FormLabel>Style</FormLabel>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging...' : 'Log Climb'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
