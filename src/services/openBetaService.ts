
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
      const response = await fetch(`${OPENBETA_API_URL}/climbs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchClimbs($filter: ClimbFilterInput, $sort: ClimbSortInput) {
              climbs(filter: $filter, sort: $sort) {
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
                  v_scale
                  uiaa
                }
                length
                pitches
                content {
                  description
                }
                ancestors {
                  area_name
                  country
                  lat
                  lng
                }
              }
            }
          `,
          variables: {
            filter: {
              name: {
                match: query,
                exactMatch: false
              }
            },
            sort: {
              field: "name",
              direction: "ASC"
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('OpenBeta API errors:', data.errors);
        return [];
      }

      return data.data?.climbs?.map((climb: any) => ({
        id: climb.id,
        name: climb.name,
        type: climb.type,
        grades: climb.grades,
        length: climb.length,
        pitches: climb.pitches,
        description: climb.content?.description,
        area: climb.ancestors?.[0] || { area_name: 'Unknown', country: 'Unknown' }
      })) || [];
    } catch (error) {
      console.error('Error searching OpenBeta routes:', error);
      return [];
    }
  }

  static async getRoutesByArea(areaId: string, limit = 50): Promise<OpenBetaRoute[]> {
    try {
      const response = await fetch(`${OPENBETA_API_URL}/climbs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetClimbsByArea($areaId: ID!) {
              area(uuid: $areaId) {
                climbs {
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
                    v_scale
                    uiaa
                  }
                  length
                  pitches
                  content {
                    description
                  }
                  ancestors {
                    area_name
                    country
                    lat
                    lng
                  }
                }
              }
            }
          `,
          variables: {
            areaId
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('OpenBeta API errors:', data.errors);
        return [];
      }

      return data.data?.area?.climbs?.map((climb: any) => ({
        id: climb.id,
        name: climb.name,
        type: climb.type,
        grades: climb.grades,
        length: climb.length,
        pitches: climb.pitches,
        description: climb.content?.description,
        area: climb.ancestors?.[0] || { area_name: 'Unknown', country: 'Unknown' }
      })) || [];
    } catch (error) {
      console.error('Error fetching routes by area:', error);
      return [];
    }
  }

  static async searchAreas(query: string): Promise<OpenBetaArea[]> {
    try {
      const response = await fetch(`${OPENBETA_API_URL}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchAreas($filter: AreaFilterInput) {
              areas(filter: $filter) {
                area_uuid
                area_name
                country
                lat
                lng
                totalClimbs
              }
            }
          `,
          variables: {
            filter: {
              area_name: {
                match: query,
                exactMatch: false
              }
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('OpenBeta API errors:', data.errors);
        return [];
      }

      return data.data?.areas || [];
    } catch (error) {
      console.error('Error searching OpenBeta areas:', error);
      return [];
    }
  }
}
