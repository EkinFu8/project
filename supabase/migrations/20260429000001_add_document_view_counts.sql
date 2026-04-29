ALTER TABLE public.content_management
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_content_management_view_count
  ON public.content_management (view_count DESC);

CREATE INDEX IF NOT EXISTS idx_content_management_last_viewed_at
  ON public.content_management (last_viewed_at DESC);
