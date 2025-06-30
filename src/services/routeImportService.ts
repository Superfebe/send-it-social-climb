
import { supabase } from '@/integrations/supabase/client';
import { OpenBetaService, OpenBetaRoute } from './openBetaService';
import { toast } from 'sonner';

type ClimbType = 'sport' | 'trad' | 'boulder' | 'aid' | 'mixed' | 'ice';

export class RouteImportService {
  static async importRoutesFromOpenBeta(searchQuery: string): Promise<number> {
    try {
      const openBetaRoutes = await OpenBetaService.searchRoutes(searchQuery, 50);
      
      if (openBetaRoutes.length === 0) {
        toast.info('No routes found to import');
        return 0;
      }

      let importedCount = 0;

      for (const route of openBetaRoutes) {
        try {
          // Check if route already exists
          const { data: existingRoute } = await supabase
            .from('routes')
            .select('id')
            .eq('name', route.name)
            .eq('external_id', route.id)
            .maybeSingle();

          if (existingRoute) {
            continue; // Skip if already imported
          }

          // Create or get area
          let areaId = await this.createOrGetArea(route.area);

          // Determine climb type
          const climbType = this.getClimbType(route.type);
          
          // Get primary grade
          const grade = route.grades.yds || route.grades.french || route.grades.v_scale || route.grades.uiaa || 'Unknown';

          // Insert route
          const { error } = await supabase
            .from('routes')
            .insert({
              name: route.name,
              description: route.description,
              grade,
              climb_type: climbType,
              length_meters: route.length,
              pitches: route.pitches || 1,
              area_id: areaId,
              external_id: route.id,
              source: 'openbeta',
              last_synced: new Date().toISOString()
            });

          if (!error) {
            importedCount++;
          }
        } catch (error) {
          console.error(`Error importing route ${route.name}:`, error);
        }
      }

      if (importedCount > 0) {
        toast.success(`Imported ${importedCount} routes from OpenBeta`);
      } else {
        toast.info('No new routes to import');
      }

      return importedCount;
    } catch (error) {
      console.error('Error importing routes:', error);
      toast.error('Failed to import routes');
      return 0;
    }
  }

  private static async createOrGetArea(areaData: any): Promise<string | null> {
    if (!areaData.area_name) return null;

    // Check if area exists
    const { data: existingArea } = await supabase
      .from('areas')
      .select('id')
      .eq('name', areaData.area_name)
      .maybeSingle();

    if (existingArea) {
      return existingArea.id;
    }

    // Create new area
    const { data: newArea, error } = await supabase
      .from('areas')
      .insert({
        name: areaData.area_name,
        location: areaData.country,
        latitude: areaData.lat,
        longitude: areaData.lng
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating area:', error);
      return null;
    }

    return newArea.id;
  }

  private static getClimbType(typeObj: any): ClimbType {
    if (typeObj.sport) return 'sport';
    if (typeObj.trad) return 'trad';
    if (typeObj.boulder) return 'boulder';
    if (typeObj.aid) return 'aid';
    if (typeObj.mixed) return 'mixed';
    if (typeObj.ice) return 'ice';
    return 'sport'; // default
  }
}
