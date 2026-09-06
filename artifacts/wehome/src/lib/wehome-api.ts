/**
 * The WeHome API client — the site's only door to property data (ADR-015).
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * Until now the browser talked to PostgREST directly with the published anon
 * key, and every query was `select("*")`. That made the website a second
 * authority on what a valid read is, and shipped whole rows — owner names, an
 * owner phone, internal notes recording a seller's floor price, Drive and Canva
 * links — to anyone who opened the network tab.
 *
 * Public property reads now go through the CRM's `/api/v1/` endpoints, which
 * return an explicit projection and nothing else. The Operational Core decides
 * what is public; the site renders it.
 *
 * ── WHAT THIS FILE DOES *NOT* DO ────────────────────────────────────────────
 * It does not touch leads, agents, estimations or the agent portal. Those still
 * use Supabase directly and are later phases. The anon key therefore stays in
 * the bundle for now — this migration removes the site's public property reads,
 * not its credential.
 */

/**
 * The CRM origin. Overridable per environment; defaults to production so a
 * preview build without the variable set still renders real listings rather
 * than an empty catalogue.
 */
const API_BASE = (
  (import.meta.env.VITE_WEHOME_API_URL as string | undefined) ?? "https://crm.wehome.ma"
).replace(/\/+$/, "");

/**
 * The canonical public shape of a listing, as served by the API.
 *
 * This mirrors `PublicPropertyDTO` in the CRM. It is a transport type — the
 * site keeps its own `Property` for rendering, and `mapApiProperty` is the one
 * place the two meet. It is deliberately NOT a third definition of a listing:
 * nothing here invents a field, and every property is one the API sends.
 */
export interface ApiProperty {
  /** Internal UUID. Already public in `/bien/:id` URLs and saved favourites. */
  id: string | null;
  /** The canonical public key: WEH-CASA-VENTE-VIL-0031. */
  reference: string;
  type: string | null;
  transaction: string | null;
  /** Canonical city — the API has already folded the legacy `ville` into this. */
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  priceKind: "sale" | "rental";
  surface: number | null;
  surfaceConstruite: number | null;
  surfaceTerrain: number | null;
  furnished: "furnished" | "unfurnished" | "unknown";
  rooms: number | null;
  chambres: number | null;
  salons: number | null;
  sallesDeBains: number | null;
  orientation: string | null;
  etage: string | null;
  etageTotal: string | null;
  title: string | null;
  description: string | null;
  /** Cover shot already promoted to the head by the API. */
  photos: string[];
  features: string[];
  status: string | null;
  isPepite: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string | null;
  agent: { id: string | null; name: string | null } | null;
}

export interface ApiListResponse {
  data: ApiProperty[];
  pagination: { limit: number; offset: number; total: number | null };
}

export interface ApiListParams {
  transaction?: string;
  types?: string[];
  city?: string;
  agentId?: string;
  limit?: number;
  /** Pépite du Mois first, then newest — the homepage ordering. */
  pepiteFirst?: boolean;
}

function buildQuery(p: ApiListParams): string {
  const q = new URLSearchParams();
  if (p.transaction) q.set("transaction", p.transaction);
  for (const t of p.types ?? []) q.append("type", t);
  if (p.city) q.set("city", p.city);
  if (p.agentId) q.set("agentId", p.agentId);
  if (p.pepiteFirst) q.set("pepiteFirst", "true");
  // The catalogue is fetched whole and filtered client-side, because `price` is
  // TEXT in the database and cannot be range-filtered in SQL. 500 is the API's
  // ceiling; today's published inventory is 28.
  q.set("limit", String(p.limit ?? 500));
  return q.toString();
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`WeHome API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

/** Published listings, already gated by the API (published + photos + lifecycle). */
export async function apiFetchProperties(params: ApiListParams = {}): Promise<ApiProperty[]> {
  const res = await getJson<ApiListResponse>(`/api/v1/properties?${buildQuery(params)}`);
  return res.data;
}

/**
 * One listing, by public reference OR by UUID.
 *
 * Returns null on 404 rather than throwing: the callers — the detail page and
 * the favourites page — both treat "gone" as a normal outcome, and favourites
 * relies on it to prune entries whose listing has been unpublished.
 */
export async function apiFetchProperty(idOrReference: string): Promise<ApiProperty | null> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${encodeURIComponent(idOrReference)}`, {
    headers: { accept: "application/json" },
  });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`WeHome API ${res.status} on property ${idOrReference}`);
  const body = (await res.json()) as { data: ApiProperty };
  return body.data;
}
