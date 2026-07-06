import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import {
  registerPortalAgent,
  portalSignIn,
  fetchPortalAgent,
  updatePortalAgentProfile,
  uploadPortalAgentPhoto,
  uploadPortalAgencyLogo,
  MOROCCAN_CITIES,
} from "@/lib/agent-portal";

// ── Step variants ─────────────────────────────────────────────────────────────
const VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -36 : 36 }),
};

// ── Field component ───────────────────────────────────────────────────────────
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InscriptionPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  // Step 1 fields
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Step 2 fields
  const [nomAgence, setNomAgence] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3 fields
  const [accepted, setAccepted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  function goNext() {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!prenom.trim()) newErrors.prenom = "Requis";
      if (!nom.trim()) newErrors.nom = "Requis";
      if (!email.trim() || !email.includes("@")) newErrors.email = "Email invalide";
      if (!telephone.trim()) newErrors.telephone = "Requis";
      if (!ville) newErrors.ville = "Requis";
      if (password.length < 8) newErrors.password = "8 caractères minimum";
      if (password !== confirmPwd) newErrors.confirmPwd = "Les mots de passe ne correspondent pas";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setDir(1);
    setStep(step + 1);
  }

  function goBack() {
    setDir(-1);
    setStep(step - 1);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "logo") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") {
      setPhotoFile(file);
      setPhotoPreview(url);
    } else {
      setLogoFile(file);
      setLogoPreview(url);
    }
  }

  async function handleSubmit() {
    if (!accepted) {
      setErrors({ accepted: "Requis" });
      return;
    }
    setLoading(true);
    setGlobalError(null);
    try {
      // First register (creates auth user + agent row without photo)
      await registerPortalAgent({
        prenom,
        nom,
        email,
        telephone,
        ville,
        password,
        nom_agence: nomAgence || "Indépendant",
        bio,
      });

      // Upload photos if provided (need agent id — sign in to get it)
      const authData = await portalSignIn(email, password);
      const agent = await fetchPortalAgent(authData.user.id);

      if (agent) {
        const updates: { photo_url?: string; logo_agence_url?: string } = {};
        if (photoFile) {
          updates.photo_url = await uploadPortalAgentPhoto(photoFile, agent.id);
        }
        if (logoFile) {
          updates.logo_agence_url = await uploadPortalAgencyLogo(logoFile, agent.id);
        }
        if (Object.keys(updates).length > 0) {
          await updatePortalAgentProfile(authData.user.id, updates);
        }
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already exists")
      ) {
        setGlobalError("Un compte existe déjà avec cet email. Connectez-vous.");
      } else {
        setGlobalError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-border rounded-3xl p-10 text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">
            Votre demande est envoyée ✓
          </h1>
          <p className="text-muted-foreground mb-2">
            Notre équipe examine votre profil et vous contacte sous 48h pour activer votre accès.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Vous recevrez un email à <strong>{email}</strong> dès que votre compte est activé.
          </p>
          <div className="space-y-3">
            <Link
              href="/espace-agent"
              className="block w-full py-3.5 rounded-xl font-bold text-white text-center"
              style={{ background: "#C0392B" }}
            >
              Découvrir WeHome
            </Link>
            <Link
              href="/espace-agent/login"
              className="block w-full py-3 rounded-xl font-semibold text-sm text-foreground/70 hover:text-foreground border border-border text-center transition-colors"
            >
              Me connecter quand activé
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Progress bar ────────────────────────────────────────────────────────────
  const STEP_LABELS = ["Votre identité", "Votre agence", "Confirmation"];

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/espace-agent">
            <Logo height={34} className="mx-auto" />
          </Link>
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary/70 mt-2">
            Devenir Agent Partenaire
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-1">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s ? "text-white" : "bg-muted text-muted-foreground"
                    }`}
                    style={step >= s ? { background: "#C0392B" } : {}}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${step === s ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-all ${step > s ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="p-8"
            >
              {/* ── Step 1 ──────────────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">
                    Votre identité
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Informations de connexion et de contact.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Prénom" error={errors.prenom}>
                      <Input
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Karim"
                      />
                    </Field>
                    <Field label="Nom" error={errors.nom}>
                      <Input
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Benali"
                      />
                    </Field>
                  </div>

                  <Field label="Email professionnel" error={errors.email}>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@agence.ma"
                    />
                  </Field>

                  <Field label="Téléphone" error={errors.telephone}>
                    <Input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </Field>

                  <Field label="Ville principale d'activité" error={errors.ville}>
                    <select
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Mot de passe" error={errors.password}>
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8 caractères minimum"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmer le mot de passe" error={errors.confirmPwd}>
                    <Input
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>
                </div>
              )}

              {/* ── Step 2 ──────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">
                    Votre agence
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Présentez-vous aux futurs acheteurs WeHome.
                  </p>

                  <Field label="Nom de l'agence (ou Indépendant)">
                    <Input
                      value={nomAgence}
                      onChange={(e) => setNomAgence(e.target.value)}
                      placeholder="Agence Immo Casablanca"
                    />
                  </Field>

                  <Field label={`Bio courte (${bio.length}/200)`}>
                    <Textarea
                      rows={3}
                      maxLength={200}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Spécialiste de l'immobilier à Casablanca depuis 8 ans…"
                    />
                  </Field>

                  {/* Photo upload */}
                  <Field label="Photo de profil (optionnel)">
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoChange(e, "photo")}
                    />
                    <div
                      onClick={() => photoRef.current?.click()}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors group"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload size={22} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {photoPreview ? "Changer la photo" : "Uploader une photo"}
                        </p>
                        <p className="text-xs text-muted-foreground">JPG, PNG — max 5 MB</p>
                      </div>
                    </div>
                  </Field>

                  {/* Logo upload */}
                  <Field label="Logo de l'agence (optionnel)">
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoChange(e, "logo")}
                    />
                    <div
                      onClick={() => logoRef.current?.click()}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors group"
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt=""
                          className="w-14 h-14 rounded-xl object-contain bg-muted"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload size={22} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {logoPreview ? "Changer le logo" : "Uploader un logo"}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG transparent recommandé</p>
                      </div>
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Step 3 ──────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">
                    Confirmation
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Vérifiez vos informations avant d'envoyer.
                  </p>

                  {/* Summary */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3 text-sm">
                    {[
                      ["Nom", `${prenom} ${nom}`],
                      ["Email", email],
                      ["Téléphone", telephone],
                      ["Ville", ville],
                      ["Agence", nomAgence || "Indépendant"],
                      ["Bio", bio || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">{k}</span>
                        <span className="font-medium text-foreground text-right truncate">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Agreement */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          accepted ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {accepted && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      J'accepte les{" "}
                      <Link href="/espace-agent" className="text-primary hover:underline">
                        conditions du réseau WeHome
                      </Link>{" "}
                      et m'engage à respecter les standards de qualité (biens vérifiés, mandats
                      signés, photos professionnelles).
                    </p>
                  </label>
                  {errors.accepted && <p className="text-xs text-red-500">{errors.accepted}</p>}

                  {globalError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      {globalError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer buttons */}
          <div className="px-8 pb-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            ) : (
              <Link
                href="/espace-agent/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Déjà inscrit ? Se connecter
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white ml-auto"
                style={{ background: "#C0392B" }}
              >
                Continuer <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !accepted}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white ml-auto disabled:opacity-60"
                style={{ background: "#C0392B" }}
              >
                {loading && <Loader2 size={17} className="animate-spin" />}
                Soumettre ma demande
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
