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
  agentId?: string;        // FK to agents.id — used for agent widget on bien page
  isNew?: boolean;
  features?: string[];
  lat?: number;
  lng?: number;
  address?: string;
}

// ── Filter params (URL ↔ query state) ────────────────────────────────────────

export interface FilterParams {
  transaction?: "Vente" | "Location";
  type?: string;
  city?: string;           // searches city + neighborhood
  search?: string;         // free text
  prix_min?: number;
  prix_max?: number;
  surface_min?: number;
  chambres_min?: number;
  is_furnished?: boolean;
  features?: string[];
  agent_id?: string;       // filter by agent UUID
  sort?: "recent" | "prix_asc" | "prix_desc" | "surface";
  page?: number;
}

/** Parse URLSearchParams string → FilterParams */
export function parseFilterParams(search: string): FilterParams {
  const s = search.startsWith("?") ? search.slice(1) : search;
  const p = new URLSearchParams(s);
  const transaction = p.get("transaction");
  const sort = p.get("tri");
  return {
    transaction: (transaction === "Vente" || transaction === "Location") ? transaction : undefined,
    type: p.get("type") || undefined,
    city: p.get("ville") || undefined,
    search: p.get("q") || undefined,
    prix_min: p.get("prix_min") ? Number(p.get("prix_min")) : undefined,
    prix_max: p.get("prix_max") ? Number(p.get("prix_max")) : undefined,
    surface_min: p.get("surface_min") ? Number(p.get("surface_min")) : undefined,
    chambres_min: p.get("chambres_min") ? Number(p.get("chambres_min")) : undefined,
    is_furnished: p.get("meuble") === "1" ? true : undefined,
    features: p.get("equip") ? p.get("equip")!.split(",") : undefined,
    agent_id: p.get("agent") || undefined,
    sort: (sort === "recent" || sort === "prix_asc" || sort === "prix_desc" || sort === "surface") ? sort : undefined,
    page: p.get("page") ? Math.max(1, Number(p.get("page"))) : undefined,
  };
}

