-- ============================================================
-- WeHome — FSBO (particulier) self-publishing
-- Run this in your Supabase SQL Editor (project: nvzpcyxmuzfycobppnfi)
--
-- After running:
--   - Public visitors can submit a property listing through /publier
--   - Submissions land in `properties` with agent_id=NULL, published=false,
--     portal_statut='en_attente_validation' → invisible until admin approves
--   - A mirror lead row is created in `leads` for the sales pipeline
--   - Photos upload to the existing `agent-photos` bucket under particuliers/
-- ============================================================

-- ── 1. Properties — allow anonymous (anon) FSBO submissions ──────────────────
-- Constraint: only pending, unpublished, agent-less rows. Anonymous users
-- cannot insert as a fake agent or pre-publish.

DROP POLICY IF EXISTS "properties_anon_fsbo_insert" ON public.properties;
CREATE POLICY "properties_anon_fsbo_insert" ON public.properties
  FOR INSERT
  TO anon
  WITH CHECK (
    agent_id IS NULL
    AND published IS FALSE
    AND portal_statut = 'en_attente_validation'
  );

-- ── 2. Leads — allow anonymous lead creation (contact form + FSBO mirror) ────
-- Idempotent: drops the policy if it exists then recreates it cleanly.

DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ── 3. Storage — allow anonymous uploads to agent-photos/particuliers/* ──────
-- Reuses the existing public bucket so photos render with the same CDN.

DROP POLICY IF EXISTS "storage_anon_fsbo_upload" ON storage.objects;
CREATE POLICY "storage_anon_fsbo_upload" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'agent-photos'
    AND (storage.foldername(name))[1] = 'particuliers'
  );

-- (Anonymous SELECT on the bucket is already implicit because the bucket is public.)

-- ── 4. Helpful index for moderation queue ────────────────────────────────────
-- The admin queue will query: portal_statut='en_attente_validation' AND agent_id IS NULL
CREATE INDEX IF NOT EXISTS idx_properties_pending_fsbo
  ON public.properties (created_at DESC)
  WHERE portal_statut = 'en_attente_validation' AND agent_id IS NULL;

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Verify: an anonymous client should now be able to call:
--   supabase.from('properties').insert({ agent_id: null, published: false, portal_statut: 'en_attente_validation', ... })
--   supabase.from('leads').insert({ ... })
--   supabase.storage.from('agent-photos').upload('particuliers/foo.jpg', file)
-- ─────────────────────────────────────────────────────────────────────────────
