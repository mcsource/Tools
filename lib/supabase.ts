import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client — uses service role key, bypasses RLS. Server-side API routes only.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
// Public client — uses anon key, subject to RLS. Safe for client-side use.
export const supabase      = createClient(supabaseUrl, supabaseAnonKey);

export interface VideoAnalysis {
  id: string;
  video_id: string;
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  channel_name: string | null;
  duration: string | null;
  transcript_available: boolean;
  summary: SummaryPoint[] | null;
  key_insights: string[] | null;
  categories: string[] | null;
  visual_moments: VisualMoment[] | null;
  raw_transcript: string | null;
  created_at: string;
}

export interface SummaryPoint {
  timestamp: string;
  timestamp_ms: number;
  point: string;
  visual_context?: string;
}

export interface VisualMoment {
  timestamp: string;
  timestamp_ms: number;
  description: string;
}
