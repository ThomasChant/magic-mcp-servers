import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Comment {
  id: string;
  server_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  content: string;
  parent_id?: string | null;
  level?: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  reply_count?: number;
}

export interface CommentInsert {
  server_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  content: string;
  parent_id?: string | null;
}

export interface CommentUpdate {
  content: string;
  updated_at?: string;
}