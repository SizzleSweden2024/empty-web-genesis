export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          created_at: string
          creator_id: string
          question: string
          description: string | null
          type: 'boolean' | 'slider' | 'numeric' | 'choice'
          category: string | null
          min_value: number | null
          max_value: number | null
          upvotes: number
          response_count: number
          is_active: boolean
          demographic_filters: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          creator_id: string
          question: string
          description?: string | null
          type: 'boolean' | 'slider' | 'numeric' | 'choice'
          category?: string | null
          min_value?: number | null
          max_value?: number | null
          upvotes?: number
          response_count?: number
          is_active?: boolean
          demographic_filters?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          creator_id?: string
          question?: string
          description?: string | null
          type?: 'boolean' | 'slider' | 'numeric' | 'choice'
          category?: string | null
          min_value?: number | null
          max_value?: number | null
          upvotes?: number
          response_count?: number
          is_active?: boolean
          demographic_filters?: string[]
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          created_at?: string
        }
      }
      poll_responses: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          value: Json
          created_at: string
          age_range: string | null
          gender: string | null
          region: string | null
          occupation: string | null
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          value: Json
          created_at?: string
          age_range?: string | null
          gender?: string | null
          region?: string | null
          occupation?: string | null
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          value?: Json
          created_at?: string
          age_range?: string | null
          gender?: string | null
          region?: string | null
          occupation?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          age_range: string | null
          gender: string | null
          region: string | null
          occupation: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          age_range?: string | null
          gender?: string | null
          region?: string | null
          occupation?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          age_range?: string | null
          gender?: string | null
          region?: string | null
          occupation?: string | null
        }
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
  }
}