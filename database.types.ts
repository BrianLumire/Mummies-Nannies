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
      _nanniesToServices: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_nanniesToServices_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_nanniesToServices_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "nanny_services"
            referencedColumns: ["id"]
          },
        ]
      }
      _nanniesToSpecialNeeds: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_nanniesToSpecialNeeds_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_nanniesToSpecialNeeds_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "special_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_ranges: {
        Row: {
          id: string
          label: string
          range: unknown | null
        }
        Insert: {
          id?: string
          label: string
          range?: unknown | null
        }
        Update: {
          id?: string
          label?: string
          range?: unknown | null
        }
        Relationships: []
      }
      contact_persons: {
        Row: {
          id: string
          name: string
          nanny_id: string | null
          phone: string
          relationship: Database["public"]["Enums"]["contact_person_relationships"]
        }
        Insert: {
          id?: string
          name: string
          nanny_id?: string | null
          phone: string
          relationship: Database["public"]["Enums"]["contact_person_relationships"]
        }
        Update: {
          id?: string
          name?: string
          nanny_id?: string | null
          phone?: string
          relationship?: Database["public"]["Enums"]["contact_person_relationships"]
        }
        Relationships: [
          {
            foreignKeyName: "contact_persons_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
        ]
      }
      counter_offer: {
        Row: {
          amount: number
          created_at: string
          id: string
          offer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          offer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          offer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counter_offer_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offer"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          mammy_id: string | null
          nanny_id: string | null
        }
        Insert: {
          id?: string
          mammy_id?: string | null
          nanny_id?: string | null
        }
        Update: {
          id?: string
          mammy_id?: string | null
          nanny_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_mammy_id_fkey"
            columns: ["mammy_id"]
            isOneToOne: false
            referencedRelation: "mammies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
        ]
      }
      mammies: {
        Row: {
          budget_range_id: string | null
          id: string
          location: string | null
          user_id: string | null
        }
        Insert: {
          budget_range_id?: string | null
          id?: string
          location?: string | null
          user_id?: string | null
        }
        Update: {
          budget_range_id?: string | null
          id?: string
          location?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mammies_budget_range_id_fkey"
            columns: ["budget_range_id"]
            isOneToOne: false
            referencedRelation: "budget_ranges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mammies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      nannies: {
        Row: {
          education_level: Database["public"]["Enums"]["education_level"] | null
          id: string
          is_available: boolean
          location: string | null
          nationality: string | null
          rating: number | null
          rejected_offer_count: number | null
          religion: Database["public"]["Enums"]["religions"] | null
          salary_range_id: string | null
          tribe: string | null
          user_id: string | null
          work_type: Database["public"]["Enums"]["work_terms"] | null
          years_of_experience: number | null
        }
        Insert: {
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          id?: string
          is_available?: boolean
          location?: string | null
          nationality?: string | null
          rating?: number | null
          rejected_offer_count?: number | null
          religion?: Database["public"]["Enums"]["religions"] | null
          salary_range_id?: string | null
          tribe?: string | null
          user_id?: string | null
          work_type?: Database["public"]["Enums"]["work_terms"] | null
          years_of_experience?: number | null
        }
        Update: {
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          id?: string
          is_available?: boolean
          location?: string | null
          nationality?: string | null
          rating?: number | null
          rejected_offer_count?: number | null
          religion?: Database["public"]["Enums"]["religions"] | null
          salary_range_id?: string | null
          tribe?: string | null
          user_id?: string | null
          work_type?: Database["public"]["Enums"]["work_terms"] | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nannies_salary_range_id_fkey"
            columns: ["salary_range_id"]
            isOneToOne: false
            referencedRelation: "salary_ranges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nannies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_services: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      number_of_kids_preferred: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      offer: {
        Row: {
          amount: number
          created_at: string
          id: string
          mammy_id: string | null
          nanny_id: string | null
          offer_status: Database["public"]["Enums"]["offer_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          mammy_id?: string | null
          nanny_id?: string | null
          offer_status?: Database["public"]["Enums"]["offer_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mammy_id?: string | null
          nanny_id?: string | null
          offer_status?: Database["public"]["Enums"]["offer_status"]
        }
        Relationships: [
          {
            foreignKeyName: "offer_mammy_id_fkey"
            columns: ["mammy_id"]
            isOneToOne: false
            referencedRelation: "mammies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: string
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
        }
        Insert: {
          amount: number
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Update: {
          amount?: number
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Relationships: []
      }
      preferred_age_group: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
        }
        Insert: {
          id?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          mammies_id: string | null
          nannies_id: string | null
        }
        Insert: {
          id?: string
          mammies_id?: string | null
          nannies_id?: string | null
        }
        Update: {
          id?: string
          mammies_id?: string | null
          nannies_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_mammies_id_fkey"
            columns: ["mammies_id"]
            isOneToOne: false
            referencedRelation: "mammies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_nannies_id_fkey"
            columns: ["nannies_id"]
            isOneToOne: false
            referencedRelation: "nannies"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_ranges: {
        Row: {
          id: string
          label: string
          range: unknown | null
        }
        Insert: {
          id?: string
          label: string
          range?: unknown | null
        }
        Update: {
          id?: string
          label?: string
          range?: unknown | null
        }
        Relationships: []
      }
      special_needs: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_person_relationships:
        | "spouse"
        | "parent"
        | "sibling"
        | "child"
        | "friend"
        | "cousin"
        | "other"
      education_level:
        | "high_school"
        | "associate"
        | "bachelor"
        | "master"
        | "doctorate"
      offer_status: "pending" | "accepted" | "rejected"
      religions: "christian" | "islam" | "hindu" | "pagan" | "non_religious"
      role: "nanny" | "mammy" | "admin"
      transaction_status: "pending" | "failed" | "success"
      work_terms: "full_time" | "dayburg"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