/** Build /biens URL from FilterParams */
export function buildSearchUrl(params: FilterParams): string {
  const p = new URLSearchParams();
  if (params.transaction) p.set("transaction", params.transaction);
  if (params.type) p.set("type", params.type);
  if (params.city) p.set("ville", params.city);
  if (params.search) p.set("q", params.search);
  if (params.prix_min) p.set("prix_min", String(params.prix_min));
  if (params.prix_max) p.set("prix_max", String(params.prix_max));
  if (params.surface_min) p.set("surface_min", String(params.surface_min));
  if (params.chambres_min) p.set("chambres_min", String(params.chambres_min));
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
  const surfaceConstruite = parseFloat(String(p.surface_construite ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
  const rooms = parseInt(String(p.rooms ?? "0"), 10) || 0;
  const chambres = parseInt(String(p.chambres ?? "0"), 10) || 0;
  const salons = parseInt(String(p.salons ?? "0"), 10) || 0;
  const sallesDeBains = parseInt(String(p.salles_de_bains ?? "0"), 10) || 0;
  const isFurnished = p.meuble === true || String(p.furnished ?? "").toLowerCase().includes("meublé");

  // Location: prefer city/ville column when set by agent, fallback to neighborhood+city
  const cityStr = p.ville || p.city || "";
  const neighborhoodStr = p.neighborhood || (p.address ?? "");
  const location = [neighborhoodStr, cityStr].filter(Boolean).join(", ") || cityStr;

  // Title: prefer explicit `titre`, then description first line, then type+location
  const firstLine = p.description?.split("\n").find((l) => l.trim());
  const title = p.titre?.trim() || firstLine?.trim() || `${p.type} ${p.neighborhood || cityStr || ""}`.trim();

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
    transaction: (p.transaction === "Location" ? "Location" : "Vente"),
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
  let query = supabase
    .from("properties")
    .select("*")
    .eq("published", true);

  // Only require photo_status check when NOT filtering by a specific agent
  if (!params?.agent_id) {
    query = query.eq("photo_status", "✅ Photos OK");
  }

  // Server-side exact filters
  if (params?.transaction) query = query.eq("transaction", params.transaction);
  if (params?.type) query = query.eq("type", params.type);
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

  // Client-side: bedrooms
  if (params?.chambres_min) {
    results = results.filter(
      (p) => (p.beds ?? p.rooms ?? 0) >= params.chambres_min!
    );
  }

  // Client-side: furnished
  if (params?.is_furnished) results = results.filter((p) => p.furnished);

  // Client-side: features
  if (params?.features?.length) {
    results = results.filter((p) =>
      params.features!.every((f) => (p.features ?? []).includes(f))
    );
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
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapSupabaseProperty(data as SupabaseProperty, 0);
}

/** Fetch latest 3 published properties for the homepage */
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

/** Save a visit appointment */
export async function submitAppointment(appt: {
  property_id: string;
  property_title: string;
  agent_name?: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  appointment_date: string;  // YYYY-MM-DD
  appointment_time: string;  // HH:MM
  notes?: string;
}): Promise<void> {
  const { error } = await supabase.from("appointments").insert({
    ...appt,
    status: "pending",
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Save a network partner application */
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
  const { error } = await supabase.from("network_partners").insert({
    ...data,
    status: "Pending",
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
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
}

export interface AgentProperty {
  id: string;
  titre?: string;           // → titre column (custom listing title)
  adresse?: string;         // → neighborhood + address columns
  ville?: string;           // → city column
  prix?: string;            // → price column
  type?: string;
  transaction?: string;
  statut?: string;          // → status column  ("Actif" | "Inactif" | "Vendu" | "Loué")
  photo_principale?: string;
  photos?: string[];
  surface_construite?: string;
  chambres?: number;
  salles_de_bains?: number;
  salons?: number;
  description?: string;
  agent_id?: string;
  actif?: boolean;          // → published column
  meuble?: boolean;         // → meuble column
  features?: string[];
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
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Agent;
}

export async function fetchAgentById(agentId: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single();
  if (error) return null;
  return data as Agent;
}

export async function fetchMyAgent(userId: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .single();
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
  if (props.titre       !== undefined) row.titre             = props.titre;
  if (props.ville       !== undefined) row.ville             = props.ville;
  if (props.type        !== undefined) row.type              = props.type;
  if (props.transaction !== undefined) row.transaction       = props.transaction;
  if (props.description !== undefined) row.description       = props.description;
  if (props.chambres    !== undefined) row.chambres          = props.chambres;
  if (props.salons      !== undefined) row.salons            = props.salons;
  if (props.salles_de_bains !== undefined) row.salles_de_bains = props.salles_de_bains;
  if (props.surface_construite !== undefined) row.surface_construite = props.surface_construite;
  if (props.photo_principale   !== undefined) row.photo_principale   = props.photo_principale;
  if (props.photos      !== undefined) row.photos            = props.photos;
  if (props.agent_id    !== undefined) row.agent_id          = props.agent_id;
  if (props.meuble      !== undefined) row.meuble            = props.meuble;
  if (props.features !== undefined) row.features = props.features;

  // Field renames
  if (props.prix   !== undefined) row.price        = props.prix;      // prix → price
  if (props.actif  !== undefined) row.published    = props.actif;     // actif → published
  if (props.adresse !== undefined) row.neighborhood = props.adresse;  // adresse → neighborhood
  if (props.statut !== undefined) row.status       = props.statut;    // statut → status

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
    photo_status: "✅ Photos OK",   // so it appears on public listings immediately
    reference: `WH-${Date.now()}`,  // auto-generate reference
  };
  const { data, error } = await supabase
    .from("properties")
    .insert(row)
    .select()
    .single();
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

export async function deleteAgentProperty(
  propertyId: string,
  agentId: string
): Promise<void> {
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
    photos: Array.isArray(p.photos) ? (p.photo_principale ? p.photos.filter(u => u !== p.photo_principale) : p.photos.slice(1)) : [],
    meuble: p.meuble ?? false,
    features: Array.isArray(p.features) ? p.features : [],
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
  const { error } = await supabase
    .from("estimation_leads")
    .insert({ ...lead, status: "new" });
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
