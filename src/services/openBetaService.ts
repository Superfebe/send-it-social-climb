
const OPENBETA_API_URL = 'https://api.openbeta.io';

export interface OpenBetaRoute {
  id: string;
  name: string;
  type: {
    sport?: boolean;
    trad?: boolean;
    boulder?: boolean;
    aid?: boolean;
    mixed?: boolean;
    ice?: boolean;
  };
  grades: {
    yds?: string;
    french?: string;
    v_scale?: string;
    uiaa?: string;
  };
  length?: number;
  pitches?: number;
  description?: string;
  area: {
    area_name: string;
    country: string;
    lat?: number;
    lng?: number;
  };
}

export interface OpenBetaArea {
  area_uuid: string;
  area_name: string;
  country: string;
  lat?: number;
  lng?: number;
  totalClimbs: number;
}

export class OpenBetaService {
  static async searchRoutes(query: string, limit = 20): Promise<OpenBetaRoute[]> {
    try {
      // First, search for areas matching the query
      const areas = await this.searchAreas(query);
      
      if (areas.length === 0) {
        console.log(`No areas found for query: ${query}`);
        return [];
      }

      // Get routes from the first matching area
      const area = areas[0];
      console.log(`Found area: ${area.area_name}, fetching routes...`);
      
      return await this.getRoutesByArea(area.area_uuid, limit);
    } catch (error) {
      console.error('Error searching OpenBeta routes:', error);
      return [];
    }
  }

  static async getRoutesByArea(areaId: string, limit = 50): Promise<OpenBetaRoute[]> {
    try {
      const response = await fetch(`${OPENBETA_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAreaById($uuid: ID!) {
              area(uuid: $uuid) {
                areaName
                metadata {
                  lat
                  lng
                }
                children {
                  id
                  name
                  type {
                    sport
                    trad
                    boulder
                    aid
                    mixed
                    ice
                  }
                  grades {
                    yds
                    french
                    vscale
                    uiaa
                  }
                  length
                  pitches
                  content {
                    description
                  }
                  pathTokens
                }
              }
            }
          `,
          variables: {
            uuid: areaId
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('OpenBeta API errors:', data.errors);
        return [];
      }

      const area = data.data?.area;
      if (!area) {
        console.log('No area data returned');
        return [];
      }

      // Filter only climbing routes (not sub-areas) and map to our format
      const routes = area.children?.filter((child: any) => child.type && Object.keys(child.type).some(key => child.type[key])) || [];
      
      return routes.slice(0, limit).map((climb: any) => ({
        id: climb.id,
        name: climb.name,
        type: climb.type,
        grades: {
          yds: climb.grades?.yds,
          french: climb.grades?.french,
          v_scale: climb.grades?.vscale,
          uiaa: climb.grades?.uiaa
        },
        length: climb.length,
        pitches: climb.pitches,
        description: climb.content?.description,
        area: {
          area_name: area.areaName,
          country: climb.pathTokens?.[0] || 'Unknown',
          lat: area.metadata?.lat,
          lng: area.metadata?.lng
        }
      }));
    } catch (error) {
      console.error('Error fetching routes by area:', error);
      return [];
    }
  }

  static async searchAreas(query: string): Promise<OpenBetaArea[]> {
    try {
      const response = await fetch(`${OPENBETA_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchAreas($filter: String!) {
              areas(filter: { areaName: { match: $filter } }, sort: { totalClimbs: -1 }) {
                uuid
                areaName
                totalClimbs
                metadata {
                  lat
                  lng
                }
                pathTokens
              }
            }
          `,
          variables: {
            filter: query
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('OpenBeta API errors:', data.errors);
        return [];
      }

      return data.data?.areas?.map((area: any) => ({
        area_uuid: area.uuid,
        area_name: area.areaName,
        country: area.pathTokens?.[0] || 'Unknown',
        lat: area.metadata?.lat,
        lng: area.metadata?.lng,
        totalClimbs: area.totalClimbs || 0
      })) || [];
    } catch (error) {
      console.error('Error searching OpenBeta areas:', error);
      return [];
    }
  }
}
