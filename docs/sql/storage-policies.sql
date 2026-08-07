-- Wedding Planner — Storage bucket + policies
-- Bucket: wedding-documents (private)
-- Path convention: {workspace_id}/{wedding_id}/{document_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-documents',
  'wedding-documents',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Extract workspace_id from first path segment
CREATE OR REPLACE FUNCTION private.storage_workspace_id(object_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 1), '')::uuid;
$$;

CREATE POLICY storage_select_member ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'wedding-documents'
    AND private.is_workspace_member(private.storage_workspace_id(name))
  );

CREATE POLICY storage_insert_member ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-documents'
    AND private.can_write(private.storage_workspace_id(name))
  );

CREATE POLICY storage_update_member ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'wedding-documents'
    AND private.can_write(private.storage_workspace_id(name))
  )
  WITH CHECK (
    bucket_id = 'wedding-documents'
    AND private.can_write(private.storage_workspace_id(name))
  );

CREATE POLICY storage_delete_owner_partner ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'wedding-documents'
    AND private.workspace_role(private.storage_workspace_id(name)) IN ('owner', 'partner')
  );
