-- ============================================================
-- WeHome Agent Portal — Database Migration
-- Run this in your Supabase SQL Editor (project: nvzpcyxmuzfycobppnfi)
-- ============================================================

-- ── 1. Extend the agents table ────────────────────────────────────────────────

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS role            VARCHAR(30)  DEFAULT 'agent_interne',
  ADD COLUMN IF NOT EXISTS nom_agence      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS logo_agence_url TEXT,
  ADD COLUMN IF NOT EXISTS ville           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS statut          VARCHAR(20)  DEFAULT 'actif',
  ADD COLUMN IF NOT EXISTS date_activation DATE,
  ADD COLUMN IF NOT EXISTS abonnement      VARCHAR(30)  DEFAULT 'essai',
  ADD COLUMN IF NOT EXISTS listings_limit  INTEGER      DEFAULT 5;

-- Backfill: existing WeHome team agents stay actif / interne
UPDATE agents
SET statut = 'actif', role = 'agent_interne'
WHERE statut IS NULL;

-- ── 2. Extend properties table ────────────────────────────────────────────────

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS portal_statut    VARCHAR(30) DEFAULT 'actif',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS views_count      INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mandat_signe     BOOLEAN     DEFAULT FALSE;

-- Values for portal_statut:
--   'actif'                  — published and live
--   'en_attente_validation'  — submitted by partner, Kai must approve
--   'rejeté'                 — rejected with reason
--   'archivé'                — archived by agent

-- Backfill existing properties
UPDATE properties SET portal_statut = 'actif' WHERE portal_statut IS NULL;

-- ── 3. Extend leads table ─────────────────────────────────────────────────────

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS property_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_id    TEXT,
  ADD COLUMN IF NOT EXISTS statut_lead VARCHAR(30) DEFAULT 'nouveau';

-- Values for statut_lead: 'nouveau' | 'contacté' | 'visite_planifiée' | 'sans_suite'

-- ── 4. Enable RLS ─────────────────────────────────────────────────────────────

ALTER TABLE agents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads      ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS — agents table ─────────────────────────────────────────────────────

-- Public: read active agents (for /agents directory)
DROP POLICY IF EXISTS "agents_public_read"   ON agents;
CREATE POLICY "agents_public_read" ON agents
  FOR SELECT USING (actif = true);

-- Self: read own row even if inactive
DROP POLICY IF EXISTS "agents_self_read" ON agents;
CREATE POLICY "agents_self_read" ON agents
  FOR SELECT USING (user_id = auth.uid());

-- Self: update own row
DROP POLICY IF EXISTS "agents_self_update" ON agents;
CREATE POLICY "agents_self_update" ON agents
  FOR UPDATE USING (user_id = auth.uid());

-- Admin / internal: full access
DROP POLICY IF EXISTS "agents_admin_all" ON agents;
CREATE POLICY "agents_admin_all" ON agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents a2
      WHERE a2.user_id = auth.uid()
        AND a2.role IN ('admin', 'agent_interne')
    )
  );

-- ── 6. RLS — properties table ─────────────────────────────────────────────────

-- Public: read published + validated properties
DROP POLICY IF EXISTS "properties_public_read" ON properties;
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (published = true AND portal_statut = 'actif');

-- Agent: full access to own properties
DROP POLICY IF EXISTS "properties_agent_own" ON properties;
CREATE POLICY "properties_agent_own" ON properties
  FOR ALL USING (
    agent_id = auth.uid()::text
    OR agent_id IN (
      SELECT id::text FROM agents WHERE user_id = auth.uid()
    )
  );

-- Admin / internal: full access
DROP POLICY IF EXISTS "properties_admin_all" ON properties;
CREATE POLICY "properties_admin_all" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.user_id = auth.uid()
        AND agents.role IN ('admin', 'agent_interne')
    )
  );

-- ── 7. RLS — leads table ──────────────────────────────────────────────────────

-- Agent: see leads for their own properties
DROP POLICY IF EXISTS "leads_agent_own" ON leads;
CREATE POLICY "leads_agent_own" ON leads
  FOR ALL USING (
    agent_id = auth.uid()::text
    OR agent_id IN (
      SELECT id::text FROM agents WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.user_id = auth.uid()
        AND agents.role IN ('admin', 'agent_interne')
    )
  );

-- ── 8. Useful indexes ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agents_user_id   ON agents (user_id);
CREATE INDEX IF NOT EXISTS idx_agents_role       ON agents (role);
CREATE INDEX IF NOT EXISTS idx_agents_statut     ON agents (statut);
CREATE INDEX IF NOT EXISTS idx_properties_agent  ON properties (agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_portal ON properties (portal_statut);
CREATE INDEX IF NOT EXISTS idx_leads_agent       ON leads (agent_id);

-- ── 9. Supabase Storage — ensure buckets exist ────────────────────────────────

-- Run this only if the buckets don't exist yet in your Storage dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agent-photos', 'agent-photos', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agent-logos',  'agent-logos',  true) ON CONFLICT DO NOTHING;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- After running this migration:
-- 1. Go to Authentication → Settings and ensure "Enable email confirmations" is OFF for dev
-- 2. In Supabase Storage, create buckets: agent-photos, agent-logos (public)
-- 3. Deploy the wehome frontend with the new /espace-agent routes
-- ─────────────────────────────────────────────────────────────────────────────
