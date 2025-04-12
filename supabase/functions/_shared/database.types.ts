
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
      clients: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          address: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
