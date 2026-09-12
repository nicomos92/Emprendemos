// Hand-written types matching supabase/migrations/0001_init.sql exactly, in
// the standard `supabase gen types typescript` shape. Regenerate with the
// CLI once a live project is linked; keep this file in sync until then.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "owner" | "admin";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "cash" | "transfer" | "mercadopago" | "other";
export type CashMovementType = "income" | "expense";

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          business_id: string | null;
          role: ProfileRole;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id?: string | null;
          role?: ProfileRole;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string | null;
          role?: ProfileRole;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          material_cost: number;
          labor_cost: number;
          other_cost: number;
          total_cost: number;
          desired_margin: number;
          suggested_price: number;
          sale_price: number;
          stock: number;
          minimum_stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          image_url?: string | null;
          material_cost?: number;
          labor_cost?: number;
          other_cost?: number;
          total_cost?: number;
          desired_margin?: number;
          suggested_price?: number;
          sale_price?: number;
          stock?: number;
          minimum_stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          material_cost?: number;
          labor_cost?: number;
          other_cost?: number;
          total_cost?: number;
          desired_margin?: number;
          suggested_price?: number;
          sale_price?: number;
          stock?: number;
          minimum_stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_business_id_fkey";
            columns: ["category_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          number: number | null;
          status: QuoteStatus;
          valid_until: string | null;
          subtotal: number;
          discount: number;
          total: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          number?: number | null;
          status?: QuoteStatus;
          valid_until?: string | null;
          subtotal?: number;
          discount?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          number?: number | null;
          status?: QuoteStatus;
          valid_until?: string | null;
          subtotal?: number;
          discount?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_customer_id_business_id_fkey";
            columns: ["customer_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          business_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          quote_id: string;
          business_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          quote_id?: string;
          business_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_business_id_fkey";
            columns: ["quote_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "quote_items_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          quote_id: string | null;
          status: OrderStatus;
          subtotal: number;
          discount: number;
          total: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          quote_id?: string | null;
          status?: OrderStatus;
          subtotal?: number;
          discount?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          quote_id?: string | null;
          status?: OrderStatus;
          subtotal?: number;
          discount?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_business_id_fkey";
            columns: ["customer_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "orders_quote_id_business_id_fkey";
            columns: ["quote_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          business_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          business_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          business_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_business_id_fkey";
            columns: ["order_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "order_items_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          order_id: string;
          amount: number;
          payment_method: PaymentMethod;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          order_id: string;
          amount: number;
          payment_method: PaymentMethod;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          order_id?: string;
          amount?: number;
          payment_method?: PaymentMethod;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_business_id_fkey";
            columns: ["order_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      cash_movements: {
        Row: {
          id: string;
          business_id: string;
          type: CashMovementType;
          amount: number;
          description: string | null;
          reference_type: string | null;
          reference_id: string | null;
          movement_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: CashMovementType;
          amount: number;
          description?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          movement_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: CashMovementType;
          amount?: number;
          description?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          movement_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cash_movements_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_business_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience aliases
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessInsert =
  Database["public"]["Tables"]["businesses"]["Insert"];
export type BusinessUpdate =
  Database["public"]["Tables"]["businesses"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert =
  Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert =
  Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate =
  Database["public"]["Tables"]["products"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert =
  Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate =
  Database["public"]["Tables"]["customers"]["Update"];

export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
export type QuoteUpdate = Database["public"]["Tables"]["quotes"]["Update"];

export type QuoteItem = Database["public"]["Tables"]["quote_items"]["Row"];
export type QuoteItemInsert =
  Database["public"]["Tables"]["quote_items"]["Insert"];
export type QuoteItemUpdate =
  Database["public"]["Tables"]["quote_items"]["Update"];

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert =
  Database["public"]["Tables"]["order_items"]["Insert"];
export type OrderItemUpdate =
  Database["public"]["Tables"]["order_items"]["Update"];

export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert =
  Database["public"]["Tables"]["payments"]["Insert"];
export type PaymentUpdate =
  Database["public"]["Tables"]["payments"]["Update"];

export type CashMovement =
  Database["public"]["Tables"]["cash_movements"]["Row"];
export type CashMovementInsert =
  Database["public"]["Tables"]["cash_movements"]["Insert"];
export type CashMovementUpdate =
  Database["public"]["Tables"]["cash_movements"]["Update"];
