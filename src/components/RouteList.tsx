import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RouteCard } from './RouteCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SearchFilters } from './RouteSearch';

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

interface RouteListProps {
  filters: SearchFilters;
}

export function RouteList({ filters }: RouteListProps) {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [wishlistRoutes, setWishlistRoutes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
    if (user) {
      fetchWishlist();
    }
  }, [filters, user]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('routes')
        .select(`
          id,
          name,
          grade,
          climb_type,
          description,
          length_meters,
          pitches,
          areas (
            name
          )
        `)
        .order('name');

      // Apply filters
      if (filters.query) {
        query = query.ilike('name', `%${filters.query}%`);
      }
      
      if (filters.climbType) {
        // Cast the string to the proper type for the database query
        query = query.eq('climb_type', filters.climbType as any);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching routes:', error);
        toast.error('Failed to load routes');
      } else {
        setRoutes(data || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    }
    setLoading(false);
  };

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('route_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        const routeIds = new Set(data?.map(item => item.route_id).filter(Boolean) || []);
        setWishlistRoutes(routeIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleAddToWishlist = async (routeId: string) => {
    if (!user) {
      toast.error('Please sign in to add routes to your wishlist');
      return;
    }

    try {
      if (wishlistRoutes.has(routeId)) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('route_id', routeId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          toast.error('Failed to remove from wishlist');
        } else {
          setWishlistRoutes(prev => {
            const newSet = new Set(prev);
            newSet.delete(routeId);
            return newSet;
          });
          toast.success('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            route_id: routeId
          });

        if (error) {
          console.error('Error adding to wishlist:', error);
          toast.error('Failed to add to wishlist');
        } else {
          setWishlistRoutes(prev => new Set(prev).add(routeId));
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading routes...</span>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No routes found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onAddToWishlist={handleAddToWishlist}
          isInWishlist={wishlistRoutes.has(route.id)}
        />
      ))}
    </div>
  );
}
