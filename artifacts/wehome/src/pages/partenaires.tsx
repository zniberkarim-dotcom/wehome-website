import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Globe, Tag, ShieldCheck, ChevronDown, CheckCircle2, Loader2, ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitPartenairesWaitlist } from "@/lib/data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--primary, #8B1A2E)" }}>
      {children}
    </p>
  );
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "Est-ce que je garde mes commissions ?",
    a: "Oui. WeHome ne prend pas de commission sur vos transactions. Le modèle partenaire est basé sur un abonnement mensuel — les détails seront communiqués aux membres de la liste en priorité.",
  },
  {
    q: "Est-ce que mes concurrents voient mes listings ?",
    a: "Vos listings sont visibles aux acheteurs sur la plateforme. Les autres agences voient les biens disponibles mais pas vos contacts clients. C'est exactement le modèle MLS — la transparence au service du marché, pas de la concurrence.",
  },
  {
    q: "Dans quelles villes le réseau sera-t-il disponible ?",
    a: "Le lancement commence à Casablanca, Rabat, Marrakech et Tanger. L'expansion nationale suit selon la demande des partenaires.",
  },
  {
    q: "Quand le réseau sera-t-il lancé ?",
    a: "Nous ciblons un lancement réseau dans les 12 prochains mois. Les agences sur liste d'attente seront les premières informées et bénéficieront de conditions préférentielles.",
  },
];

