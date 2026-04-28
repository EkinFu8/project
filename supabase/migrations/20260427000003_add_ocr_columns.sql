-- Add OCR status enum
CREATE TYPE public.ocr_status AS ENUM ('pending', 'processing', 'done', 'failed', 'skipped');

-- Add OCR columns to content_management
ALTER TABLE public.content_management
  ADD COLUMN extracted_text  TEXT         NULL,
  ADD COLUMN ocr_status      public.ocr_status NOT NULL DEFAULT 'pending',
  ADD COLUMN ocr_error       TEXT         NULL,
  ADD COLUMN ocr_updated_at  TIMESTAMPTZ  NULL;

-- Generated tsvector column (filename weighted A, extracted_text weighted B)
ALTER TABLE public.content_management
  ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(filename, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(extracted_text, '')), 'B')
    ) STORED;

-- GIN index for fast full-text search
CREATE INDEX content_search_vector_idx
  ON public.content_management
  USING GIN (search_vector);
