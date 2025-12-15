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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_permission: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          call_to_action: Json | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string | null
          demands: Json | null
          end_date: string | null
          featured_image_url: string | null
          how_to_participate: Json | null
          icon_name: string | null
          id: string
          is_featured: boolean
          resources: Json | null
          slug: string
          start_date: string | null
          stats: Json | null
          status: Database["public"]["Enums"]["campaign_status"]
          sub_campaign_id: string | null
          success_stories: Json | null
          targets: Json | null
          updated_at: string | null
        }
        Insert: {
          call_to_action?: Json | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          demands?: Json | null
          end_date?: string | null
          featured_image_url?: string | null
          how_to_participate?: Json | null
          icon_name?: string | null
          id?: string
          is_featured?: boolean
          resources?: Json | null
          slug: string
          start_date?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"]
          sub_campaign_id?: string | null
          success_stories?: Json | null
          targets?: Json | null
          updated_at?: string | null
        }
        Update: {
          call_to_action?: Json | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          demands?: Json | null
          end_date?: string | null
          featured_image_url?: string | null
          how_to_participate?: Json | null
          icon_name?: string | null
          id?: string
          is_featured?: boolean
          resources?: Json | null
          slug?: string
          start_date?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"]
          sub_campaign_id?: string | null
          success_stories?: Json | null
          targets?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_sub_campaign_id_fkey"
            columns: ["sub_campaign_id"]
            isOneToOne: false
            referencedRelation: "sub_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns_translations: {
        Row: {
          campaign_id: string
          created_at: string | null
          description: string
          id: string
          language: string
          short_description: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          description: string
          id?: string
          language: string
          short_description?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          description?: string
          id?: string
          language?: string
          short_description?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_translations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          alt_texts: string | null
          author_name: string | null
          categories: string | null
          content: string | null
          featured_image: string | null
          id: string
          language: string | null
          locations: string | null
          organizers: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          alt_texts?: string | null
          author_name?: string | null
          categories?: string | null
          content?: string | null
          featured_image?: string | null
          id: string
          language?: string | null
          locations?: string | null
          organizers?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_texts?: string | null
          author_name?: string | null
          categories?: string | null
          content?: string | null
          featured_image?: string | null
          id?: string
          language?: string | null
          locations?: string | null
          organizers?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          alt_texts: string | null
          author_name: string | null
          categories: string[] | null
          content: string | null
          excerpt: string | null
          featured_image: string | null
          id: number
          language: string | null
          locations: string | null
          organizers: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          alt_texts?: string | null
          author_name?: string | null
          categories?: string[] | null
          content?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id: number
          language?: string | null
          locations?: string | null
          organizers?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_texts?: string | null
          author_name?: string | null
          categories?: string[] | null
          content?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: number
          language?: string | null
          locations?: string | null
          organizers?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_type: string | null
          created_at: string
          id: string
          key: string | null
          locale: string | null
          namespace: string | null
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          id?: string
          key?: string | null
          locale?: string | null
          namespace?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          id?: string
          key?: string | null
          locale?: string | null
          namespace?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      sub_campaigns: {
        Row: {
          campaign_type: string | null
          created_at: string
          description: string | null
          end_date: string | null
          featured_image_url: string | null
          icon_name: string | null
          id: string
          parent_campaign_id: string | null
          short_description: string | null
          slug: string | null
          start_date: string | null
          stats: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          icon_name?: string | null
          id?: string
          parent_campaign_id?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          stats?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          icon_name?: string | null
          id?: string
          parent_campaign_id?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          stats?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_campaigns_parent_campaign_id_fkey"
            columns: ["parent_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_campaigns_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string
          short_description: string | null
          sub_campaign_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          short_description?: string | null
          sub_campaign_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          short_description?: string | null
          sub_campaign_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_campaigns_translations_sub_campaign_id_fkey"
            columns: ["sub_campaign_id"]
            isOneToOne: false
            referencedRelation: "sub_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role: {
        Row: {
          created_at: string
          id: number
          name: string | null
          permissions_id: number[] | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          permissions_id?: number[] | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          permissions_id?: number[] | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string | null
          role_id: number | null
          supabase_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          name?: string | null
          role_id?: number | null
          supabase_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          name?: string | null
          role_id?: number | null
          supabase_id?: string | null
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
      campaign_status:
        | "active"
        | "completed"
        | "draft"
        | "paused"
        | "cancelled"
        | "archived"
      campaign_type:
        | "awareness"
        | "advocacy"
        | "fundraising"
        | "community_building"
        | "education"
        | "solidarity"
        | "humanitarian"
        | "political"
        | "cultural"
        | "environmental"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      campaign_status: [
        "active",
        "completed",
        "draft",
        "paused",
        "cancelled",
        "archived",
      ],
      campaign_type: [
        "awareness",
        "advocacy",
        "fundraising",
        "community_building",
        "education",
        "solidarity",
        "humanitarian",
        "political",
        "cultural",
        "environmental",
      ],
    },
  },
} as const
