ALTER TABLE public.content_management
    ADD COLUMN IF NOT EXISTS next_review_date DATE;