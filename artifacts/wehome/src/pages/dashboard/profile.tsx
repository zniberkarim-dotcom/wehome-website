import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Phone, FileText, Camera, Loader2, CheckCircle, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { updateAgentProfile, uploadAgentPhoto } from "@/lib/data";

const SPECIALITES = ["Luxe", "Investissement", "Commercial", "Résidentiel", "Industriel", "Terrain"];

export default function DashboardProfilePage() {
  const { user, agent } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nom, setNom] = useState(agent?.nom ?? "");
  const [prenom, setPrenom] = useState(agent?.prenom ?? "");
  const [telephone, setTelephone] = useState(agent?.telephone ?? "");
  const [bio, setBio] = useState(agent?.bio ?? "");
  const [specialites, setSpecialites] = useState<string[]>(agent?.specialites ?? []);
  const [photoPreview, setPhotoPreview] = useState<string | null>(agent?.photo_url ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setNom(agent.nom); setPrenom(agent.prenom);
      setTelephone(agent.telephone ?? ""); setBio(agent.bio ?? "");
      setSpecialites(agent.specialites ?? []);
      setPhotoPreview(agent.photo_url ?? null);
    }
  }, [agent?.id]);

  const toggleSpecialite = (s: string) =>
    setSpecialites((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agent) return;
    setSaving(true); setError("");
    try {
      let photo_url = agent.photo_url;
      if (photoFile) photo_url = await uploadAgentPhoto(photoFile, agent.id);
      await updateAgentProfile(user.id, { nom, prenom, telephone, bio, specialites, photo_url });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Mon Profil">
      <div className="max-w-2xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">Mon profil agent</h1>
          <p className="text-muted-foreground mt-1">Ces informations apparaîtront sur votre profil public.</p>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-foreground/70 mb-4 uppercase tracking-wider">Photo de profil</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-secondary shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: "#8B1A2E" }}>
                      {prenom.charAt(0)}{nom.charAt(0)}
                    </div>}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </button>
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-primary/10 border border-border/60 text-sm font-semibold transition-colors">
                  Changer la photo
                </button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG — Max 5 MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </motion.div>

          {/* Infos */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Prénom</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Nom</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Téléphone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 XX XX XX XX"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Bio</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-3.5 text-muted-foreground" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                  placeholder="Décrivez votre expertise, vos zones de prédilection..."
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none" />
              </div>
            </div>
          </motion.div>

          {/* Spécialités */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-foreground/70 mb-4 uppercase tracking-wider">Spécialités</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALITES.map((s) => (
                <button key={s} type="button" onClick={() => toggleSpecialite(s)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    specialites.includes(s) ? "bg-primary text-white border-primary shadow-md" : "bg-secondary border-border/60 text-foreground/70 hover:border-primary/40"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-lg shadow-primary/20">
            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
            {saving ? "Sauvegarde..." : saved ? "Sauvegardé !" : "Sauvegarder"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
