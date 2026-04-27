import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, CheckCircle, Upload, X, Building2, Star } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAgentPropertyById,
  createAgentProperty,
  updateAgentProperty,
  uploadPropertyPhoto,
  PROPERTY_TYPES,
  type AgentProperty,
} from "@/lib/data";

const TRANSACTION_TYPES = ["Vente", "Location"];
const STATUT_TYPES = ["Actif", "Inactif", "Vendu", "Loué"];
const FEATURES_LIST = ["Parking", "Piscine", "Ascenseur", "Gardien", "Terrasse", "Climatisation", "Jardin", "Cave", "Balcon", "Vue mer"];

export default function DashboardPropertyEditPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { agent } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = params.id === "new";

  // Fetch existing property directly by ID when editing
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["my-property", params.id, agent?.id],
    queryFn: () => fetchAgentPropertyById(params.id, agent!.id),
    enabled: !!agent?.id && !isNew,
  });

  // Form state
  const [titre, setTitre] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [prix, setPrix] = useState("");
  const [type, setType] = useState("Appartement");
  const [transaction, setTransaction] = useState("Vente");
  const [surface, setSurface] = useState("");
  const [chambres, setChambres] = useState("");
  const [salons, setSalons] = useState("");
  const [sallesDeBain, setSallesDeBain] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("Actif");
  const [meuble, setMeuble] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  // Photo state: track existing URLs and new File objects separately
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]); // already-uploaded URLs
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate form when existing property loads
  useEffect(() => {
    if (!existing) return;
    setTitre(existing.titre ?? "");
    setAdresse(existing.adresse ?? "");
    setVille(existing.ville ?? "");
    setPrix(existing.prix ?? "");
    setType(existing.type ?? "Appartement");
    setTransaction(existing.transaction ?? "Vente");
    setSurface(existing.surface_construite ?? "");
    setChambres(existing.chambres?.toString() ?? "");
    setSalons(existing.salons?.toString() ?? "");
    setSallesDeBain(existing.salles_de_bains?.toString() ?? "");
    setDescription(existing.description ?? "");
    setStatut(existing.statut ?? (existing.actif !== false ? "Actif" : "Inactif"));
    setMeuble(existing.meuble ?? false);
    setFeatures(existing.features ?? []);
    // All photos from DB go into existingPhotos
    const allExisting = [
      ...(existing.photo_principale ? [existing.photo_principale] : []),
      ...(existing.photos ?? []),
    ].filter(Boolean);
    setExistingPhotos(allExisting);
  }, [existing?.id]);

  const toggleFeature = (f: string) =>
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewPhotoFiles((prev) => [...prev, ...files]);
    setNewPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeExistingPhoto = (i: number) =>
    setExistingPhotos((prev) => prev.filter((_, j) => j !== i));

  const removeNewPhoto = (i: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, j) => j !== i));
    setNewPhotoPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  // All photos for display: existing first, then new previews
  const allPreviews = [
    ...existingPhotos.map((url) => ({ url, isNew: false, index: -1 })),
    ...newPhotoPreviews.map((url, i) => ({ url, isNew: true, index: i })),
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    setSaving(true);
    setError("");
    try {
      const payload: Partial<AgentProperty> = {
        titre: titre || undefined,
        adresse: adresse || undefined,
        ville: ville || undefined,
        prix: prix || undefined,
        type,
        transaction,
        surface_construite: surface || undefined,
        chambres: chambres ? Number(chambres) : undefined,
        salons: salons ? Number(salons) : undefined,
        salles_de_bains: sallesDeBain ? Number(sallesDeBain) : undefined,
        description: description || undefined,
        actif: statut === "Actif",
        statut,
        meuble,
        features: features.length > 0 ? features : undefined,
      };

      let savedId = isNew ? "" : params.id;

      if (isNew) {
        const created = await createAgentProperty(agent.id, payload);
        savedId = created.id;
      } else {
        await updateAgentProperty(params.id, agent.id, payload);
      }

      // Upload new photos and merge with existing
      let uploadedUrls: string[] = [];
      if (newPhotoFiles.length > 0 && savedId) {
        uploadedUrls = await Promise.all(
          newPhotoFiles.map((f, i) => uploadPropertyPhoto(f, savedId, existingPhotos.length + i))
        );
      }

      const allPhotos = [...existingPhotos, ...uploadedUrls];
      const [photo_principale, ...rest] = allPhotos;

      if (allPhotos.length > 0 && savedId) {
        await updateAgentProperty(savedId, agent.id, {
          photo_principale: photo_principale ?? undefined,
          photos: rest.length > 0 ? rest : undefined,
        });
      }

      qc.invalidateQueries({ queryKey: ["my-properties", agent.id] });
      qc.invalidateQueries({ queryKey: ["my-property", params.id, agent.id] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["property", savedId] });

      setSaved(true);
      setTimeout(() => navigate("/dashboard/proprietes"), 1200);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && loadingExisting) {
    return (
      <DashboardLayout title="Modifier">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isNew ? "Nouveau bien" : "Modifier"}>
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/proprietes")}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{isNew ? "Ajouter un bien" : "Modifier le bien"}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{isNew ? "Créez une nouvelle annonce." : "Mettez à jour les informations."}</p>
          </div>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Informations principales */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Informations principales</h2>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Titre de l'annonce *</label>
              <input type="text" required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Villa avec piscine à Ain Diab..."
                className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Adresse / Quartier</label>
                <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Maarif, Ain Diab..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Ville</label>
                <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Casablanca"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Type de bien</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none">
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Transaction</label>
                <select value={transaction} onChange={(e) => setTransaction(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none">
                  {TRANSACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Prix (MAD)</label>
              <input type="text" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="Ex: 1500000"
                className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
            </div>
          </motion.div>

          {/* Caractéristiques */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Caractéristiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Surface (m²)</label>
                <input type="text" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="120"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Chambres</label>
                <input type="number" min={0} value={chambres} onChange={(e) => setChambres(e.target.value)} placeholder="3"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Salons</label>
                <input type="number" min={0} value={salons} onChange={(e) => setSalons(e.target.value)} placeholder="1"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Salles de bain</label>
                <input type="number" min={0} value={sallesDeBain} onChange={(e) => setSallesDeBain(e.target.value)} placeholder="2"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
            </div>

            {/* Meublé toggle */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMeuble(!meuble)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${meuble ? "bg-primary" : "bg-border"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${meuble ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm font-medium text-foreground">Meublé</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Décrivez le bien en détail..."
                className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none" />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Statut de publication</label>
              <div className="flex gap-2 flex-wrap">
                {STATUT_TYPES.map((s) => (
                  <button key={s} type="button" onClick={() => setStatut(s)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      statut === s ? "bg-primary text-white border-primary shadow-md" : "bg-secondary border-border/60 text-foreground/70 hover:border-primary/40"
                    }`}>{s}</button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Équipements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Équipements</h2>
            <div className="flex flex-wrap gap-2">
              {FEATURES_LIST.map((f) => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    features.includes(f) ? "bg-primary text-white border-primary shadow-md" : "bg-secondary border-border/60 text-foreground/70 hover:border-primary/40"
                  }`}>{f}</button>
              ))}
            </div>
          </motion.div>

          {/* Photos */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Photos</h2>
              <span className="text-xs text-muted-foreground">{allPreviews.length} photo{allPreviews.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {allPreviews.map((item, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary group/photo">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => item.isNew ? removeNewPhoto(item.index) : removeExistingPhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-semibold">
                      <Star size={8} className="fill-white" />Principale
                    </span>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Upload size={20} />
                <span className="text-[10px] font-semibold">Ajouter</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
            <p className="text-xs text-muted-foreground mt-3">La première photo sera la photo principale de l'annonce.</p>
          </motion.div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/dashboard/proprietes")}
              className="px-6 py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground/70 hover:bg-secondary transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving || saved}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-lg shadow-primary/20">
              {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saving ? "Sauvegarde..." : saved ? "Publié !" : isNew ? "Publier le bien" : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
