export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          socials: Json;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          socials?: Json;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          socials?: Json;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          type: string;
          tags: string[];
          minecraft_version: string | null;
          license: string;
          visibility: string;
          status: string;
          storage_bucket: string;
          storage_path: string | null;
          mime_type: string | null;
          file_size: number | null;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          type: string;
          tags?: string[];
          minecraft_version?: string | null;
          license: string;
          visibility?: string;
          status?: string;
          storage_bucket?: string;
          storage_path?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          tags?: string[];
          minecraft_version?: string | null;
          license?: string;
          visibility?: string;
          status?: string;
          storage_bucket?: string;
          storage_path?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      asset_downloads: {
        Row: {
          id: number;
          asset_id: string;
          downloader_id: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          asset_id: string;
          downloader_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          asset_id?: string;
          downloader_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      asset_reports: {
        Row: {
          id: number;
          asset_id: string;
          reporter_id: string | null;
          reason: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          asset_id: string;
          reporter_id?: string | null;
          reason: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          asset_id?: string;
          reporter_id?: string | null;
          reason?: string;
          details?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
