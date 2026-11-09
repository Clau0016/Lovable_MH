export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      landlord_profiles: {
        Row: {
          address: string
          available_from: string
          available_rooms: number
          bills_included: boolean
          city: string
          created_at: string
          current_tenants: number
          description: string
          floor: number | null
          furnished: boolean
          house_rules: string | null
          is_active: boolean
          latitude: number
          longitude: number
          neighborhood_info: string | null
          parking_available: boolean
          pets_allowed: boolean
          rent: number
          smoking_allowed: boolean
          square_meters: number | null
          title: string
          total_rooms: number
          updated_at: string
          user_id: string
          wifi_included: boolean
        }
        Insert: {
          address: string
          available_from: string
          available_rooms: number
          bills_included?: boolean
          city: string
          created_at?: string
          current_tenants?: number
          description: string
          floor?: number | null
          furnished?: boolean
          house_rules?: string | null
          is_active?: boolean
          latitude: number
          longitude: number
          neighborhood_info?: string | null
          parking_available?: boolean
          pets_allowed?: boolean
          rent: number
          smoking_allowed?: boolean
          square_meters?: number | null
          title: string
          total_rooms: number
          updated_at?: string
          user_id: string
          wifi_included?: boolean
        }
        Update: {
          address?: string
          available_from?: string
          available_rooms?: number
          bills_included?: boolean
          city?: string
          created_at?: string
          current_tenants?: number
          description?: string
          floor?: number | null
          furnished?: boolean
          house_rules?: string | null
          is_active?: boolean
          latitude?: number
          longitude?: number
          neighborhood_info?: string | null
          parking_available?: boolean
          pets_allowed?: boolean
          rent?: number
          smoking_allowed?: boolean
          square_meters?: number | null
          title?: string
          total_rooms?: number
          updated_at?: string
          user_id?: string
          wifi_included?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "landlord_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          id: string
          position: number
          storage_path: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          storage_path?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          storage_path?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          id: string
          is_demo?: boolean
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      seeker_profiles: {
        Row: {
          age: number
          bio: string
          budget_max: number | null
          budget_min: number | null
          cleanliness: number
          company: string | null
          created_at: string
          first_name: string
          has_pets: boolean
          hobbies: string[]
          languages: string[]
          last_name: string
          move_in_date: string | null
          noise_level: number
          occupation: string
          preferred_city: string | null
          schedule: string | null
          smoker: boolean
          sports: string[]
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          bio: string
          budget_max?: number | null
          budget_min?: number | null
          cleanliness?: number
          company?: string | null
          created_at?: string
          first_name: string
          has_pets?: boolean
          hobbies?: string[]
          languages?: string[]
          last_name: string
          move_in_date?: string | null
          noise_level?: number
          occupation: string
          preferred_city?: string | null
          schedule?: string | null
          smoker?: boolean
          sports?: string[]
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          bio?: string
          budget_max?: number | null
          budget_min?: number | null
          cleanliness?: number
          company?: string | null
          created_at?: string
          first_name?: string
          has_pets?: boolean
          hobbies?: string[]
          languages?: string[]
          last_name?: string
          move_in_date?: string | null
          noise_level?: number
          occupation?: string
          preferred_city?: string | null
          schedule?: string | null
          smoker?: boolean
          sports?: string[]
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at: string
          from_user: string
          to_user: string
        }
        Insert: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at?: string
          from_user: string
          to_user: string
        }
        Update: {
          action?: Database["public"]["Enums"]["swipe_action"]
          created_at?: string
          from_user?: string
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_my_account: { Args: never; Returns: undefined }
      discover_feed: {
        Args: {
          p_budget_max?: number
          p_city?: string
          p_lat?: number
          p_limit?: number
          p_lng?: number
          p_radius_km?: number
        }
        Returns: Json
      }
      map_properties: {
        Args: { p_budget_max?: number; p_city?: string }
        Returns: Json
      }
      mark_messages_read: { Args: { p_match_id: string }; Returns: undefined }
      my_matches: { Args: never; Returns: Json }
      reset_my_swipes: { Args: never; Returns: undefined }
      swipe: {
        Args: {
          p_action: Database["public"]["Enums"]["swipe_action"]
          p_to_user: string
        }
        Returns: Json
      }
      undo_swipe: { Args: { p_to_user: string }; Returns: undefined }
    }
    Enums: {
      swipe_action: "SMASH" | "PASS"
      user_type: "LANDLORD" | "SEEKER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      swipe_action: ["SMASH", "PASS"],
      user_type: ["LANDLORD", "SEEKER"],
    },
  },
} as const
