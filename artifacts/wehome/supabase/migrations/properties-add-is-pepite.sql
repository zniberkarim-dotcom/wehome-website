-- ─────────────────────────────────────────────────────────────────────────────
-- Add `is_pepite` flag on properties.
--
-- Purpose: gives the WeHome team editorial control over which property
-- surfaces as the "Pépite du Mois" on wehome.ma. Set exactly ONE property to
-- TRUE per month (the site sorts featured by is_pepite DESC, so the flagged
-- row is always picked first).
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS is_pepite BOOLEAN DEFAULT FALSE;

-- Index for the public `fetchFeaturedProperties` ordering.
CREATE INDEX IF NOT EXISTS idx_properties_is_pepite
  ON properties (is_pepite DESC, created_at DESC)
  WHERE published = TRUE;

-- Optional: enforce at most one Pépite at a time.
-- Comment this out if you ever want to feature multiple "pépites".
CREATE UNIQUE INDEX IF NOT EXISTS uniq_one_pepite_at_a_time
  ON properties ((is_pepite))
  WHERE is_pepite = TRUE;

-- Sanity check
COMMENT ON COLUMN properties.is_pepite IS
  'Editorial flag — when TRUE, this property is featured as the Pépite du Mois on wehome.ma. Only ONE row should be TRUE at a time.';
