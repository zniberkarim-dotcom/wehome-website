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
  rooms?: number;
  floor?: string;
  description: string;
  gradientClass: string;
  photoUrl?: string;
  imageCount?: number;
  photos?: string[];
  reference?: string;
  agent?: string;
  agentId?: string; // FK to agents.id — used for agent widget on bien page
  isNew?: boolean;
  features?: string[];
  lat?: number;
  lng?: number;
  address?: string;
  /** Lifecycle status (synced from CRM). Defaults to "Disponible" when null/missing. */
  status?: PropertyStatus;
  /** Manual Pépite du Mois flag set from the CRM. */
  isPepite?: boolean;
}

/** Lifecycle status — mirrors the CRM PropertyStatus type. */
export type PropertyStatus =
  | "Disponible"
  | "Réservé"
  | "Sous compromis"
  | "Loué"
  | "Vendu"
  | "Retiré"
  | "Archivé";

/** Statuses that should appear in public listings (active inventory). */
export const ACTIVE_PROPERTY_STATUSES: PropertyStatus[] = [
  "Disponible",
  "Réservé",
  "Sous compromis",
];

// ── Filter params (URL ↔ query state) ────────────────────────────────────────

export interface FilterParams {
  transaction?: "Vente" | "Location";
  /** Multi-select: list of property types (e.g. ["Appartement", "Villa"]) */
  types?: string[];
  city?: string; // searches city + neighborhood
  search?: string; // free text
  prix_min?: number;
  prix_max?: number;
  surface_min?: number;
  surface_max?: number;
  /** Multi-select bedroom counts. 5 means "5 or more". e.g. [2, 3, 4] */
  chambres?: number[];
  /** Multi-select bathroom counts. 4 means "4 or more". */
  sdb?: number[];
  /** Multi-select living-room counts (salons). 4 means "4 or more". */
  salons?: number[];
  /** Multi-select condition. e.g. ["Neuf", "Bon état"] */
  etat?: string[];
  is_furnished?: boolean;
  features?: string[];
  agent_id?: string; // filter by agent UUID
  sort?: "recent" | "prix_asc" | "prix_desc" | "surface";
  page?: number;
}

/** Helper to parse a comma-separated number list from a URL param. */
function parseNumList(s: string | null | undefined): number[] | undefined {
  if (!s) return undefined;
  const arr = s
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n));
  return arr.length ? arr : undefined;
}

