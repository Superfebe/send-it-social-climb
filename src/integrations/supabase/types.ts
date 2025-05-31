export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      ascents: {
        Row: {
          attempts: number | null
          created_at: string
          date_climbed: string
          id: string
          notes: string | null
          rating: number | null
          route_id: string | null
          session_id: string | null
          style: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          date_climbed?: string
          id?: string
          notes?: string | null
          rating?: number | null
          route_id?: string | null
          session_id?: string | null
          style?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          date_climbed?: string
          id?: string
          notes?: string | null
          rating?: number | null
          route_id?: string | null
          session_id?: string | null
          style?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ascents_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ascents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          area_id: string | null
          climb_type: Database["public"]["Enums"]["climb_type"]
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_system: Database["public"]["Enums"]["difficulty_system"]
          grade: string
          id: string
          length_meters: number | null
          name: string
          pitches: number | null
        }
        Insert: {
          area_id?: string | null
          climb_type: Database["public"]["Enums"]["climb_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_system?: Database["public"]["Enums"]["difficulty_system"]
          grade: string
          id?: string
          length_meters?: number | null
          name: string
          pitches?: number | null
        }
        Update: {
          area_id?: string | null
          climb_type?: Database["public"]["Enums"]["climb_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_system?: Database["public"]["Enums"]["difficulty_system"]
          grade?: string
          id?: string
          length_meters?: number | null
          name?: string
          pitches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          area_id: string | null
          climb_type: Database["public"]["Enums"]["climb_type"]
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          climb_type: Database["public"]["Enums"]["climb_type"]
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          climb_type?: Database["public"]["Enums"]["climb_type"]
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          route_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          route_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          route_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      climb_type: "sport" | "trad" | "boulder" | "aid" | "mixed" | "ice"
      difficulty_system: "yds" | "french" | "v_scale" | "uiaa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      climb_type: ["sport", "trad", "boulder", "aid", "mixed", "ice"],
      difficulty_system: ["yds", "french", "v_scale", "uiaa"],
    },
  },
} as const
