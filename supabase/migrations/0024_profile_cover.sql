-- Migration 0024: Profile cover image
-- Adds a cover photo URL used by the profile header.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

NOTIFY pgrst, 'reload schema';
