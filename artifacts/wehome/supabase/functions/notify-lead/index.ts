// supabase/functions/notify-lead/index.ts
//
// Edge Function — invoked by the `lead_created_notify` Database Webhook every
// time a new row is inserted into `leads`. Forwards the lead to whichever
// channels you've configured via env vars (WhatsApp, Slack, email).
//
// Deploy:
//   supabase functions deploy notify-lead
//
// Env vars required (set in Supabase dashboard → Edge Functions → Secrets):
//   SUPABASE_URL                — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY   — auto-injected
//   WHATSAPP_API_TOKEN          — your WhatsApp Cloud API / Whapi / Twilio token
//   WHATSAPP_PHONE_NUMBER_ID    — your WhatsApp sender ID (Meta Cloud API)
//   WHATSAPP_FALLBACK_NUMBER    — default agent number if no source routing
//   SLACK_WEBHOOK_URL           — optional, posts a Slack message
//   RESEND_API_KEY              — optional, sends email via Resend
//
// Note: the WhatsApp call below uses the Meta Cloud API shape. If you use
// Whapi or Twilio, swap the `sendWhatsApp` function body — the rest is reusable.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN") ?? "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const WHATSAPP_FALLBACK_NUMBER = Deno.env.get("WHATSAPP_FALLBACK_NUMBER") ?? "+212653535156";
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  notes: string | null;
  property_reference?: string | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: "leads";
  record: LeadRecord;
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    if (payload.type !== "INSERT" || payload.table !== "leads") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const lead = payload.record;

    // Look up routing (which agent should get this lead)
    const { data: routing } = await supabase
      .from("lead_source_routing")
      .select("*")
      .eq("source", lead.source)
      .maybeSingle();

    const whatsappTo = routing?.whatsapp ?? WHATSAPP_FALLBACK_NUMBER;
    const emailTo = routing?.email ?? null;
    const agentName = routing?.agent_name ?? "Équipe WeHome";

    const message = buildMessage(lead, agentName);

    // ── 1. WhatsApp notification ──────────────────────────────────────────
    if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID && whatsappTo) {
      try {
        await sendWhatsApp(whatsappTo, message);
        await logNotification(lead.id, "whatsapp", "sent", whatsappTo);
      } catch (err) {
        await logNotification(lead.id, "whatsapp", "failed", whatsappTo, String(err));
      }
    }

    // ── 2. Slack notification ────────────────────────────────────────────
    if (SLACK_WEBHOOK_URL) {
      try {
        await sendSlack(message, lead);
        await logNotification(lead.id, "slack", "sent", SLACK_WEBHOOK_URL);
      } catch (err) {
        await logNotification(lead.id, "slack", "failed", SLACK_WEBHOOK_URL, String(err));
      }
    }

    // ── 3. Email notification ────────────────────────────────────────────
    if (RESEND_API_KEY && emailTo) {
      try {
        await sendEmail(emailTo, lead, message);
        await logNotification(lead.id, "email", "sent", emailTo);
      } catch (err) {
        await logNotification(lead.id, "email", "failed", emailTo, String(err));
      }
    }

    return new Response(JSON.stringify({ notified: true }), { status: 200 });
  } catch (err) {
    console.error("notify-lead error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

function buildMessage(lead: LeadRecord, agentName: string): string {
  const lines = [
    `🔔 *Nouveau lead — ${lead.source}*`,
    ``,
    `*Pour :* ${agentName}`,
    `*Nom :* ${lead.name}`,
    `*Téléphone :* ${lead.phone}`,
    `*Email :* ${lead.email}`,
  ];
  if (lead.property_reference) lines.push(`*Réf bien :* ${lead.property_reference}`);
  if (lead.notes) lines.push(``, `*Détails :*`, lead.notes);
  lines.push(``, `_CRM : https://wehome-crm.vercel.app/leads/${lead.id}_`);
  return lines.join("\n");
}

async function sendWhatsApp(to: string, message: string) {
  // Meta Cloud API shape. Swap for Whapi/Twilio if you use those instead.
  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/[^\d+]/g, ""),
      type: "text",
      text: { body: message },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${await res.text()}`);
}

async function sendSlack(message: string, lead: LeadRecord) {
  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `Nouveau lead — ${lead.source}`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `🔔 ${lead.source}` } },
        {
          type: "section",
          text: { type: "mrkdwn", text: message },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Slack ${res.status}: ${await res.text()}`);
}

async function sendEmail(to: string, lead: LeadRecord, message: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "WeHome Leads <leads@wehome.ma>",
      to,
      subject: `🔔 Nouveau lead — ${lead.source} — ${lead.name}`,
      text: message,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function logNotification(
  leadId: string,
  channel: "whatsapp" | "slack" | "email",
  status: "sent" | "failed",
  recipient: string,
  error?: string
) {
  await supabase.from("lead_notifications_log").insert({
    lead_id: leadId,
    channel,
    status,
    recipient,
    error_message: error ?? null,
  });
}
