import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We'll use Clerk user ID directly, no Supabase auth needed
  },
});

// Database Types for Comments (existing)
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

// Database Types for MCP Server Registry
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name_zh_cn: string;
          name_en: string;
          name_zh_tw: string | null;
          name_fr: string | null;
          name_ja: string | null;
          name_ko: string | null;
          name_ru: string | null;
          description_zh_cn: string;
          description_en: string;
          description_zh_tw: string | null;
          description_fr: string | null;
          description_ja: string | null;
          description_ko: string | null;
          description_ru: string | null;
          icon: string | null;
          color: string | null;
          server_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name_zh_cn: string;
          name_en: string;
          name_zh_tw: string | null;
          name_fr: string | null;
          name_ja: string | null;
          name_ko: string | null;
          name_ru: string | null;
          description_zh_cn: string;
          description_en: string;
          description_zh_tw: string | null;
          description_fr: string | null;
          description_ja: string | null;
          description_ko: string | null;
          description_ru: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subcategories']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>;
      };
      mcp_servers: {
        Row: {
          id: string;
          name: string;
          owner: string;
          slug: string;
          description_zh_cn: string | null;
          description_en: string | null;
          description_zh_tw: string | null;
          description_fr: string | null;
          description_ja: string | null;
          description_ko: string | null;
          description_ru: string | null;
          full_description: string | null;
          icon: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          featured: boolean;
          verified: boolean;
          github_url: string | null;
          demo_url: string | null;
          docs_url: string | null;
          repository_owner: string | null;
          repository_name: string | null;
          stars: number;
          forks: number;
          watchers: number;
          open_issues: number;
          last_updated: string | null;
          repo_created_at: string | null;
          quality_score: number;
          quality_documentation: number;
          quality_maintenance: number;
          quality_community: number;
          quality_performance: number;
          complexity: string;
          maturity: string;
          downloads: number;
          dependents: number;
          weekly_downloads: number;
          platforms: string[] | null;
          node_version: string | null;
          python_version: string | null;
          requirements: string[] | null;
          readme_content: string | null;
          api_reference: string | null;
          categorization_confidence: number | null;
          categorization_reason: string | null;
          categorization_keywords: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mcp_servers']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['mcp_servers']['Insert']>;
      };
      tags: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      server_tags: {
        Row: {
          server_id: string;
          tag_id: number;
        };
        Insert: Database['public']['Tables']['server_tags']['Row'];
        Update: Partial<Database['public']['Tables']['server_tags']['Insert']>;
      };
      server_badges: {
        Row: {
          id: number;
          server_id: string;
          type: string | null;
          label: string | null;
          color: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_badges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['server_badges']['Insert']>;
      };
      server_tech_stack: {
        Row: {
          id: number;
          server_id: string;
          technology: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_tech_stack']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['server_tech_stack']['Insert']>;
      };
      server_service_types: {
        Row: {
          id: number;
          server_id: string;
          type: string | null;
          label: string | null;
          icon: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_service_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['server_service_types']['Insert']>;
      };
      server_installation: {
        Row: {
          id: number;
          server_id: string;
          method: string | null;
          command: string | null;
          instructions: Record<string, unknown> | null; // JSONB type
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_installation']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['server_installation']['Insert']>;
      };
      server_deployment: {
        Row: {
          id: number;
          server_id: string;
          deployment_type: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_deployment']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['server_deployment']['Insert']>;
      };
      server_readmes: {
        Row: {
          id: number;
          server_id: string;
          filename: string;
          project_name: string;
          raw_content: string;
          content_hash: string | null;
          file_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['server_readmes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['server_readmes']['Insert']>;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          server_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          server_id: string;
        };
        Update: {
          updated_at?: string;
        };
      };
    };
    Views: {
      servers_with_details: {
        Row: Database['public']['Tables']['mcp_servers']['Row'] & {
          category_name: string | null;
          category_name_zh: string | null;
          subcategory_name: string | null;
          subcategory_name_zh: string | null;
          tags: string[] | null;
          tech_stack: string[] | null;
        };
      };
      featured_servers: {
        Row: Database['public']['Views']['servers_with_details']['Row'];
      };
      popular_servers: {
        Row: Database['public']['Views']['servers_with_details']['Row'];
      };
      recent_servers: {
        Row: Database['public']['Views']['servers_with_details']['Row'];
      };
      user_favorite_servers: {
        Row: {
          favorite_id: string;
          user_id: string;
          server_id: string;
          favorited_at: string;
          favorite_updated_at: string;
        } & Database['public']['Views']['servers_with_details']['Row'];
      };
    };
  };
}

// Type the supabase client
export type SupabaseClient = typeof supabase;