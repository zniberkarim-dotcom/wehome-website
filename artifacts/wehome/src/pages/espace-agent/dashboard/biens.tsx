import { useState, useRef } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Building2, Eye, Edit2, Archive, X, Upload,
  ChevronDown, AlertCircle, CheckCircle2, Loader2, ExternalLink,
} from "lucide-react";
import { PortalLayout } from "@/components/espace-agent/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchPortalProperties, createPortalProperty, archivePortalProperty,
  uploadPortalPropertyPhoto, type PortalProperty,
} from "@/lib/agent-portal";
import { PROPERTY_TYPES } from "@/lib/data";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  actif:                   "bg-green-100 text-green-700 border-green-200",
  en_attente_validation:   "bg-amber-100 text-amber-700 border-amber-200",
  rejeté:                  "bg-red-100 text-red-700 border-red-200",
  archivé:                 "bg-gray-100 text-gray-500 border-gray-200",
};
const STATUS_LABELS: Record<string, string> = {
  actif:                   "✅ Publié",
  en_attente_validation:   "⏳ En attente",
  rejeté:                  "❌ Rejeté",
  archivé:                 "⬛ Archivé",
};

function StatusBadge({ statut }: { statut: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[statut] ?? "bg-muted text-muted-foreground border-border"}`}>
      {STATUS_LABELS[statut] ?? statut}
    </span>
  );
}

// ── New bien form (modal) ─────────────────────────────────────────────────────

interface NewBienForm {
  titre: string; type: string; transaction: string;
  adresse: string; ville: string; prix: string;
  surface_construite: string; chambres: number; salles_de_bains: number;
  salons: number; description: string; meuble: boolean;
  mandat_signe: boolean; photos: string[];
}

const INITIAL_FORM: NewBienForm = {
  titre: "", type: "Appartement", transaction: "Vente",
  adresse: "", ville: "", prix: "",
  surface_construite: "", chambres: 0, salles_de_bains: 0,
  salons: 0, description: "", meuble: false,
  mandat_signe: false, photos: [],
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all ${props.className ?? ""}`}
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2.5 pr-9 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all">
        {children}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function NewBienModal({ agentId, onClose, onSuccess }: {
  agentId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState<NewBienForm>(INITIAL_FORM);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      // Upload photos first
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const url = await uploadPortalPropertyPhoto(file, agentId);
        uploadedUrls.push(url);
      }
      setUploading(false);
      // Create property
      await createPortalProperty(agentId, {
        ...form,
        photos: uploadedUrls,
        photo_principale: uploadedUrls[0],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-properties"] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setUploading(false);
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    },
  });

  function set<K extends keyof NewBienForm>(key: K, value: NewBienForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre est requis."); return; }
    if (!form.adresse.trim()) { setError("Le quartier/adresse est requis."); return; }
    if (!form.prix) { setError("Le prix est requis."); return; }
    if (!form.mandat_signe) { setError("Vous devez confirmer avoir un mandat signé."); return; }
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-border sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Publier un nouveau bien</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Soumis à validation WeHome avant publication
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Field label="Titre de l'annonce" required>
            <Input value={form.titre} onChange={(e) => set("titre", e.target.value)}
              placeholder="Appartement lumineux, vue mer — Ain Diab" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de bien" required>
              <Select value={form.type} onChange={(v) => set("type", v)}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Transaction" required>
              <Select value={form.transaction} onChange={(v) => set("transaction", v)}>
                <option value="Vente">Vente</option>
                <option value="Location">Location</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quartier / Adresse" required>
              <Input value={form.adresse} onChange={(e) => set("adresse", e.target.value)}
                placeholder="Maarif, Ain Diab…" />
            </Field>
            <Field label="Ville" required>
              <Input value={form.ville} onChange={(e) => set("ville", e.target.value)}
                placeholder="Casablanca" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix (MAD)" required>
              <Input type="number" value={form.prix}
                onChange={(e) => set("prix", e.target.value)} placeholder="1 200 000" />
            </Field>
            <Field label="Surface (m²)">
              <Input type="number" value={form.surface_construite}
                onChange={(e) => set("surface_construite", e.target.value)} placeholder="85" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Chambres">
              <Input type="number" min={0} value={form.chambres}
                onChange={(e) => set("chambres", Number(e.target.value))} />
            </Field>
            <Field label="Salles de bain">
              <Input type="number" min={0} value={form.salles_de_bains}
                onChange={(e) => set("salles_de_bains", Number(e.target.value))} />
            </Field>
            <Field label="Salons">
              <Input type="number" min={0} value={form.salons}
                onChange={(e) => set("salons", Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} placeholder="Décrivez le bien, ses points forts, l'environnement…"
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none transition-all" />
          </Field>

          {/* Photos */}
          <Field label="Photos">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={handlePhotos} />
            <div className="flex flex-wrap gap-2 mb-2">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => {
                      setPhotoPreviews((prev) => prev.filter((_, j) => j !== i));
                      setPhotoFiles((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Upload size={18} />
                <span className="text-[10px] font-medium">Ajouter</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Photos professionnelles requises pour validation.</p>
          </Field>

          {/* Toggles */}
          <div className="flex items-center justify-between py-1">
            <label className="text-sm font-medium text-foreground cursor-pointer">Bien meublé</label>
            <button type="button"
              onClick={() => set("meuble", !form.meuble)}
              className={`w-11 h-6 rounded-full transition-colors ${form.meuble ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.meuble ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {/* Mandat checkbox — required */}
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50">
            <div className="mt-0.5">
              <input type="checkbox" checked={form.mandat_signe}
                onChange={(e) => set("mandat_signe", e.target.checked)} className="sr-only" />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.mandat_signe ? "bg-primary border-primary" : "border-amber-400"}`}>
                {form.mandat_signe && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </div>
            <p className="text-sm text-amber-900">
              <strong>Mandat signé :</strong> Je confirme avoir un mandat de vente/location signé avec le propriétaire pour ce bien.
            </p>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ background: "#C0392B" }}>
              {(mutation.isPending || uploading) && <Loader2 size={16} className="animate-spin" />}
              Soumettre pour validation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PortalBiensPage() {
  const { agent } = useAuth();
  const [showNewModal, setShowNewModal] = useState(false);
  const qc = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["portal-properties", agent?.id],
    queryFn: () => fetchPortalProperties(agent!.id),
    enabled: !!agent?.id,
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => archivePortalProperty(id, agent!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-properties"] }),
  });

  const activeCount = properties.filter((p) => p.portal_statut === "actif").length;
  const limit = agent?.listings_limit ?? 5;

  return (
    <PortalLayout title="Mes biens">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Mes biens</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} actif{activeCount !== 1 ? "s" : ""} · {limit - activeCount} slot{limit - activeCount !== 1 ? "s" : ""} disponible{limit - activeCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            disabled={activeCount >= limit}
            title={activeCount >= limit ? "Limite de votre plan atteinte" : undefined}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
            style={{ background: "#C0392B" }}
          >
            <Plus size={18} />
            Publier un bien
          </button>
        </div>

        {/* Quota bar */}
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-foreground">Quota du plan {agent?.abonnement ?? "essai"}</span>
            <span className="text-muted-foreground">{activeCount} / {limit}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${Math.min((activeCount / limit) * 100, 100)}%`, background: activeCount >= limit ? "#e53e3e" : "#C0392B" }}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-border rounded-3xl py-20 text-center">
            <Building2 size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-display font-bold text-foreground mb-2">Aucun bien pour l'instant</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Soumettez votre premier listing pour commencer à recevoir des leads qualifiés.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "#C0392B" }}
            >
              <Plus size={17} />
              Publier mon premier bien
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-muted shrink-0 overflow-hidden">
                    {p.photo_principale
                      ? <img src={p.photo_principale} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Building2 size={22} className="text-muted-foreground" /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-semibold text-foreground text-sm truncate">{p.titre ?? "Sans titre"}</p>
                      <StatusBadge statut={p.portal_statut ?? "actif"} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.type} · {p.adresse ?? p.ville ?? "—"} ·{" "}
                      {p.prix ? `${Number(p.prix).toLocaleString("fr-MA")} MAD` : "—"}
                    </p>
                    {p.portal_statut === "rejeté" && p.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {p.rejection_reason}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Eye size={13} />{p.views_count ?? 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {p.portal_statut === "actif" && (
                      <Link href={`/bien/${p.id}`} target="_blank">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Voir sur le site">
                          <ExternalLink size={15} />
                        </button>
                      </Link>
                    )}
                    {(p.portal_statut === "actif" || p.portal_statut === "en_attente_validation") && (
                      <button
                        onClick={() => { if (confirm("Archiver ce bien ?")) archiveMutation.mutate({ id: p.id! }); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                        title="Archiver"
                      >
                        <Archive size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New bien modal */}
      <AnimatePresence>
        {showNewModal && agent && (
          <NewBienModal
            agentId={agent.id}
            onClose={() => setShowNewModal(false)}
            onSuccess={() => setShowNewModal(false)}
          />
        )}
      </AnimatePresence>
    </PortalLayout>
  );
}
