-- Migration 0009: Bypass stuck 0007 migration
-- Creates a dummy table to bypass local migration CLI issues and allow progressing migrations.

CREATE TABLE IF NOT EXISTS _migration_bypass_0007 (id int);
