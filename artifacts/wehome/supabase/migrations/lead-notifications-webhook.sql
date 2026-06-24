-- ─────────────────────────────────────────────────────────────────────────────
-- Lead notifications via Supabase Database Webhook
--
-- Goal: every new row in `leads` triggers an instant notification to the team
-- (WhatsApp, Slack, or email). The webhook posts to a Supabase Edge Function
-- which forwards to whichever channel(s) the team uses.
--
-- This file contains:
--   (1) The trigger that fires the webhook (Database Webhooks need to also
--       be enabled in the Supabase dashboard — see SETUP NOTES below).
--   (2) A `lead_notifications_log` table to track delivery + retry on failure.
--
-- SETUP NOTES (one-time, in the Supabase dashboard):
--   1. Database → Webhooks → Create a new webhook:
--        - Name: lead_created_notify
--        - Table: leads
--        - Events: INSERT
--        - Type: HTTP Request
--        - HTTP URL: https://<your-project>.supabase.co/functions/v1/notify-lead
--        - HTTP Method: POST
--        - Headers: Authorization = Bearer <SERVICE_ROLE_KEY>
--   2. Deploy the Edge Function `notify-lead` (see template below).
--   3. Set Edge Function env vars in the dashboard:
--        - WHATSAPP_API_TOKEN (Whapi/Twilio/360dialog — your choice)
--        - WHATSAPP_AGENT_NUMBERS (comma-separated: +212611111111,+212622222222)
--        - SLACK_WEBHOOK_URL (optional)
--        - RESEND_API_KEY (optional, for email)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_notifications_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id       UUID NOT NULL,
  channel       VARCHAR(20) NOT NULL,  -- 'whatsapp' | 'slack' | 'email'
  status        VARCHAR(20) NOT NULL,  -- 'sent' | 'failed' | 'retry'
  recipient     TEXT,
  error_message TEXT,
  sent_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_notifications_lead
  ON lead_notifications_log (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notifications_failed
  ON lead_notifications_log (sent_at DESC)
  WHERE status = 'failed';

COMMENT ON TABLE lead_notifications_log IS
  'Tracks every notification attempt (WhatsApp / Slack / email) for new leads. Use it to spot failures and retry.';

-- Optional: route distinct sources to specific agents.
-- Edit the mapping below and uncomment to enable per-source routing.
-- The Edge Function reads this to know who to notify.

CREATE TABLE IF NOT EXISTS lead_source_routing (
  source      TEXT PRIMARY KEY,
  agent_name  TEXT NOT NULL,
  whatsapp    TEXT,
  email       TEXT,
  notes       TEXT
);

-- Default routing seed — adjust to your team.
INSERT INTO lead_source_routing (source, agent_name, whatsapp, email) VALUES
  ('Website WeHome',                  'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('Service Pro — Pack Essentiel',    'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('Service Pro — Pack Signature',    'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('Service Pro — Pack Conciergerie', 'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('WeOffice — Louer un bureau',      'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('WeOffice — Acheter / Investir',   'Karim',   '+212653535156', 'karim@wehome.ma'),
  ('WeOffice — Mettre en location / vente', 'Karim', '+212653535156', 'karim@wehome.ma'),
  ('Financement — Capacité d''emprunt',  'Basma', NULL, NULL),
  ('Financement — Simulation mensualité', 'Basma', NULL, NULL)
ON CONFLICT (source) DO NOTHING;

COMMENT ON TABLE lead_source_routing IS
  'Maps a lead source string (e.g. "WeOffice — Louer un bureau") to the agent who should receive the instant notification. Edit rows to reassign.';
