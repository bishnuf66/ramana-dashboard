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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          content_md: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          published: boolean
          read_min: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_md: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean
          read_min?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_md?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean
          read_min?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          picture: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          picture?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          picture?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_products: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_products_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          customer_email: string
          discount_amount: number
          id: string
          order_id: string | null
          used_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          customer_email: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          customer_email?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          first_time_only: boolean | null
          id: string
          is_active: boolean | null
          is_product_specific: boolean | null
          minimum_order_amount: number | null
          product_inclusion_type: string | null
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          first_time_only?: boolean | null
          id?: string
          is_active?: boolean | null
          is_product_specific?: boolean | null
          minimum_order_amount?: number | null
          product_inclusion_type?: string | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          first_time_only?: boolean | null
          id?: string
          is_active?: boolean | null
          is_product_specific?: boolean | null
          minimum_order_amount?: number | null
          product_inclusion_type?: string | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      customer_discounts: {
        Row: {
          created_at: string | null
          customer_email: string
          first_purchase_completed: boolean | null
          first_purchase_discount_applied: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          first_purchase_completed?: boolean | null
          first_purchase_discount_applied?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          first_purchase_completed?: boolean | null
          first_purchase_discount_applied?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          shipping_address: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items: Json
          notes?: string | null
          shipping_address: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          shipping_address?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          dislike_count: number | null
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          like_count: number | null
          product_id: string
          rating: number
          review_images: string[] | null
          updated_at: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          dislike_count?: number | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          like_count?: number | null
          product_id: string
          rating: number
          review_images?: string[] | null
          updated_at?: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          dislike_count?: number | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          like_count?: number | null
          product_id?: string
          rating?: number
          review_images?: string[] | null
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          discount_price: number | null
          gallery_images: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          price: number
          rating: number | null
          slug: string | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          price: number
          rating?: number | null
          slug?: string | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          price?: number
          rating?: number | null
          slug?: string | null
          stock?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cart: {
        Row: {
          items: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          items?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          items?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          items: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          items?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          items?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_coupon_usage: {
        Args: {
          coupon_id: string
          customer_email: string
          discount_amount: number
          order_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      validate_coupon:
        | {
            Args: {
              coupon_code: string
              customer_email: string
              order_total: number
            }
            Returns: {
              coupon_id: string
              discount_amount: number
              message: string
              valid: boolean
            }[]
          }
        | {
            Args: {
              coupon_code: string
              customer_email: string
              order_total: number
              product_ids?: string[]
            }
            Returns: {
              applicable_products: string[]
              coupon_id: string
              discount_amount: number
              message: string
              valid: boolean
            }[]
          }
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
