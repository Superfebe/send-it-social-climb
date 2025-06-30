
import { Star, MapPin, Mountain, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Route {
  id: string;
  name: string;
  grade: string;
  climb_type: string;
  area?: {
    name: string;
  };
  description?: string;
  length_meters?: number;
  pitches?: number;
}

interface RouteCardProps {
  route: Route;
  onAddToWishlist: (routeId: string) => void;
  isInWishlist?: boolean;
}

export function RouteCard({ route, onAddToWishlist, isInWishlist }: RouteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{route.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {route.grade}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {route.climb_type}
              </Badge>
            </div>
          </div>
          <Button
            variant={isInWishlist ? "default" : "outline"}
            size="sm"
            onClick={() => onAddToWishlist(route.id)}
            className="shrink-0"
          >
            {isInWishlist ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {route.area && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{route.area.name}</span>
          </div>
        )}

        {route.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {route.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {route.length_meters && (
            <div className="flex items-center">
              <Mountain className="h-3 w-3 mr-1" />
              <span>{route.length_meters}m</span>
            </div>
          )}
          {route.pitches && route.pitches > 1 && (
            <span>{route.pitches} pitches</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
