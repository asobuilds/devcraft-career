-- Migration 0006: Temporarily disable RLS on public.profiles to debug 500 errors
-- This allows isolating whether complex RLS policies are causing the 500 Internal Server Error.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
