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
      babies: {
        Row: {
          birth_weight: number | null
          birthdate: string
          created_at: string
          due_date: string | null
          gender: string | null
          id: string
          is_pregnancy: boolean | null
          name: string
          notes: string | null
          pregnancy_week: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_weight?: number | null
          birthdate: string
          created_at?: string
          due_date?: string | null
          gender?: string | null
          id?: string
          is_pregnancy?: boolean | null
          name: string
          notes?: string | null
          pregnancy_week?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_weight?: number | null
          birthdate?: string
          created_at?: string
          due_date?: string | null
          gender?: string | null
          id?: string
          is_pregnancy?: boolean | null
          name?: string
          notes?: string | null
          pregnancy_week?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "babies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      baby_milestones: {
        Row: {
          achieved_at: string | null
          baby_id: string
          created_at: string
          id: string
          milestone_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          baby_id: string
          created_at?: string
          id?: string
          milestone_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          baby_id?: string
          created_at?: string
          id?: string
          milestone_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_milestones_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baby_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          listing_id: string
          order_index: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          listing_id: string
          order_index?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          listing_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          age_range: string | null
          brand: string | null
          category: string
          click_count: number | null
          condition: string
          created_at: string
          description: string
          favorited_count: number | null
          featured: boolean | null
          id: string
          impression_count: number | null
          local_pickup: boolean | null
          location_city: string | null
          location_state: string | null
          original_price: number | null
          price: number
          seller_id: string
          shipping_available: boolean | null
          size: string | null
          sold_at: string | null
          status: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          age_range?: string | null
          brand?: string | null
          category: string
          click_count?: number | null
          condition: string
          created_at?: string
          description: string
          favorited_count?: number | null
          featured?: boolean | null
          id?: string
          impression_count?: number | null
          local_pickup?: boolean | null
          location_city?: string | null
          location_state?: string | null
          original_price?: number | null
          price: number
          seller_id: string
          shipping_available?: boolean | null
          size?: string | null
          sold_at?: string | null
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          age_range?: string | null
          brand?: string | null
          category?: string
          click_count?: number | null
          condition?: string
          created_at?: string
          description?: string
          favorited_count?: number | null
          featured?: boolean | null
          id?: string
          impression_count?: number | null
          local_pickup?: boolean | null
          location_city?: string | null
          location_state?: string | null
          original_price?: number | null
          price?: number
          seller_id?: string
          shipping_available?: boolean | null
          size?: string | null
          sold_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_messages: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          amount_seller: number
          amount_total: number
          buyer_confirmed_at: string | null
          buyer_id: string
          created_at: string
          delivered_at: string | null
          id: string
          listing_id: string
          platform_commission: number
          seller_id: string
          shipping_method: string | null
          status: string
          stripe_fee: number | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount_seller: number
          amount_total: number
          buyer_confirmed_at?: string | null
          buyer_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id: string
          platform_commission: number
          seller_id: string
          shipping_method?: string | null
          status?: string
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount_seller?: number
          amount_total?: number
          buyer_confirmed_at?: string | null
          buyer_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id?: string
          platform_commission?: number
          seller_id?: string
          shipping_method?: string | null
          status?: string
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          age_range_weeks: string | null
          category: string
          created_at: string
          description: string
          id: string
          order_index: number
          tips: string | null
          title: string
          typical_age_weeks: number
        }
        Insert: {
          age_range_weeks?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          order_index: number
          tips?: string | null
          title: string
          typical_age_weeks: number
        }
        Update: {
          age_range_weeks?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          tips?: string | null
          title?: string
          typical_age_weeks?: number
        }
        Relationships: []
      }
      product_recommendations: {
        Row: {
          clicked: boolean | null
          created_at: string
          id: string
          listing_id: string
          purchased: boolean | null
          reason: string
          recommended_at: string
          relevance_score: number
          user_id: string
        }
        Insert: {
          clicked?: boolean | null
          created_at?: string
          id?: string
          listing_id: string
          purchased?: boolean | null
          reason: string
          recommended_at?: string
          relevance_score: number
          user_id: string
        }
        Update: {
          clicked?: boolean | null
          created_at?: string
          id?: string
          listing_id?: string
          purchased?: boolean | null
          reason?: string
          recommended_at?: string
          relevance_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_accounts: {
        Row: {
          created_at: string
          id: string
          onboarding_completed: boolean | null
          payouts_enabled: boolean | null
          rating_average: number | null
          rating_count: number | null
          stripe_account_id: string | null
          total_revenue: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          rating_average?: number | null
          rating_count?: number | null
          stripe_account_id?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          rating_average?: number | null
          rating_count?: number | null
          stripe_account_id?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          baby_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baby_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          baby_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
