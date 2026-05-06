import { useState, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  UserCircle, Camera, Globe, Phone, MapPin,
  CheckCircle2, Loader2, AlertCircle, ExternalLink, Lock,
} from "lucide-react";
import { PortalLayout } from "@/components/espace-agent/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  updatePortalAgentProfile, uploadPortalAgentPhoto, uploadPortalAgencyLogo,
  MOROCCAN_CITIES,
} from "@/lib/agent-portal";

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      {children}
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ""}`}
    />
  );
}

export default function PortalProfilPage() {
  const { user, agent } = useAuth();

  const [bio, setBio] = useState(agent?.bio ?? "");
  const [telephone, setTelephone] = useState(agent?.telephone ?? "");
  const [ville, setVille] = useState(agent?.ville ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const logoRef  = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !agent) return;
      const updates: Parameters<typeof updatePortalAgentProfile>[1] = { bio, telephone, ville };
      if (photoFile) {
        updates.photo_url = await uploadPortalAgentPhoto(photoFile, agent.id);
      }
      if (logoFile) {
        updates.logo_agence_url = await uploadPortalAgencyLogo(logoFile, agent.id);
      }
      await updatePortalAgentProfile(user.id, updates);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "logo") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") { setPhotoFile(file); setPhotoPreview(url); }
    else { setLogoFile(file); setLogoPreview(url); }
  }

  const publicProfileUrl = agent?.slug ? `/agents/${agent.slug}` : null;
  const currentPhoto = photoPreview ?? agent?.photo_url;
  const currentLogo  = logoPreview ?? agent?.logo_agence_url;
  const initials     = agent ? `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase() : "?";

  return (
    <PortalLayout title="Mon profil">
      <div className="space-y-8 max-w-2xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ces informations apparaissent sur votre profil public WeHome.
          </p>
        </motion.div>

        {/* Public profile preview link */}
        {publicProfileUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Votre profil public</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visible sur wehome.ma/agents/{agent?.slug}
              </p>
            </div>
            <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0">
              Voir <ExternalLink size={14} />
            </a>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white border border-border rounded-3xl overflow-hidden">

          {/* Avatar section */}
          <div className="flex items-center gap-6 p-6 pb-5 border-b border-border">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md"
                style={{ background: "#8B1A2E" }}>
                {currentPhoto ? (
                  <img src={currentPhoto} alt={initials} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <button onClick={() => photoRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary/90 transition-colors">
                <Camera size={13} />
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handlePhotoSelect(e, "photo")} />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-foreground">
                {agent?.prenom} {agent?.nom}
              </p>
              <p className="text-sm text-muted-foreground">{agent?.nom_agence ?? "Agent WeHome"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{agent?.email}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="p-6 space-y-5">
            <Field label="Bio (max 200 caractères)">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                maxLength={200} rows={3}
                placeholder="Spécialiste de l'immobilier résidentiel à Casablanca depuis 8 ans…"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">{bio.length}/200</p>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Téléphone">
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+212 6XX XXX XXX" className="pl-10" />
                </div>
              </Field>

              <Field label="Ville principale">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select value={ville} onChange={(e) => setVille(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm appearance-none transition-all">
                    <option value="">Sélectionner</option>
                    {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </Field>
            </div>

            {/* Read-only fields */}
            <div className="space-y-4 pt-2 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Lock size={12} />
                Champs non modifiables (contact WeHome)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom complet">
                  <Input value={`${agent?.prenom ?? ""} ${agent?.nom ?? ""}`} disabled />
                </Field>
                <Field label="Email">
                  <Input value={agent?.email ?? ""} disabled />
                </Field>
                <Field label="Agence">
                  <Input value={agent?.nom_agence ?? "—"} disabled />
                </Field>
                <Field label="Plan">
                  <Input value={agent?.abonnement ? `${agent.abonnement.charAt(0).toUpperCase()}${agent.abonnement.slice(1)} · ${agent.listings_limit ?? 5} biens max` : "Essai"} disabled />
                </Field>
              </div>
            </div>

            {/* Agency logo */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-3">
                Logo de l'agence
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Globe size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <button onClick={() => logoRef.current?.click()}
                    className="text-sm font-semibold text-primary hover:underline">
                    {currentLogo ? "Changer le logo" : "Uploader un logo"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-0.5">PNG transparent recommandé</p>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handlePhotoSelect(e, "logo")} />
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="px-6 pb-6 flex items-center justify-between">
            {mutation.isError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={15} />
                Erreur lors de la sauvegarde.
              </div>
            )}
            {saved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 size={15} />
                Profil mis à jour !
              </motion.div>
            )}
            {!mutation.isError && !saved && <span />}

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white ml-auto disabled:opacity-60 hover:-translate-y-0.5 transition-all"
              style={{ background: "#C0392B" }}
            >
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Sauvegarder
            </button>
          </div>
        </motion.div>

        {/* Account info card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white border border-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Informations du compte</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Rôle", agent?.role === "agent_partenaire" ? "Agent Partenaire" : agent?.role ?? "—"],
              ["Statut", agent?.statut === "actif" ? "✅ Actif" : agent?.statut ?? "—"],
              ["Membre depuis", agent?.created_at ? new Date(agent.created_at).toLocaleDateString("fr-MA", { month: "long", year: "numeric" }) : "—"],
              ["Activation", agent?.date_activation ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-muted-foreground">{k}</p>
                <p className="font-semibold text-foreground">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Pour modifier votre nom, votre agence ou votre plan, contactez l'équipe WeHome :{" "}
              <a href="mailto:contact@wehome.ma" className="text-primary hover:underline">contact@wehome.ma</a>
            </p>
          </div>
        </motion.div>

      </div>
    </PortalLayout>
  );
}