/** Helper to parse a comma-separated string list from a URL param. */
function parseStrList(s: string | null | undefined): string[] | undefined {
  if (!s) return undefined;
  const arr = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

/** Parse URLSearchParams string → FilterParams.
 *  Accepts both the new multi-select format (`types=Villa,Studio`) AND legacy
 *  single-value params (`type=Villa`, `chambres_min=2`) for backwards compat. */
export function parseFilterParams(search: string): FilterParams {
  const s = search.startsWith("?") ? search.slice(1) : search;
  const p = new URLSearchParams(s);
  const transaction = p.get("transaction");
  const sort = p.get("tri");

  // Type: prefer multi, fall back to legacy single
  const types = parseStrList(p.get("types")) ?? (p.get("type") ? [p.get("type")!] : undefined);

  // Chambres: prefer multi, fall back to legacy chambres_min → [n, n+1, …, 5]
  let chambres = parseNumList(p.get("chambres"));
  if (!chambres) {
    const legacy = p.get("chambres_min");
    if (legacy) {
      const n = Math.max(1, Math.min(5, Number(legacy)));
      chambres = Number.isFinite(n) ? Array.from({ length: 6 - n }, (_, i) => n + i) : undefined;
    }
  }

  return {
    transaction: transaction === "Vente" || transaction === "Location" ? transaction : undefined,
    types,
    city: p.get("ville") || undefined,
    search: p.get("q") || undefined,
    prix_min: p.get("prix_min") ? Number(p.get("prix_min")) : undefined,
    prix_max: p.get("prix_max") ? Number(p.get("prix_max")) : undefined,
    surface_min: p.get("surface_min") ? Number(p.get("surface_min")) : undefined,
    surface_max: p.get("surface_max") ? Number(p.get("surface_max")) : undefined,
    chambres,
    sdb: parseNumList(p.get("sdb")),
    salons: parseNumList(p.get("salons")),
    etat: parseStrList(p.get("etat")),
    is_furnished: p.get("meuble") === "1" ? true : undefined,
    features: parseStrList(p.get("equip")),
    agent_id: p.get("agent") || undefined,
    sort:
      sort === "recent" || sort === "prix_asc" || sort === "prix_desc" || sort === "surface"
        ? sort
        : undefined,
    page: p.get("page") ? Math.max(1, Number(p.get("page"))) : undefined,
  };
}

/** Build /biens URL from FilterParams */
export function buildSearchUrl(params: FilterParams): string {
  const p = new URLSearchParams();
  if (params.transaction) p.set("transaction", params.transaction);
  if (params.types?.length) p.set("types", params.types.join(","));
  if (params.city) p.set("ville", params.city);
  if (params.search) p.set("q", params.search);
  if (params.prix_min) p.set("prix_min", String(params.prix_min));
  if (params.prix_max) p.set("prix_max", String(params.prix_max));
  if (params.surface_min) p.set("surface_min", String(params.surface_min));
  if (params.surface_max) p.set("surface_max", String(params.surface_max));
  if (params.chambres?.length) p.set("chambres", params.chambres.join(","));
  if (params.sdb?.length) p.set("sdb", params.sdb.join(","));
  if (params.salons?.length) p.set("salons", params.salons.join(","));
  if (params.etat?.length) p.set("etat", params.etat.join(","));
  if (params.is_furnished) p.set("meuble", "1");
  if (params.features?.length) p.set("equip", params.features.join(","));
  if (params.agent_id) p.set("agent", params.agent_id);
  if (params.sort && params.sort !== "recent") p.set("tri", params.sort);
  if (params.page && params.page > 1) p.set("page", String(params.page));
  const qs = p.toString();
  return qs ? `/biens?${qs}` : "/biens";
}

// ── Image helpers ─────────────────────────────────────────────────────────────

export function getPropertyImageUrl(id: string, index: number = 1): string {
  return `${import.meta.env.BASE_URL}images/properties/${id}_${index}.jpg`;
}

export function getPropertyImageUrls(property: Property): string[] {
  if (property.photos && property.photos.length > 0) {
    return property.photos;
  }
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

// ── Supabase row shape ────────────────────────────────────────────────────────

export interface SupabaseProperty {
  id: string;
  reference: string;
  type: string;
  transaction: string;
  neighborhood: string;
  city: string;
  price: string | number | null;
  surface: string | number | null;
  surface_construite: string | number | null;
  furnished: string | null;
  rooms: string | number | null;
  chambres: string | number | null;
  salons: string | number | null;
  salles_de_bains: string | number | null;
  status: string;
  agent: string | null;
  photos: string[];
  description: string | null;
  notes: string | null;
  owner: { name?: string; phone?: string; email?: string } | null;
  photo_status: string | null;
  published: boolean;
  /** CRM-controlled flag: when true, this property surfaces as the Pépite du Mois. */
  is_pepite?: boolean | null;
  created_at: string;
  // Optional newer columns (may be null if not yet added to DB)
  is_new?: boolean | null;
  features?: string[] | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  // Agent system columns
  agent_id?: string | null;
  titre?: string | null;
  photo_principale?: string | null;
  ville?: string | null;
  meuble?: boolean | null;
}

// ── Mapper: Supabase row → website Property ───────────────────────────────────

export function mapSupabaseProperty(p: SupabaseProperty, index: number): Property {
  const price = parseFloat(String(p.price ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const surface = parseFloat(String(p.surface ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const surfaceConstruite =
    parseFloat(String(p.surface_construite ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const rooms = parseInt(String(p.rooms ?? "0"), 10) || 0;
  const chambres = parseInt(String(p.chambres ?? "0"), 10) || 0;
  const salons = parseInt(String(p.salons ?? "0"), 10) || 0;
  const sallesDeBains = parseInt(String(p.salles_de_bains ?? "0"), 10) || 0;
  const isFurnished =
    p.meuble === true ||
    String(p.furnished ?? "")
      .toLowerCase()
      .includes("meublé");

  // Location: prefer city/ville column when set by agent, fallback to neighborhood+city
  const cityStr = p.ville || p.city || "";
  const neighborhoodStr = p.neighborhood || (p.address ?? "");
  const location = [neighborhoodStr, cityStr].filter(Boolean).join(", ") || cityStr;

  // Title: prefer explicit `titre`, then description first line, then type+location
  const firstLine = p.description?.split("\n").find((l) => l.trim());
  const title =
    p.titre?.trim() || firstLine?.trim() || `${p.type} ${p.neighborhood || cityStr || ""}`.trim();

  const displaySurface = surfaceConstruite > 0 ? surfaceConstruite : surface;

  // Photos: prefer photo_principale + photos array for agent-uploaded properties
  let photos: string[] = [];
  if (p.photo_principale) {
    photos = [p.photo_principale, ...(p.photos ?? []).filter((u) => u !== p.photo_principale)];
  } else {
    photos = p.photos ?? [];
  }

  return {
    id: p.id,
    reference: p.reference,
    title,
    type: p.type,
    transaction: p.transaction === "Location" ? "Location" : "Vente",
    location,
    price,
    isRental: p.transaction === "Location",
    surface: displaySurface,
    furnished: isFurnished,
    rooms: rooms > 0 ? rooms : undefined,
    beds: chambres > 0 ? chambres : undefined,
    salons: salons > 0 ? salons : undefined,
    baths: sallesDeBains > 0 ? sallesDeBains : undefined,
    description: p.description ?? "",
    gradientClass: g(index),
    photos,
    imageCount: photos.length,
    agent: p.agent ?? undefined,
    agentId: p.agent_id ?? undefined,
    isNew: p.is_new === true,
    features: Array.isArray(p.features) ? p.features : [],
    lat: p.lat ?? undefined,
    lng: p.lng ?? undefined,
    address: p.address ?? undefined,
    status: (p.status as PropertyStatus | undefined) ?? "Disponible",
    isPepite: p.is_pepite === true,
  };
}

// ── Supabase query helpers ────────────────────────────────────────────────────

import { supabase } from "./supabase";

const PAGE_SIZE = 12;

/**
 * Fetch published properties with full filtering, sorting and pagination.
 * Server-side: transaction, type, city/neighborhood.
 * Client-side: price, surface, bedrooms, furnished (price is TEXT in DB).
 */
export async function fetchProperties(
  params?: FilterParams
): Promise<{ data: Property[]; total: number }> {
  let query = supabase.from("properties").select("*").eq("published", true);

  // Only require photo_status check when NOT filtering by a specific agent
  if (!params?.agent_id) {
    query = query.eq("photo_status", "✅ Photos OK");
  }

  // ── Lifecycle filter ────────────────────────────────────────────────────
  // Hide Vendu / Loué / Retiré / Archivé from public listings.
  // Accept rows with NULL status (legacy data) — treat as Disponible.
  query = query.or(
    `status.is.null,status.in.(${ACTIVE_PROPERTY_STATUSES.map((s) => `"${s}"`).join(",")})`
  );

  // Server-side exact filters
  if (params?.transaction) query = query.eq("transaction", params.transaction);
  if (params?.types?.length) query = query.in("type", params.types);
  if (params?.agent_id) query = query.eq("agent_id", params.agent_id);

  // Server-side text search (city + neighborhood + ville)
  if (params?.city && params.city.trim()) {
    const c = params.city.trim();
    query = query.or(`city.ilike.%${c}%,neighborhood.ilike.%${c}%,ville.ilike.%${c}%`);
  }

  // Default sort: newest first
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let results = (data as SupabaseProperty[]).map((p, i) => mapSupabaseProperty(p, i));

  // Client-side: free text search
  if (params?.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.reference ?? "").toLowerCase().includes(q)
    );
  }

  // Client-side: price (DB stores as TEXT)
  if (params?.prix_min) results = results.filter((p) => p.price >= params.prix_min!);
  if (params?.prix_max) results = results.filter((p) => p.price > 0 && p.price <= params.prix_max!);

  // Client-side: surface
  if (params?.surface_min) results = results.filter((p) => p.surface >= params.surface_min!);
  if (params?.surface_max)
    results = results.filter((p) => p.surface > 0 && p.surface <= params.surface_max!);

  // Client-side: chambres (multi-select, 5 means "5 or more")
  if (params?.chambres?.length) {
    const wanted = new Set(params.chambres);
    const hasFive = wanted.has(5);
    results = results.filter((p) => {
      const n = p.beds ?? p.rooms ?? 0;
      if (n <= 0) return false;
      return wanted.has(n) || (hasFive && n >= 5);
    });
  }

  // Client-side: salles de bains (multi-select, 4 means "4 or more")
  if (params?.sdb?.length) {
    const wanted = new Set(params.sdb);
    const hasMax = wanted.has(4);
    results = results.filter((p) => {
      const n = p.baths ?? 0;
      if (n <= 0) return false;
      return wanted.has(n) || (hasMax && n >= 4);
    });
  }

  // Client-side: salons (multi-select, 4 means "4 or more")
  if (params?.salons?.length) {
    const wanted = new Set(params.salons);
    const hasMax = wanted.has(4);
    results = results.filter((p) => {
      const n = p.salons ?? 0;
      if (n <= 0) return false;
      return wanted.has(n) || (hasMax && n >= 4);
    });
  }

  // Client-side: état (state of the property) — looked up in features list since
  // the DB doesn't yet have a dedicated column. Matches "Neuf", "Bon état", "À rénover".
  if (params?.etat?.length) {
    const wanted = new Set(params.etat.map((x) => x.toLowerCase()));
    results = results.filter((p) => (p.features ?? []).some((f) => wanted.has(f.toLowerCase())));
  }

  // Client-side: furnished
  if (params?.is_furnished) results = results.filter((p) => p.furnished);

  // Client-side: features (must include ALL selected features)
  if (params?.features?.length) {
    results = results.filter((p) => params.features!.every((f) => (p.features ?? []).includes(f)));
  }

  // Client-side sort (overrides default "recent" from server order)
  const sort = params?.sort ?? "recent";
  if (sort === "prix_asc") results.sort((a, b) => a.price - b.price);
  else if (sort === "prix_desc") results.sort((a, b) => b.price - a.price);
  else if (sort === "surface") results.sort((a, b) => b.surface - a.surface);
  // "recent" already sorted by DB

  const total = results.length;

  // Pagination
  const page = Math.max(1, params?.page ?? 1);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { data: paged, total };
}

/** Fetch a single property by id (published or agent-owned preview) */
export async function fetchProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();

  if (error) return null;
  return mapSupabaseProperty(data as SupabaseProperty, 0);
}

/** Fetch latest 3 published properties for the homepage.
 *
 *  Order:
 *    1. CRM-flagged `is_pepite = true` first (editorial choice)
 *    2. Then newest published
 *
 *  Filters: only active inventory (Disponible / Réservé / Sous compromis).
 *  Sold/Loué/Archivé never surface on the home page.
 */
export async function fetchFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("published", true)
    .eq("photo_status", "✅ Photos OK")
    .or(`status.is.null,status.in.(${ACTIVE_PROPERTY_STATUSES.map((s) => `"${s}"`).join(",")})`)
    .order("is_pepite", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data as SupabaseProperty[]).map((p, i) => mapSupabaseProperty(p, i));
}

/** Save a lead from the contact form */
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

/** Save a visit appointment.
 *  NB: there is no dedicated `appointments` table yet — we mirror the RDV
 *  into the existing `leads` table so the sales team sees them immediately
 *  in /espace-agent/dashboard/leads. When a real appointments module is built,
 *  this function can be redirected to that table without changing callers. */
export async function submitAppointment(appt: {
  property_id: string;
  property_title: string;
  agent_name?: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  notes?: string;
}): Promise<void> {
  const dateFr = (() => {
    try {
      return new Date(`${appt.appointment_date}T${appt.appointment_time}:00`).toLocaleString(
        "fr-FR",
        {
          dateStyle: "full",
          timeStyle: "short",
        }
      );
    } catch {
      return `${appt.appointment_date} à ${appt.appointment_time}`;
    }
  })();

  const noteBody = [
    `[RDV demandé] ${dateFr}`,
    `Bien : ${appt.property_title}${appt.agent_name ? ` · Agent : ${appt.agent_name}` : ""}`,
    appt.notes?.trim() ? `\n${appt.notes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("leads").insert({
    name: appt.visitor_name,
    phone: appt.visitor_phone,
    email: appt.visitor_email ?? null,
    notes: noteBody,
    source: "RDV — Visite",
    status: "New",
    property_reference: appt.property_id,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Save a network partner application.
 *  NB: there is no dedicated `network_partners` table yet — we mirror the
 *  application into the existing `leads` table so the sales team sees them
 *  immediately. When a real partners module is built, this function can be
 *  redirected to that table without changing callers. */
export async function submitNetworkApplication(data: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_type: string;
  zones: string[];
  property_count: string;
  message?: string;
}): Promise<void> {
  const fullName = `${data.first_name} ${data.last_name}`.trim();
  const noteBody = [
    `[CANDIDATURE NETWORK]`,
    `Profil : ${data.profile_type}`,
    `Zones : ${data.zones.join(", ") || "—"}`,
    `Volume biens : ${data.property_count}`,
    data.message?.trim() ? `\nMessage :\n${data.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("leads").insert({
    name: fullName,
    phone: data.phone,
    email: data.email,
    notes: noteBody,
    source: "Network — Candidature",
    status: "New",
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Particulier (FSBO) submission — public self-publishing
 *
 * Inserts a row into `properties` with `agent_id = null` (no agent),
 * status pending validation, owner contact stored in the `owner` JSON column.
 * Uses the existing `agent-photos` bucket under a `particuliers/` prefix.
 * ────────────────────────────────────────────────────────────────────────── */

export interface ParticulierSubmission {
  // Bien
  type: string;
  transaction: "Vente" | "Location";
  ville: string;
  quartier?: string;
  adresse?: string;
  prix: number;
  surface: number;
  chambres?: number;
  salles_de_bains?: number;
  salons?: number;
  meuble?: boolean;
  description: string;
  photos: string[]; // public URLs returned by uploadParticulierPhoto
  features?: string[];
  // Vendeur
  vendeur_nom: string;
  vendeur_prenom: string;
  vendeur_email: string;
  vendeur_telephone: string;
  vendeur_message?: string;
}

/** Upload a single photo for a particulier listing.
 *  Public bucket reused from agent-photos; path is unique to avoid clashes. */
export async function uploadParticulierPhoto(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const safeExt = /^(jpg|jpeg|png|webp|heic)$/.test(ext) ? ext : "jpg";
  const path = `particuliers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage
    .from("agent-photos")
    .upload(path, file, { upsert: false, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("agent-photos").getPublicUrl(path);
  return data.publicUrl;
}

/** Submit a particulier listing → properties (pending validation) + leads (sales pipeline). */
export async function submitParticulierProperty(s: ParticulierSubmission): Promise<{ id: string }> {
  const reference = `WHM-${Date.now()}`;
  const photoPrincipale = s.photos[0] ?? null;
  const fullName = `${s.vendeur_prenom} ${s.vendeur_nom}`.trim();

  const row = {
    reference,
    type: s.type,
    transaction: s.transaction,
    titre: `${s.type} ${s.quartier || s.ville}`.trim(),
    neighborhood: s.quartier ?? "",
    city: s.ville,
    ville: s.ville,
    address: s.adresse ?? null,
    price: String(s.prix),
    surface: String(s.surface),
    surface_construite: String(s.surface),
    chambres: s.chambres ?? 0,
    salles_de_bains: s.salles_de_bains ?? 0,
    salons: s.salons ?? 0,
    meuble: s.meuble ?? false,
    description: s.description,
    features: s.features ?? [],
    photos: s.photos,
    photo_principale: photoPrincipale,
    photo_status: photoPrincipale ? "⏳ En attente" : "❌ Pas de photo",
    published: false,
    portal_statut: "en_attente_validation",
    agent_id: null,
    owner: {
      name: fullName,
      email: s.vendeur_email,
      phone: s.vendeur_telephone,
    },
    notes: `Soumission particulier — ${s.vendeur_message ?? "(pas de message)"}`,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("properties").insert(row).select("id").single();
  if (error) throw error;

  // Mirror in leads pipeline so the sales team sees a fresh seller lead immediately
  try {
    await supabase.from("leads").insert({
      name: fullName,
      phone: s.vendeur_telephone,
      email: s.vendeur_email,
      notes:
        `[VENDEUR PARTICULIER] ${s.type} à ${s.ville} · ${s.prix} MAD\n\n${s.vendeur_message ?? ""}`.trim(),
      source: "Publier mon bien",
      status: "New",
      property_reference: reference,
      created_at: new Date().toISOString(),
    });
  } catch {
    /* best-effort; the property submission succeeded — don't break the UX */
  }

  return { id: data.id };
}

// ── Legacy constants ──────────────────────────────────────────────────────────

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

export const PAGE_SIZE_EXPORT = PAGE_SIZE;

// ── Agent interfaces ──────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photo_url?: string;
  bio?: string;
  specialites?: string[];
  actif: boolean;
  slug?: string;
  created_at: string;
  updated_at?: string;
  // Agent portal fields (added via migration)
  role?: "admin" | "agent_interne" | "agent_partenaire";
  nom_agence?: string;
  logo_agence_url?: string;
  ville?: string;
  statut?: "pending" | "actif" | "suspendu";
  date_activation?: string;
  abonnement?: "essai" | "basic" | "premium";
  listings_limit?: number;
}

export interface AgentProperty {
  id: string;
  titre?: string; // → titre column (custom listing title)
  adresse?: string; // → neighborhood + address columns
  ville?: string; // → city column
  prix?: string; // → price column
  type?: string;
  transaction?: string;
  statut?: string; // → status column  ("Actif" | "Inactif" | "Vendu" | "Loué")
  photo_principale?: string;
  photos?: string[];
  surface_construite?: string;
  chambres?: number;
  salles_de_bains?: number;
  salons?: number;
  description?: string;
  agent_id?: string;
  actif?: boolean; // → published column
  meuble?: boolean; // → meuble column
  features?: string[];
  lat?: number;
  lng?: number;
  created_at?: string;
}

// ── Agent CRUD ────────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("actif", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Agent[];
}

export async function fetchAgentBySlug(slug: string): Promise<Agent | null> {
  const { data, error } = await supabase.from("agents").select("*").eq("slug", slug).single();
  if (error) return null;
  return data as Agent;
}

export async function fetchAgentById(agentId: string): Promise<Agent | null> {
  const { data, error } = await supabase.from("agents").select("*").eq("id", agentId).single();
  if (error) return null;
  return data as Agent;
}

export async function fetchMyAgent(userId: string): Promise<Agent | null> {
  const { data, error } = await supabase.from("agents").select("*").eq("user_id", userId).single();
  if (error) return null;
  return data as Agent;
}

export async function fetchAgentProperties(agentId: string): Promise<AgentProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AgentProperty[];
}

export async function updateAgentProfile(
  userId: string,
  updates: Partial<Omit<Agent, "id" | "user_id" | "created_at">>
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Agent;
}

export async function uploadAgentPhoto(file: File, agentId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `agents/${agentId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from("agent-photos")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("agent-photos").getPublicUrl(path);
  return data.publicUrl;
}

// ── Property CRUD (for agent dashboard) ──────────────────────────────────────

/** Map AgentProperty fields → DB column names (explicit — never spreads unknown keys) */
function toDbRow(props: Partial<AgentProperty>) {
  const row: Record<string, unknown> = {};

  // Direct mappings (same name in AgentProperty and DB)
  if (props.titre !== undefined) row.titre = props.titre;
  if (props.ville !== undefined) row.ville = props.ville;
  if (props.type !== undefined) row.type = props.type;
  if (props.transaction !== undefined) row.transaction = props.transaction;
  if (props.description !== undefined) row.description = props.description;
  if (props.chambres !== undefined) row.chambres = props.chambres;
  if (props.salons !== undefined) row.salons = props.salons;
  if (props.salles_de_bains !== undefined) row.salles_de_bains = props.salles_de_bains;
  if (props.surface_construite !== undefined) row.surface_construite = props.surface_construite;
  if (props.photo_principale !== undefined) row.photo_principale = props.photo_principale;
  if (props.photos !== undefined) row.photos = props.photos;
  if (props.agent_id !== undefined) row.agent_id = props.agent_id;
  if (props.meuble !== undefined) row.meuble = props.meuble;
  if (props.features !== undefined) row.features = props.features;
  if (props.lat !== undefined) row.lat = props.lat;
  if (props.lng !== undefined) row.lng = props.lng;

  // Field renames
  if (props.prix !== undefined) row.price = props.prix; // prix → price
  if (props.actif !== undefined) row.published = props.actif; // actif → published
  if (props.adresse !== undefined) row.neighborhood = props.adresse; // adresse → neighborhood
  if (props.statut !== undefined) row.status = props.statut; // statut → status

  return row;
}

export async function createAgentProperty(
  agentId: string,
  props: Partial<AgentProperty>
): Promise<AgentProperty> {
  const row = {
    ...toDbRow(props),
    agent_id: agentId,
    published: props.actif !== false,
    photo_status: "✅ Photos OK", // so it appears on public listings immediately
    reference: `WH-${Date.now()}`, // auto-generate reference
  };
  const { data, error } = await supabase.from("properties").insert(row).select().single();
  if (error) throw error;
  return data as AgentProperty;
}

export async function updateAgentProperty(
  propertyId: string,
  agentId: string,
  updates: Partial<AgentProperty>
): Promise<AgentProperty> {
  const { data, error } = await supabase
    .from("properties")
    .update(toDbRow(updates))
    .eq("id", propertyId)
    .eq("agent_id", agentId)
    .select()
    .single();
  if (error) throw error;
  return data as AgentProperty;
}

export async function deleteAgentProperty(propertyId: string, agentId: string): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("agent_id", agentId);
  if (error) throw error;
}

/** Fetch a single agent property by ID for the dashboard edit page */
export async function fetchAgentPropertyById(
  propertyId: string,
  agentId: string
): Promise<AgentProperty | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("agent_id", agentId)
    .single();
  if (error) return null;
  const p = data as SupabaseProperty & AgentProperty;
  // Normalize back to AgentProperty shape
  return {
    id: p.id,
    titre: p.titre ?? undefined,
    adresse: p.neighborhood ?? p.address ?? undefined,
    ville: p.ville ?? p.city ?? undefined,
    prix: String(p.price ?? ""),
    type: p.type,
    transaction: p.transaction,
    surface_construite: String(p.surface_construite ?? ""),
    chambres: p.chambres ? Number(p.chambres) : undefined,
    salles_de_bains: p.salles_de_bains ? Number(p.salles_de_bains) : undefined,
    salons: p.salons ? Number(p.salons) : undefined,
    description: p.description ?? undefined,
    agent_id: p.agent_id ?? undefined,
    actif: (p as any).published !== false,
    statut: (p as any).status ?? undefined,
    photo_principale: p.photo_principale ?? (Array.isArray(p.photos) ? p.photos[0] : undefined),
    photos: Array.isArray(p.photos)
      ? p.photo_principale
        ? p.photos.filter((u) => u !== p.photo_principale)
        : p.photos.slice(1)
      : [],
    meuble: p.meuble ?? false,
    features: Array.isArray(p.features) ? p.features : [],
    lat: (p as any).lat ?? undefined,
    lng: (p as any).lng ?? undefined,
    created_at: p.created_at,
  };
}

export async function uploadPropertyPhoto(
  file: File,
  propertyId: string,
  index: number
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `properties/${propertyId}/${index}.${ext}`;
  const { error } = await supabase.storage
    .from("property-photos")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
  return data.publicUrl;
}

// ── Estimation lead ──────────────────────────────────────────────────────────

export interface EstimationLead {
  type_bien: string;
  quartier: string;
  superficie: number | null;
  chambres: string;
  etat: string;
  etage: string;
  caracteristiques: string[];
  motivation: string;
  nom: string;
  telephone: string;
  email: string;
  message?: string;
}

export async function submitEstimationLead(lead: EstimationLead): Promise<void> {
  const { error } = await supabase.from("estimation_leads").insert({ ...lead, status: "new" });
  if (error) throw error;
}

// ── Partenaires waitlist ─────────────────────────────────────────────────────

export interface PartenairesWaitlistEntry {
  nom: string;
  nom_agence: string;
  ville: string;
  telephone: string;
  email: string;
}

export async function submitPartenairesWaitlist(entry: PartenairesWaitlistEntry): Promise<void> {
  const { error } = await supabase
    .from("partenaires_waitlist")
    .insert({ ...entry, status: "waitlist" });
  if (error) throw error;
}
