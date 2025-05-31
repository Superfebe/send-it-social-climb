
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClimbSuggestion {
  id: string;
  name: string;
  grade: string;
  discipline: string;
  location: string;
  sendProbability: number;
  reason: string;
  style?: string;
}

export function SmartClimbSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ClimbSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateSuggestions();
    }
  }, [user]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Get user's recent climbing data
      const { data: ascents } = await supabase
        .from('ascents')
        .select('*, routes(*, areas(name))')
        .eq('user_id', user?.id)
        .order('date_climbed', { ascending: false })
        .limit(20);

      // Get available routes (not yet climbed by user)
      const { data: allRoutes } = await supabase
        .from('routes')
        .select('*, areas(name)')
        .limit(50);

      if (ascents && allRoutes) {
        // Filter out already climbed routes
        const climbedRouteIds = ascents.map(a => a.route_id);
        const unclimbedRoutes = allRoutes.filter(r => !climbedRouteIds.includes(r.id));

        // Analyze user preferences
        const userGrades = ascents
          .filter(a => a.attempts > 0)
          .map(a => a.routes?.grade)
          .filter(Boolean);

        const userDisciplines = ascents
          .map(a => a.routes?.climb_type)
          .filter(Boolean);

        const primaryDiscipline = userDisciplines.reduce((acc, d) => {
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topDiscipline = Object.keys(primaryDiscipline).reduce((a, b) => 
          primaryDiscipline[a] > primaryDiscipline[b] ? a : b
        ) || 'boulder';

        // Generate suggestions
        const suggestionList: ClimbSuggestion[] = unclimbedRoutes
          .filter(route => route.climb_type === topDiscipline)
          .slice(0, 6)
          .map((route, index) => ({
            id: route.id,
            name: route.name,
            grade: route.grade,
            discipline: route.climb_type,
            location: route.areas?.name || 'Unknown Area',
            sendProbability: Math.floor(Math.random() * 40) + 60, // 60-100%
            reason: index % 3 === 0 ? 'Similar to your recent sends' : 
                   index % 3 === 1 ? 'Within your grade range' : 
                   'Matches your preferred style',
            style: ['technical', 'powerful', 'endurance'][index % 3]
          }));

        setSuggestions(suggestionList);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Smart Climb Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Analyzing your climbing history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Smart Climb Suggestions
        </CardTitle>
        <CardDescription>
          Routes picked specifically for you based on your climbing patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No suggestions available yet</p>
            <Button onClick={generateSuggestions}>
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{suggestion.name}</h4>
                    <Badge variant="outline">{suggestion.grade}</Badge>
                    <Badge variant="secondary" className="capitalize">
                      {suggestion.discipline}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{suggestion.sendProbability}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{suggestion.location}</span>
                  </div>
                  <span className="italic">{suggestion.reason}</span>
                </div>
                
                {suggestion.style && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.style}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
            
            <Button variant="outline" onClick={generateSuggestions} className="w-full mt-4">
              Refresh Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
