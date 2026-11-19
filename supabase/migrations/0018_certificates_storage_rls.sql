-- Migration 0018: RLS policies for certificates storage bucket
-- Allows authenticated users to insert, select, and delete their own files in the certificates bucket.

BEGIN;

-- Ensure RLS is enabled on storage.objects (just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own certificates" ON storage.objects;

-- 1. INSERT policy for certificates bucket
CREATE POLICY "Allow authenticated users to upload certificates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'certificates' AND
    auth.uid() = owner
);

-- 2. SELECT policy for certificates bucket
CREATE POLICY "Allow users to view their own certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'certificates' AND
    auth.uid() = owner
);

-- 3. DELETE policy for certificates bucket
CREATE POLICY "Allow users to delete their own certificates"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'certificates' AND
    auth.uid() = owner
);

COMMIT;
