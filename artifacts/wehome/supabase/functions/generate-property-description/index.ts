// supabase/functions/generate-property-description/index.ts
//
// Edge Function — generates a premium property listing (title + description +
// suggested features) from a minimal agent brief. Powers the "✨ Publier avec
// IA" wizard in the espace-agent portal.
//
// Deploy:
//   supabase functions deploy generate-property-description
//
// Env vars required (Supabase dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY   — your Anthropic API key (https://console.anthropic.com)
//
// Why Edge Function (vs calling Anthropic from browser):
//   1. Keeps the API key out of the client bundle (security)
//   2. Allows us to enforce rate limits, log usage, swap models without
//      shipping a new frontend build
//   3. Easy to extend with DeepL translation later (Phase 2)

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-4-5-20251001";

interface Brief {
  type: string;              // "Appartement" | "Villa" | etc.
  transaction: string;       // "Vente" | "Location"
  ville: string;             // "Casablanca"
  quartier: string;          // "Maarif"
  surface?: number;          // m²
  chambres?: number;
  salons?: number;
  sdb?: number;
  prix?: number;             // MAD
  features?: string[];       // ["Parking", "Piscine", ...]
  meuble?: boolean;
}

interface Generated {
  title: string;
  description: string;
  suggested_features: string[];
}

/** CORS — permissive because the wizard is in the same browser context but
 *  Edge Functions are on a different origin (project.supabase.co). */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY not configured on server" }, 500);
  }

  let brief: Brief;
  try {
    brief = (await req.json()) as Brief;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Minimal validation — give the AI enough to work with
  if (!brief.type || !brief.transaction || !brief.ville) {
    return json({ error: "Missing required fields: type, transaction, ville" }, 400);
  }

  const userPrompt = buildPrompt(brief);

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error", anthropicRes.status, errText);
      return json({ error: `Anthropic API ${anthropicRes.status}`, detail: errText }, 502);
    }

    const data = await anthropicRes.json() as { content?: { type: string; text: string }[] };
    const raw = data.content?.[0]?.text ?? "";

    const parsed = extractJson(raw);
    if (!parsed) {
      console.error("Failed to extract JSON from Claude response", raw);
      return json({ error: "AI returned malformed JSON", raw }, 502);
    }

    // Sanity-check shape
    const generated: Generated = {
      title: String(parsed.title ?? "").trim().slice(0, 100),
      description: String(parsed.description ?? "").trim(),
      suggested_features: Array.isArray(parsed.suggested_features)
        ? parsed.suggested_features.filter((s: unknown): s is string => typeof s === "string").slice(0, 8)
        : [],
    };

    return json(generated, 200);
  } catch (err) {
    console.error("generate-property-description error", err);
    return json({ error: String(err) }, 500);
  }
});

const SYSTEM_PROMPT = `Tu es un copywriter immobilier marocain expert. Tu écris des annonces premium en français pour le marché casablancais et marocain en général. Ton style :
- Précis, élégant, descriptif sans être pompeux
- Tu évoques le mode de vie, pas juste les caractéristiques
- Tu utilises un vocabulaire de l'immobilier haut de gamme (lumineux, traversant, prestation, standing, finitions)
- Tu mentionnes naturellement les features fournies, sans les lister sèchement
- Tu n'inventes JAMAIS de caractéristiques non fournies (pas de "piscine" si non mentionné)
- Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule`;

function buildPrompt(b: Brief): string {
  const transactionFr = b.transaction === "Location" ? "à louer" : "à vendre";
  const lines: string[] = [
    `Générer une annonce immobilière premium pour ce bien ${transactionFr} :`,
    `- Type : ${b.type}`,
    `- Ville : ${b.ville}`,
    `- Quartier : ${b.quartier || "non précisé"}`,
  ];
  if (b.surface) lines.push(`- Surface : ${b.surface} m²`);
  if (b.chambres) lines.push(`- Chambres : ${b.chambres}`);
  if (b.salons) lines.push(`- Salons : ${b.salons}`);
  if (b.sdb) lines.push(`- Salles de bain : ${b.sdb}`);
  if (b.prix) {
    const suffix = b.transaction === "Location" ? " MAD/mois" : " MAD";
    lines.push(`- Prix : ${b.prix.toLocaleString("fr-FR")}${suffix}`);
  }
  if (b.meuble) lines.push(`- Meublé : oui`);
  if (b.features && b.features.length) lines.push(`- Caractéristiques : ${b.features.join(", ")}`);

  lines.push(``);
  lines.push(`Génère :`);
  lines.push(`1. Un titre accrocheur (60-80 caractères max, sans point d'exclamation, sans MAJUSCULES)`);
  lines.push(`2. Une description premium de 150-200 mots, ton éditorial, évocateur du mode de vie`);
  lines.push(`3. Une liste de 5 features supplémentaires qui s'appliqueraient probablement à ce bien, choisies parmi :`);
  lines.push(`   Parking, Piscine, Ascenseur, Gardien, Terrasse, Climatisation, Jardin, Balcon, Garage, Vue mer, Vue dégagée, Cave, Cuisine équipée`);
  lines.push(``);
  lines.push(`Réponds UNIQUEMENT avec ce JSON, rien d'autre :`);
  lines.push(`{`);
  lines.push(`  "title": "...",`);
  lines.push(`  "description": "...",`);
  lines.push(`  "suggested_features": ["...", "..."]`);
  lines.push(`}`);

  return lines.join("\n");
}

/** Extract JSON object from Claude response. Handles ```json blocks and prefix prose. */
function extractJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Find the first balanced {...}
  const start = cleaned.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
