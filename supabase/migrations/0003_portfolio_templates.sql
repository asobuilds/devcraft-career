-- Migration 0003: Portfolio template selection
-- Stores which public portfolio theme the user has selected.

ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS selected_template TEXT NOT NULL DEFAULT 'minimal';

ALTER TABLE portfolios
DROP CONSTRAINT IF EXISTS portfolios_selected_template_check;

ALTER TABLE portfolios
ADD CONSTRAINT portfolios_selected_template_check
CHECK (selected_template IN ('minimal', 'developer', 'creative'));