const VILLES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir",
  "Fès", "Meknès", "Oujda", "Kénitra", "Témara", "Autre",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartenairesPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Form state
  const [nom, setNom] = useState("");
  const [nomAgence, setNomAgence] = useState("");
  const [ville, setVille] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const prenom = nom.trim().split(" ")[0] || "vous";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nom.trim()) e.nom = "Entrez votre nom";
    if (!nomAgence.trim()) e.nomAgence = "Entrez le nom de votre agence";
    if (!ville) e.ville = "Sélectionnez votre ville";
    if (!telephone.trim()) e.telephone = "Entrez votre téléphone";
    if (!email.trim() || !email.includes("@")) e.email = "Entrez un email valide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");
    try {
      await submitPartenairesWaitlist({
        nom: nom.trim(),
        nom_agence: nomAgence.trim(),
        ville,
        telephone: telephone.trim(),
        email: email.trim(),
      });
      setSuccess(true);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez réessayer ou nous contacter directement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80"
            alt="Bureau professionnel"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.72) 100%)" }} />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{ background: "rgba(139,26,46,0.25)", border: "1px solid rgba(139,26,46,0.5)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C0392B" }} />
            <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Bientôt disponible</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-white leading-[1.08] tracking-tight mb-7"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            Le premier réseau<br className="hidden sm:block" /> immobilier partagé du Maroc.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base md:text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            WeHome invite les meilleures agences du pays à rejoindre une plateforme commune —
            des listings partagés, des standards communs, une visibilité nationale.
            Le MLS marocain se construit maintenant.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-base text-white hover:-translate-y-1 transition-all duration-300"
            style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 8px 32px rgba(139,26,46,0.5)" }}
          >
            Rejoindre la liste d'attente
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHAT AGENTS GET
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="max-w-2xl mb-16">
            <Overline>Ce que vous obtenez</Overline>
            <h2 className="font-display font-bold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
              Rejoindre WeHome,<br />c'est rejoindre un standard.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Visibilité nationale",
                body: "Vos biens exposés à l'audience de WeHome dans tout le Maroc — acheteurs locaux, investisseurs nationaux, diaspora marocaine à l'étranger.",
                delay: 0,
              },
              {
                icon: Tag,
                title: "Vos listings, votre marque",
                body: "Vous gardez votre nom, votre logo, vos contacts. WeHome amplifie votre reach, pas votre identité. Votre marque reste la vôtre.",
                delay: 0.1,
              },
              {
                icon: ShieldCheck,
                title: "Standards partagés",
                body: "Des biens vérifiés, mandatés, photographiés. Un réseau qui protège la qualité — et donc la confiance des acheteurs dans toutes les agences membres.",
                delay: 0.2,
              },
            ].map(({ icon: Icon, title, body, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div className="flex flex-col gap-5 p-8 rounded-3xl border border-border/60 hover:border-primary/25 hover:shadow-xl transition-all duration-400 h-full">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,26,46,0.08)" }}>
                    <Icon size={22} style={{ color: "var(--primary, #8B1A2E)" }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-xl mb-3">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-[1.8]">{body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WAITLIST FORM
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ background: "#f7f6f5" }} ref={formRef}>
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-10">
            <Overline>Liste d'attente</Overline>
            <h2 className="font-display font-bold text-foreground text-3xl md:text-4xl mb-3">
              Réservez votre place.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Les premières agences partenaires bénéficieront de conditions préférentielles<br className="hidden sm:block" /> et d'un accès prioritaire au lancement.
            </p>
          </FadeIn>

          <div className="bg-white rounded-3xl shadow-xl border border-border/40 p-8 md:p-10">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(139,26,46,0.08)" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                      <CheckCircle2 size={34} style={{ color: "var(--primary, #8B1A2E)" }} />
                    </motion.div>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-2xl mb-3">
                    Merci {prenom}. Vous êtes sur la liste.
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-7 text-sm max-w-sm mx-auto">
                    Nous vous contacterons en priorité lors du lancement du réseau WeHome.
                    Bienvenue dans l'aventure.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-foreground/70 border border-border/50 hover:border-border hover:text-foreground transition-colors"
                  >
                    Retour à l'accueil
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-2">
                      Nom et prénom <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Karim Zniber"
                      className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                    {errors.nom && <p className="text-xs text-destructive mt-1.5">{errors.nom}</p>}
                  </div>

                  {/* Nom agence */}
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-2">
                      Nom de l'agence <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nomAgence}
                      onChange={(e) => setNomAgence(e.target.value)}
                      placeholder="Immo Premium Casablanca"
                      className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                    {errors.nomAgence && <p className="text-xs text-destructive mt-1.5">{errors.nomAgence}</p>}
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-2">
                      Ville <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                      >
                        <option value="">Sélectionner une ville...</option>
                        {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.ville && <p className="text-xs text-destructive mt-1.5">{errors.ville}</p>}
                  </div>

                  {/* Tel + Email grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-2">
                        Téléphone <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                        className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      />
                      {errors.telephone && <p className="text-xs text-destructive mt-1.5">{errors.telephone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-2">
                        Email professionnel <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@monagence.ma"
                        className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive bg-destructive/5 px-4 py-3 rounded-xl">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
                    style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 4px 20px rgba(139,26,46,0.25)" }}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                    {loading ? "Envoi en cours..." : "Rejoindre la liste d'attente"}
                  </button>

                  <p className="text-center text-xs text-muted-foreground/60 pt-1">
                    Aucun engagement. Conditions préférentielles réservées aux premiers inscrits.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center mb-14">
            <h2 className="font-display font-bold text-foreground text-3xl md:text-4xl">
              Questions fréquentes
            </h2>
          </FadeIn>

          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="border border-border/60 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <span className="font-semibold text-foreground text-sm leading-snug">{q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <ChevronDown size={18} className="text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-muted-foreground text-sm leading-[1.75] border-t border-border/40 pt-4">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 text-center" style={{ background: "#0a0a0a" }}>
        <FadeIn from="none" className="max-w-2xl mx-auto px-6">
          <h2
            className="font-display font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Le marché immobilier marocain<br />a besoin d'un standard commun.
          </h2>
          <p className="text-white/50 text-lg mb-10">Construisons-le ensemble.</p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-base text-white hover:-translate-y-1 transition-all duration-300"
            style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 8px 32px rgba(139,26,46,0.45)" }}
          >
            <ArrowRight size={18} />
            Rejoindre la liste d'attente
          </button>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
