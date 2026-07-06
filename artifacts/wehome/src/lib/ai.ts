// src/lib/ai.ts
//
// Frontend wrapper for the AI-powered Supabase Edge Functions.
//   - generatePropertyDescription → Claude Haiku, title + description
//   - enhancePropertyPhoto         → OpenAI gpt-image-1, photo retouching
// Both used by the "✨ Publier avec IA" wizard in /espace-agent/dashboard/biens.

import { supabase } from "./supabase";

export interface PropertyBrief {
  type: string; // "Appartement" | "Villa" | …
  transaction: string; // "Vente" | "Location"
  ville: string; // "Casablanca"
  quartier: string; // "Maarif"
  surface?: number;
  chambres?: number;
  salons?: number;
  sdb?: number;
  prix?: number;
  features?: string[];
  meuble?: boolean;
}

export interface GeneratedListing {
  title: string;
  description: string;
  suggested_features: string[];
}

/** Call the Supabase Edge Function `generate-property-description` and return
 *  a structured listing. Throws on network / API / parsing errors so callers
 *  can show a friendly error in the UI and offer a manual fallback. */
export async function generatePropertyDescription(brief: PropertyBrief): Promise<GeneratedListing> {
  const { data, error } = await supabase.functions.invoke<GeneratedListing>(
    "generate-property-description",
    { body: brief }
  );

  if (error) {
    throw new Error(
      `Génération IA indisponible : ${error.message ?? "erreur inconnue"}. ` +
        `Vous pouvez écrire le titre et la description à la main.`
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error("Réponse IA invalide. Réessayez ou rédigez manuellement.");
  }

  // Defensive parse — the Edge Function already validates but be safe
  return {
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    suggested_features: Array.isArray(data.suggested_features)
      ? data.suggested_features.filter((s: unknown): s is string => typeof s === "string")
      : [],
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Photo enhancement (OpenAI gpt-image-1)
 * ────────────────────────────────────────────────────────────────────────── */

export type PhotoEnhanceMode = "auto_enhance" | "exterior_polish";

export interface EnhancedPhoto {
  enhanced_url: string;
  original_url: string;
  mode: PhotoEnhanceMode;
}

/** Call the `enhance-property-photo` Edge Function. Latency: 20-40s per photo.
 *  Cost: ~$0.04 per call (gpt-image-1 standard). */
export async function enhancePropertyPhoto(
  imageUrl: string,
  mode: PhotoEnhanceMode = "auto_enhance"
): Promise<EnhancedPhoto> {
  const { data, error } = await supabase.functions.invoke<EnhancedPhoto>("enhance-property-photo", {
    body: { image_url: imageUrl, mode },
  });

  if (error) {
    throw new Error(`Amélioration IA indisponible : ${error.message ?? "erreur inconnue"}.`);
  }
  if (!data || typeof data !== "object" || typeof data.enhanced_url !== "string") {
    throw new Error("Réponse IA invalide. Réessayez ou gardez l'original.");
  }
  return data;
}
