export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          category_id: number | null
          created_at: string
          created_by: string | null
          description: string
          end_date: string
          hours_required: number | null
          id: number
          image_url: string | null
          location: string
          slots_available: number | null
          slots_filled: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          end_date: string
          hours_required?: number | null
          id?: number
          image_url?: string | null
          location: string
          slots_available?: number | null
          slots_filled?: number | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string
          hours_required?: number | null
          id?: number
          image_url?: string | null
          location?: string
          slots_available?: number | null
          slots_filled?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          id: number
          opportunity_id: number
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          opportunity_id: number
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          opportunity_id?: number
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_logs: {
        Row: {
          approved_by: string | null
          created_at: string
          date_volunteered: string
          description: string | null
          hours_logged: number
          id: number
          opportunity_id: number
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          date_volunteered: string
          description?: string | null
          hours_logged: number
          id?: number
          opportunity_id: number
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          date_volunteered?: string
          description?: string | null
          hours_logged?: number
          id?: number
          opportunity_id?: number
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_logs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_logs_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_logs_profile_id_fkey"
            columns: ["profile_id"]
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
