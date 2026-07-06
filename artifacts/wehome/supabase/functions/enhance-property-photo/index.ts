// supabase/functions/enhance-property-photo/index.ts
//
// Edge Function — improves a property photo using OpenAI gpt-image-1
// (/v1/images/edits endpoint). Used by the agent publish wizard.
//
// v1: single "auto_enhance" mode — brighten, sharpen, declutter without
// modifying architecture. Future modes (virtual_staging, sky_replacement,
// day_to_dusk) can be added by extending the MODE_PROMPTS map.
//
// Deploy:
//   supabase functions deploy enhance-property-photo
//
// Env vars (Supabase dashboard → Edge Functions → Secrets):
//   OPENAI_API_KEY   — your OpenAI key (https://platform.openai.com/api-keys)
//   SUPABASE_URL                 — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY    — auto-injected
//
// Cost: ~$0.04 per image (gpt-image-1 standard quality, 1024x1024).
// Latency: 20-40 seconds per image.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STORAGE_BUCKET = Deno.env.get("ENHANCED_PHOTOS_BUCKET") ?? "agent-properties";
const OPENAI_MODEL = "gpt-image-1";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

type Mode = "auto_enhance" | "exterior_polish";

const MODE_PROMPTS: Record<Mode, string> = {
  auto_enhance:
    "Enhance this real estate listing photo to look professional and editorial. " +
    "Brighten shadows, balance exposure, enhance natural colors, increase sharpness, " +
    "clean minor visual clutter (dust, smudges, distracting small objects). " +
    "Keep the room architecture, furniture placement, layout, and proportions IDENTICAL. " +
    "Do not add, remove, or rearrange furniture. Do not change the wall color, " +
    "flooring, or fixtures. Photorealistic output only — no stylization, no cartoon look. " +
    "The result should look like the same photo retouched by a professional real estate photographer.",
  exterior_polish:
    "Enhance this real estate exterior photo. If the sky is gray or overcast, " +
    "replace it with a bright clear blue sky with subtle light clouds. Enhance grass " +
    "and vegetation to look healthy and vibrant. Brighten shadows and balance exposure. " +
    "Increase sharpness on architectural details. Keep the building, structure, layout, " +
    "garden composition, and all hard elements (paths, walls, pools, cars) IDENTICAL. " +
    "Do not add or remove anything. Photorealistic only.",
};

interface RequestBody {
  image_url: string;
  mode?: Mode;
  /** Optional: a folder path inside the bucket where the enhanced image goes. */
  output_folder?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY not configured on server" }, 500);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.image_url) {
    return json({ error: "Missing image_url" }, 400);
  }

  const mode: Mode = body.mode ?? "auto_enhance";
  const prompt = MODE_PROMPTS[mode];
  if (!prompt) {
    return json({ error: `Unknown mode: ${mode}` }, 400);
  }

  try {
    // ── 1. Fetch the original image ─────────────────────────────────────────
    const originalRes = await fetch(body.image_url);
    if (!originalRes.ok) {
      return json({ error: `Failed to fetch image (${originalRes.status})` }, 400);
    }
    const originalBytes = new Uint8Array(await originalRes.arrayBuffer());
    const mimeType = originalRes.headers.get("content-type") ?? "image/jpeg";
    const extFromMime = mimeType.includes("png") ? "png" : "jpg";

    // ── 2. Call OpenAI Image Edits ──────────────────────────────────────────
    const formData = new FormData();
    formData.append("model", OPENAI_MODEL);
    formData.append("prompt", prompt);
    formData.append("size", "1024x1024");
    formData.append("quality", "high");
    formData.append("n", "1");
    formData.append(
      "image",
      new Blob([originalBytes], { type: mimeType }),
      `original.${extFromMime}`
    );

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI Image Edits error", openaiRes.status, errText);
      return json({ error: `OpenAI ${openaiRes.status}`, detail: errText }, 502);
    }

    const data = (await openaiRes.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };

    const first = data.data?.[0];
    if (!first?.b64_json && !first?.url) {
      return json({ error: "OpenAI returned no image" }, 502);
    }

    // ── 3. Get the enhanced image bytes ─────────────────────────────────────
    let enhancedBytes: Uint8Array;
    if (first.b64_json) {
      enhancedBytes = base64ToUint8(first.b64_json);
    } else if (first.url) {
      const r = await fetch(first.url);
      if (!r.ok) return json({ error: "Failed to fetch OpenAI result image" }, 502);
      enhancedBytes = new Uint8Array(await r.arrayBuffer());
    } else {
      return json({ error: "Unexpected OpenAI response shape" }, 502);
    }

    // ── 4. Upload to Supabase Storage ───────────────────────────────────────
    const folder = body.output_folder ?? "enhanced";
    const fileName = `${folder}/${crypto.randomUUID()}.png`;
    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, enhancedBytes, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      });
    if (upErr) {
      console.error("Storage upload error", upErr);
      return json({ error: `Storage upload failed: ${upErr.message}` }, 500);
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    return json(
      {
        enhanced_url: pub.publicUrl,
        original_url: body.image_url,
        mode,
        bucket: STORAGE_BUCKET,
        path: fileName,
      },
      200
    );
  } catch (err) {
    console.error("enhance-property-photo error", err);
    return json({ error: String(err) }, 500);
  }
});

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
