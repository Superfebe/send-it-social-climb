
import { supabase } from '@/integrations/supabase/client';
import { OpenBetaService } from './openBetaService';
import { toast } from 'sonner';

type ClimbType = 'sport' | 'trad' | 'boulder' | 'aid' | 'mixed' | 'ice';

export class RouteSeedService {
  // Popular climbing areas to seed data from - including Swedish areas for primary market
  private static readonly POPULAR_AREAS = [
    // Swedish climbing areas (primary market)
    'Bohuslän',
    'Kullaberg',
    'Stora Blå',
    'Ramnefjellet',
    'Höga Kusten',
    'Göteborg',
    'Stockholm',
    'Växjö',
    'Jönköping',
    'Malmö',
    'Sigtuna',
    'Sörmland',
    // Popular international areas
    'Yosemite Valley',
    'Joshua Tree',
    'Red River Gorge',
    'Smith Rock',
    'Moab',
    'Boulder Canyon',
    'Eldorado Canyon',
    'American Fork',
    'Indian Creek',
    'Zion'
  ];

  static async seedPopularRoutes(): Promise<number> {
    try {
      console.log('Starting route seeding process...');
      let totalImported = 0;

      for (const area of this.POPULAR_AREAS) {
        console.log(`Importing routes from ${area}...`);
        
        try {
          const routes = await OpenBetaService.searchRoutes(area, 10);
          
          for (const route of routes) {
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
                  description: route.description || `A ${climbType} route in ${route.area.area_name}`,
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
                totalImported++;
              }
            } catch (error) {
              console.error(`Error importing route ${route.name}:`, error);
            }
          }
          
          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching routes for ${area}:`, error);
        }
      }

      console.log(`Seeding complete. Imported ${totalImported} routes.`);
      return totalImported;
    } catch (error) {
      console.error('Error during route seeding:', error);
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
        longitude: areaData.lng,
        description: `Climbing area in ${areaData.country || 'Unknown location'}`
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

  static async checkIfSeeded(): Promise<boolean> {
    try {
      const { count } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true });
      
      return (count || 0) > 50; // Consider seeded if we have more than 50 routes
    } catch (error) {
      console.error('Error checking seed status:', error);
      return false;
    }
  }
}
