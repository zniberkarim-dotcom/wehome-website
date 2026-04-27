import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart3, Globe, Coins, Check, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitNetworkApplication } from "@/lib/data";

const ZONES = ["Maarif", "Racine", "Ain Diab", "CIL", "Hay Riad", "Autre"];
const PROFILE_TYPES = [
  "Agent indépendant",
  "Samsar",
  "Conseiller patrimonial",
  "Autre",
];

const ADVANTAGES = [
  {
    icon: <BarChart3 size={28} />,
    title: "CRM Professionnel Gratuit",
    desc: "Gérez vos leads, suivez vos transactions et organisez votre pipeline depuis un seul outil.",
  },
  {
    icon: <Globe size={28} />,
    title: "Votre Fiche Agent sur wehome.ma",
    desc: "Votre profil professionnel visible par des milliers d'acheteurs et vendeurs chaque mois.",
  },
  {
    icon: <Coins size={28} />,
    title: "Leads & Commissions",
    desc: "Recevez des leads qualifiés correspondant à vos zones et gagnez des commissions sur chaque transaction.",
  },
];

const TIERS = [
  {
    name: "Network",
    active: false,
    condition: null,
    perks: [
      "CRM WeHome gratuit",
      "Fiche agent sur wehome.ma",
      "Accès au portefeuille WeHome",
      "Leads entrants partagés",
      "Commission 30%",
    ],
  },
  {
    name: "Network Pro",
    active: true,
    condition: "3+ transactions / an",
    perks: [
      "Tout ce qu'inclut Network",
      "Leads qualifiés prioritaires",
      "Co-marketing réseaux sociaux WeHome",
      "Accompagnement transactions",
      "Commission 40%",
    ],
  },
  {
    name: "Network Elite",
    active: false,
    condition: "6+ transactions / an",
    perks: [
      "Tout ce qu'inclut Network Pro",
      "Leads exclusifs sur vos zones",
      "Branding co-signé WeHome",
      "Accès deals off-market",
      "Support dédié WeHome",
      "Commission 50%",
    ],
  },
];

const STATS = [
  { value: "+50", label: "Agents partenaires" },
  { value: "+200", label: "Biens en portefeuille" },
  { value: "3 villes", label: "Casablanca · Rabat · Marrakech" },
];

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_type: string;
  zones: string[];
  property_count: string;
  message: string;
}

const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  profile_type: "",
  zones: [],
  property_count: "",
  message: "",
};

