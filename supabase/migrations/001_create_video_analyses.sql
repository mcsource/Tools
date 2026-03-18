-- ============================================================
-- YouTube Video Analyzer — Supabase Migration
-- Project: signalstrike-testing-ryan
-- Table: video_analyses
-- ============================================================

CREATE TABLE IF NOT EXISTS public.video_analyses (
  id                   UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id             TEXT          NOT NULL,
  url                  TEXT          NOT NULL,
  title                TEXT,
  thumbnail_url        TEXT,
  channel_name         TEXT,
  duration             TEXT,
  transcript_available BOOLEAN       DEFAULT false,
  summary              JSONB,        -- SummaryPoint[]
  key_insights         JSONB,        -- string[]
  categories           TEXT[],       -- e.g. ['stock_market', 'trading_signals']
  visual_moments       JSONB,        -- VisualMoment[]
  raw_transcript       TEXT,
  created_at           TIMESTAMPTZ   DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_analyses_video_id
  ON public.video_analyses (video_id);

CREATE INDEX IF NOT EXISTS idx_video_analyses_created_at
  ON public.video_analyses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_analyses_categories
  ON public.video_analyses USING GIN (categories);

CREATE INDEX IF NOT EXISTS idx_video_analyses_title_search
  ON public.video_analyses USING GIN (to_tsvector('english', coalesce(title, '')));

-- RLS: disable for service role access (app uses service role key)
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: allow full access via service role (used by Next.js API routes)
CREATE POLICY "service_role_full_access"
  ON public.video_analyses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
