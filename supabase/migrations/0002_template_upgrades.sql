-- Migration 0002: Template Upgrades
-- Adds profile_photo_url to profiles and target_job_type to resumes

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS target_job_type TEXT DEFAULT 'tech';