export default function NetworkPage() {
  const formRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleZone(zone: string) {
    setForm((f) => ({
      ...f,
      zones: f.zones.includes(zone)
        ? f.zones.filter((z) => z !== zone)
        : [...f.zones, zone],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.first_name || !form.last_name || !form.phone || !form.profile_type || !form.property_count) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await submitNetworkApplication({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        profile_type: form.profile_type,
        zones: form.zones,
        property_count: form.property_count,
        message: form.message || undefined,
      });
      setSuccess(true);
      setForm(emptyForm);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer ou nous contacter directement.");
    } finally {
      setLoading(false);
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F0F0F" }}>
      <Navbar />

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80"
            alt="WeHome Network"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(15,15,15,1) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span
              style={{
                display: "inline-block",
                background: "rgba(139,26,46,0.25)",
                border: "1px solid rgba(139,26,46,0.5)",
                backdropFilter: "blur(6px)",
                padding: "5px 16px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
                marginBottom: "28px",
              }}
            >
              <span style={{ color: "#C0392B", fontSize: "7px", verticalAlign: "middle", marginRight: "8px" }}>◆</span>
              Programme Partenaires
            </span>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6"
              style={{ color: "#FFFFFF", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
            >
              Rejoignez<br />
              <span style={{ color: "#C0392B" }}>WeHome</span> Network
            </h1>

            <p
              className="text-lg md:text-xl max-w-2xl mx-auto font-medium mb-10"
              style={{ color: "rgba(255,255,255,0.8)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
            >
              Le premier réseau d'agents et conseillers immobiliers de Casablanca.
              Accédez à des leads qualifiés, un CRM professionnel et une visibilité digitale —
              <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}> gratuitement.</span>
            </p>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "#8B1A2E",
                boxShadow: "0 8px 32px rgba(139,26,46,0.4)",
              }}
            >
              Rejoindre le Network
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── 2. AVANTAGES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0F0F0F" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ce que vous obtenez
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Tout ce qu'il faut pour développer votre activité immobilière à Casablanca.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADVANTAGES.map((adv, i) => (
              <motion.div
                key={adv.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-8 flex flex-col gap-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,26,46,0.2)", color: "#C0392B" }}
                >
                  {adv.icon}
                </div>
                <h3 className="text-white font-semibold text-lg">{adv.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. NIVEAUX ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Trois niveaux de partenariat
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Commencez gratuitement. Évoluez au rythme de vos transactions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-8 flex flex-col gap-5 relative"
                style={
                  tier.active
                    ? {
                        background: "rgba(139,26,46,0.12)",
                        border: "1.5px solid rgba(139,26,46,0.6)",
                        boxShadow: "0 0 48px rgba(139,26,46,0.12)",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }
                }
              >
                {tier.active && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: "#8B1A2E" }}
                  >
                    Recommandé
                  </span>
                )}
                <div>
                  <h3
                    className="text-xl font-display font-bold mb-1"
                    style={{ color: tier.active ? "#E8A0A8" : "rgba(255,255,255,0.9)" }}
                  >
                    {tier.name}
                  </h3>
                  {tier.condition && (
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Condition : {tier.condition}
                    </p>
                  )}
                </div>
                <ul className="space-y-3 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0"
                        style={{ color: tier.active ? "#C0392B" : "rgba(255,255,255,0.3)" }}
                      />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-2"
                  style={
                    tier.active
                      ? {
                          background: "#8B1A2E",
                          color: "#fff",
                          boxShadow: "0 4px 20px rgba(139,26,46,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  Rejoindre
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CHIFFRES ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ background: "#8B1A2E" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className="text-4xl font-display font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/65 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FORMULAIRE ── */}
      <section
        ref={formRef}
        id="network-form"
        className="py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: "#0F0F0F" }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Rejoindre le réseau
              </h2>
              <p className="text-white/50">
                Notre équipe valide chaque demande sous 48h.
              </p>
            </div>

            {success ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(139,26,46,0.2)" }}
                >
                  <Check size={32} style={{ color: "#C0392B" }} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  Demande reçue !
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Votre demande a bien été reçue. Notre équipe vous contacte sous 48h pour valider votre accès.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl p-8 md:p-10 space-y-6"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Prénom <span style={{ color: "#C0392B" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setField("first_name", e.target.value)}
                      placeholder="Youssef"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 focus:ring-1"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Nom <span style={{ color: "#C0392B" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => setField("last_name", e.target.value)}
                      placeholder="Benali"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                </div>

                {/* Téléphone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Téléphone (WhatsApp) <span style={{ color: "#C0392B" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                </div>

                {/* Profil */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Type de profil <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <select
                    value={form.profile_type}
                    onChange={(e) => setField("profile_type", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: form.profile_type ? "white" : "rgba(255,255,255,0.2)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    <option value="" style={{ background: "#1a1a1a" }}>Sélectionner...</option>
                    {PROFILE_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Zones */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Zones de travail (Casablanca)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((zone) => {
                      const selected = form.zones.includes(zone);
                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => toggleZone(zone)}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                          style={
                            selected
                              ? { background: "#8B1A2E", color: "#fff", border: "1px solid #8B1A2E" }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.5)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }
                          }
                        >
                          {zone}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nombre de biens */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nombre de biens disponibles actuellement <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <select
                    value={form.property_count}
                    onChange={(e) => setField("property_count", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: form.property_count ? "white" : "rgba(255,255,255,0.2)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    <option value="" style={{ background: "#1a1a1a" }}>Sélectionner...</option>
                    <option value="1-3" style={{ background: "#1a1a1a" }}>1 – 3 biens</option>
                    <option value="4-10" style={{ background: "#1a1a1a" }}>4 – 10 biens</option>
                    <option value="10+" style={{ background: "#1a1a1a" }}>10+ biens</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Parlez-nous de votre activité, vos spécialités..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none resize-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,26,46,0.6)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "#E8A0A8" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "#8B1A2E",
                    boxShadow: "0 8px 32px rgba(139,26,46,0.35)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Rejoindre WeHome Network"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
