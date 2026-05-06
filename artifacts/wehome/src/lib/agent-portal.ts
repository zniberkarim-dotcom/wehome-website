import { supabase } from "./supabase";
import type { Agent, AgentProperty } from "./data";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PortalLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  property_reference?: string;
  agent_id?: string;
  statut_lead?: "nouveau" | "contacté" | "visite_planifiée" | "sans_suite";
  created_at: string;
}

export interface PortalProperty extends AgentProperty {
  portal_statut?: "actif" | "en_attente_validation" | "rejeté" | "archivé";
  rejection_reason?: string;
  views_count?: number;
  mandat_signe?: boolean;
  reference?: string;
  created_at?: string;
}

export interface RegistrationData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  password: string;
  nom_agence: string;
  bio: string;
  photo_url?: string;
  logo_agence_url?: string;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

function generateSlug(prenom: string, nom: string): string {
  return `${prenom}-${nom}-partenaire`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function registerPortalAgent(data: RegistrationData): Promise<void> {
  // 1. Sign up via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { nom: data.nom, prenom: data.prenom },
    },
  });
  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("Échec de la création du compte.");

  const slug = generateSlug(data.prenom, data.nom);

  // 2. Create agent row (portal agent — pending until Kai activates)
  const { error: agentError } = await supabase.from("agents").upsert(
    {
      user_id: userId,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone,
      ville: data.ville,
      nom_agence: data.nom_agence || "Indépendant",
      bio: data.bio || null,
      photo_url: data.photo_url || null,
      logo_agence_url: data.logo_agence_url || null,
      role: "agent_partenaire",
      statut: "pending",
      actif: false,
      abonnement: "essai",
      listings_limit: 5,
      slug,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );
  if (agentError) throw agentError;
}

export async function portalSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function portalSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function portalResetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/espace-agent/reset-password`,
  });
  if (error) throw error;
}

// ── Agent data ────────────────────────────────────────────────────────────────

export async function fetchPortalAgent(userId: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data as Agent;
}

export async function updatePortalAgentProfile(
  userId: string,
  updates: {
    bio?: string;
    telephone?: string;
    ville?: string;
    photo_url?: string;
    logo_agence_url?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("agents")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Properties ────────────────────────────────────────────────────────────────

export async function fetchPortalProperties(agentId: string): Promise<PortalProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PortalProperty[];
}

export async function createPortalProperty(
  agentId: string,
  props: Partial<PortalProperty>
): Promise<PortalProperty> {
  const row = {
    agent_id: agentId,
    titre: props.titre ?? "",
    type: props.type ?? "Appartement",
    transaction: props.transaction ?? "Vente",
    neighborhood: props.adresse ?? "",
    ville: props.ville ?? "",
    price: props.prix ?? "0",
    surface_construite: props.surface_construite ?? "0",
    chambres: props.chambres ?? 0,
    salles_de_bains: props.salles_de_bains ?? 0,
    salons: props.salons ?? 0,
    description: props.description ?? "",
    photo_principale: props.photo_principale ?? null,
    photos: props.photos ?? [],
    meuble: props.meuble ?? false,
    features: props.features ?? [],
    mandat_signe: props.mandat_signe ?? false,
    portal_statut: "en_attente_validation",
    published: false,
    photo_status: "⏳ En attente",
    reference: `WHP-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("properties").insert(row).select().single();
  if (error) throw error;
  return data as PortalProperty;
}

export async function updatePortalProperty(
  propertyId: string,
  agentId: string,
  updates: Partial<PortalProperty>
): Promise<void> {
  // Build update row (explicit mapping)
  const row: Record<string, unknown> = {};
  if (updates.titre !== undefined) row.titre = updates.titre;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.transaction !== undefined) row.transaction = updates.transaction;
  if (updates.adresse !== undefined) row.neighborhood = updates.adresse;
  if (updates.ville !== undefined) row.ville = updates.ville;
  if (updates.prix !== undefined) row.price = updates.prix;
  if (updates.surface_construite !== undefined) row.surface_construite = updates.surface_construite;
  if (updates.chambres !== undefined) row.chambres = updates.chambres;
  if (updates.salles_de_bains !== undefined) row.salles_de_bains = updates.salles_de_bains;
  if (updates.salons !== undefined) row.salons = updates.salons;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.photo_principale !== undefined) row.photo_principale = updates.photo_principale;
  if (updates.photos !== undefined) row.photos = updates.photos;
  if (updates.meuble !== undefined) row.meuble = updates.meuble;
  if (updates.features !== undefined) row.features = updates.features;

  const { error } = await supabase
    .from("properties")
    .update(row)
    .eq("id", propertyId)
    .eq("agent_id", agentId);
  if (error) throw error;
}

export async function archivePortalProperty(
  propertyId: string,
  agentId: string
): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .update({ portal_statut: "archivé", published: false })
    .eq("id", propertyId)
    .eq("agent_id", agentId);
  if (error) throw error;
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchPortalLeads(agentId: string): Promise<PortalLead[]> {
  // Fetch leads tied to this agent's properties (via property_reference JOIN or agent_id)
  const { data: props } = await supabase
    .from("properties")
    .select("reference")
    .eq("agent_id", agentId);

  const refs = (props ?? []).map((p: { reference: string }) => p.reference).filter(Boolean);

  if (refs.length === 0) return [];

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .in("property_reference", refs)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortalLead[];
}

export async function updateLeadStatut(
  leadId: string,
  statut: PortalLead["statut_lead"]
): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ statut_lead: statut })
    .eq("id", leadId);
  if (error) throw error;
}

// ── Storage uploads ───────────────────────────────────────────────────────────

export async function uploadPortalAgentPhoto(
  file: File,
  agentId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `agents/${agentId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from("agent-photos")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("agent-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPortalAgencyLogo(
  file: File,
  agentId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `logos/${agentId}/logo.${ext}`;
  const { error } = await supabase.storage
    .from("agent-logos")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("agent-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPortalPropertyPhoto(
  file: File,
  agentId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `properties/${agentId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("agent-photos")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("agent-photos").getPublicUrl(path);
  return data.publicUrl;
}

// ── Performance stats ─────────────────────────────────────────────────────────

export interface PerformanceStats {
  totalBiens: number;
  biensActifs: number;
  totalLeads: number;
  leadsThisMonth: number;
  totalViews: number;
  conversionRate: number;
}

export async function fetchPerformanceStats(agentId: string): Promise<PerformanceStats> {
  const [propsRes, leadsRes] = await Promise.all([
    supabase.from("properties").select("id, portal_statut, views_count, created_at").eq("agent_id", agentId),
    fetchPortalLeads(agentId),
  ]);

  const props = propsRes.data ?? [];
  const leads = leadsRes;

  const totalBiens = props.length;
  const biensActifs = props.filter((p: { portal_statut: string }) => p.portal_statut === "actif").length;
  const totalViews = props.reduce((sum: number, p: { views_count?: number }) => sum + (p.views_count ?? 0), 0);
  const totalLeads = leads.length;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const leadsThisMonth = leads.filter((l) => l.created_at >= firstOfMonth).length;

  const conversionRate = totalViews > 0 ? Math.round((totalLeads / totalViews) * 100) : 0;

  return { totalBiens, biensActifs, totalLeads, leadsThisMonth, totalViews, conversionRate };
}

// ── Moroccan cities (for dropdowns) ──────────────────────────────────────────

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Salé", "Mohammedia",
  "El Jadida", "Béni Mellal", "Nador", "Settat", "Safi", "Laâyoune",
  "Khouribga", "Berrechid", "Khémisset",
];
