// ── Website Property shape (used by all components) ──────────────────────────

export interface Property {
  id: string;
  title: string;
  type: string;
  transaction: "Vente" | "Location";
  location: string;
  price: number;
  priceLabel?: string;
  isRental: boolean;
  surface: number;
  surfaceLabel?: string;
  furnished: boolean;
  beds?: number;
  salons?: number;
  baths?: number;
  rooms?: number;      // total pieces (from Supabase)
  floor?: string;
  description: string;
  gradientClass: string;
  photoUrl?: string;
  imageCount?: number;
  photos?: string[];   // direct URLs from Supabase Storage
  reference?: string;  // CRM reference (e.g. WH-2026-001)
}

// ── Image helpers ─────────────────────────────────────────────────────────────

export function getPropertyImageUrl(id: string, index: number = 1): string {
  return `${import.meta.env.BASE_URL}images/properties/${id}_${index}.jpg`;
}

export function getPropertyImageUrls(property: Property): string[] {
  // Supabase properties: use the photos array directly
  if (property.photos && property.photos.length > 0) {
    return property.photos;
  }
  // Legacy local images
  const count = property.imageCount || 0;
  if (count === 0 && property.photoUrl) {
    return [`${import.meta.env.BASE_URL}images/properties/${property.id}.jpg`];
  }
  return Array.from({ length: count }, (_, i) => getPropertyImageUrl(property.id, i + 1));
}

// ── Gradient cycle ────────────────────────────────────────────────────────────

export const GRADIENTS = [
  "mesh-gradient-1",
  "mesh-gradient-2",
  "mesh-gradient-3",
  "mesh-gradient-4",
  "mesh-gradient-5",
  "mesh-gradient-6",
];

function g(i: number) {
  return GRADIENTS[i % GRADIENTS.length];
}

// ── Supabase row shape (mirrors DB columns) ───────────────────────────────────

export interface SupabaseProperty {
  id: string;
  reference: string;
  type: string;
  transaction: string;
  neighborhood: string;
  city: string;
  price: string | number | null;
  surface: string | number | null;
  furnished: string | null;
  rooms: string | number | null;
  status: string;
  agent: string;
  photos: string[];
  description: string | null;
  notes: string | null;
  owner: { name?: string; phone?: string; email?: string } | null;
  photo_status: string | null;
  published: boolean;
  created_at: string;
}

// ── Mapper: Supabase row → website Property ───────────────────────────────────

export function mapSupabaseProperty(p: SupabaseProperty, index: number): Property {
  const price = parseFloat(String(p.price ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const surface = parseFloat(String(p.surface ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const rooms = parseInt(String(p.rooms ?? "0"), 10) || 0;
  const isFurnished = String(p.furnished ?? "").toLowerCase().includes("meublé");
  const location = [p.neighborhood, p.city].filter(Boolean).join(", ");

  // Title: first non-empty line of description, or type + neighborhood
  const firstLine = p.description?.split("\n").find((l) => l.trim());
  const title = firstLine?.trim() || `${p.type} ${p.neighborhood || p.city || ""}`.trim();

  return {
    id: p.id,
    reference: p.reference,
    title,
    type: p.type,
    transaction: (p.transaction === "Location" ? "Location" : "Vente"),
    location,
    price,
    isRental: p.transaction === "Location",
    surface,
    furnished: isFurnished,
    rooms: rooms > 0 ? rooms : undefined,
    description: p.description ?? "",
    gradientClass: g(index),
    photos: p.photos ?? [],
    imageCount: (p.photos ?? []).length,
  };
}

// ── Supabase query helpers ────────────────────────────────────────────────────

import { supabase } from "./supabase";

/** Fetch all published properties with photos OK, with optional filters */
export async function fetchProperties(opts?: {
  transaction?: string;
  type?: string;
}): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select("*")
    .eq("published", true)
    .eq("photo_status", "✅ Photos OK")
    .order("created_at", { ascending: false });

  if (opts?.transaction) query = query.eq("transaction", opts.transaction);
  if (opts?.type) query = query.eq("type", opts.type);

  const { data, error } = await query;
  if (error) throw error;
  return (data as SupabaseProperty[]).map((p, i) => mapSupabaseProperty(p, i));
}

/** Fetch a single property by id */
export async function fetchProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (error) return null;
  return mapSupabaseProperty(data as SupabaseProperty, 0);
}

/** Fetch latest 3 published properties with photos for the homepage */
export async function fetchFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("published", true)
    .eq("photo_status", "✅ Photos OK")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data as SupabaseProperty[]).map((p, i) => mapSupabaseProperty(p, i));
}

/** Save a lead (contact form submission) */
export async function submitLead(lead: {
  name: string;
  phone: string;
  email: string;
  message: string;
  property_reference?: string;
}): Promise<void> {
  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    notes: lead.message,
    source: "Website WeHome",
    status: "New",
    property_reference: lead.property_reference ?? null,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ── Legacy data kept for fallback / type reference ────────────────────────────

export const PROPERTY_TYPES = [
  "Villa",
  "Appartement",
  "Penthouse",
  "Duplex",
  "Triplex",
  "Studio",
  "Bureau",
  "Terrain",
  "Commerce",
  "Ferme",
  "Rez de jardin",
  "Bâtiment industriel",
];
