import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Sparkles,
  ArrowRight,
  MapPin,
  Square,
  Users,
  TrendingUp,
  ShieldCheck,
  Target,
  Network,
  Loader2,
  Phone,
  CheckCircle2,
  Crown,
  ExternalLink,
  AlertCircle,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";

const whatsappWeOffice = `https://wa.me/212653535156?text=${encodeURIComponent(
  "Bonjour WeOffice,\n\nJe souhaite être contacté concernant un projet de bureaux ou local professionnel.\n\nMerci !"
)}`;

const WEOFFICE_URL = "https://weoffice.ma";

type Mode = "rent" | "buy" | "list";

export default function WeOfficePage() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  // ── Form state ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("rent");
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [surface, setSurface] = useState("");
  const [budget, setBudget] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modeLabel = (m: Mode) => {
    switch (m) {
      case "rent":
        return fallback("weoffice.mode_rent", "Louer un bureau");
      case "buy":
        return fallback("weoffice.mode_buy", "Acheter / Investir");
      case "list":
        return fallback("weoffice.mode_list", "Mettre en location / vente");
    }
  };

  const isValid = (): string | null => {
    if (!contactName.trim()) return fallback("weoffice.err_name", "Merci d'indiquer votre nom.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return fallback("weoffice.err_email", "Email invalide.");
    if (!/^[+\d][\d\s-]{6,}$/.test(phone))
      return fallback("weoffice.err_phone", "Téléphone invalide.");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = isValid();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: [
          `Type de demande : ${modeLabel(mode)}`,
          company ? `Société : ${company}` : null,
          contactRole ? `Fonction : ${contactRole}` : null,
          city ? `Ville cible : ${city}` : null,
          surface ? `Surface : ${surface} m²` : null,
          budget ? `Budget : ${budget} MAD` : null,
          headcount ? `Effectif : ${headcount} pers.` : null,
          message ? `Message : ${message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: `WeOffice — ${modeLabel(mode)}`,
        status: "New",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `${fallback("weoffice.err_submit_prefix", "Erreur :")} ${err.message}`
          : fallback("weoffice.err_submit_generic", "Une erreur est survenue. Réessayez.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3b82f6_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#8b5cf6_0%,transparent_50%)]" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Brand logo — large standalone stamp */}
                <img
                  src={`${import.meta.env.BASE_URL}images/weoffice-logo.png`}
                  alt="WeOffice"
                  className="h-10 md:h-12 w-auto mb-6 opacity-95"
                  loading="eager"
                />
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5 border border-white/20">
                  <Building2 size={14} className="text-blue-300" />
                  {fallback("weoffice.hero_badge", "Pôle immobilier d'entreprise")}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight">
                  {fallback("weoffice.hero_title_part1", "Vos bureaux,")}{" "}
                  <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-blue-200 bg-clip-text text-transparent">
                    {fallback("weoffice.hero_title_part2", "à la hauteur de votre ambition.")}
                  </span>
                </h1>
                <p className="text-lg md:text-xl mt-6 opacity-90 leading-relaxed max-w-xl">
                  {fallback(
                    "weoffice.hero_subtitle",
                    "Bureaux, plateaux, espaces de coworking, locaux commerciaux — nous trouvons ou commercialisons les espaces professionnels qui font la différence pour les entreprises au Maroc."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <a
                    href="#brief"
                    className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold bg-white text-slate-900 shadow-2xl hover:-translate-y-0.5 transition-all"
                  >
                    {fallback("weoffice.hero_cta_primary", "Décrire mon besoin")}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                  <a
                    href={WEOFFICE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all"
                  >
                    {fallback("weoffice.hero_cta_secondary", "Voir le catalogue")}
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 md:gap-6 mt-12 pt-8 border-t border-white/10 max-w-lg">
                  <Stat
                    value={fallback("weoffice.stat_1_value", "100+")}
                    label={fallback("weoffice.stat_1_label", "Espaces référencés")}
                  />
                  <Stat
                    value={fallback("weoffice.stat_2_value", "200k+")}
                    label={fallback("weoffice.stat_2_label", "m² commercialisés")}
                  />
                  <Stat
                    value={fallback("weoffice.stat_3_value", "30j")}
                    label={fallback("weoffice.stat_3_label", "Délai moyen")}
                  />
                </div>
              </motion.div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block relative h-[460px]"
              >
                <FloatingCard
                  className="absolute top-0 right-0 w-72"
                  delay={0.4}
                  accent="blue"
                  icon={<Briefcase size={18} />}
                  title={fallback("weoffice.float_1_title", "Bureaux clé en main")}
                  description={fallback(
                    "weoffice.float_1_desc",
                    "Espaces aménagés et prêts à occuper"
                  )}
                />
                <FloatingCard
                  className="absolute top-36 left-0 w-72"
                  delay={0.6}
                  accent="purple"
                  icon={<Crown size={18} />}
                  title={fallback("weoffice.float_2_title", "Plateaux premium")}
                  description={fallback(
                    "weoffice.float_2_desc",
                    "Adresses prestige, finitions haut de gamme"
                  )}
                />
                <FloatingCard
                  className="absolute top-72 right-8 w-72"
                  delay={0.8}
                  accent="blue"
                  icon={<Network size={18} />}
                  title={fallback("weoffice.float_3_title", "Off-market exclusif")}
                  description={fallback(
                    "weoffice.float_3_desc",
                    "Opportunités invisibles ailleurs"
                  )}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── 3 CATEGORIES ─────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-14"
            >
              <div className="inline-flex items-center gap-1.5 bg-slate-900/[0.06] text-slate-700 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles size={12} />
                {fallback("weoffice.cat_badge", "Nos solutions")}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                {fallback("weoffice.cat_title", "Trois manières de travailler avec WeOffice.")}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryCard
                icon={<Briefcase size={22} />}
                title={fallback("weoffice.cat1_title", "Louer un espace")}
                bullets={[
                  fallback("weoffice.cat1_b1", "Bureaux fermés ou open space"),
                  fallback("weoffice.cat1_b2", "Plateaux de 50 à 5 000 m²"),
                  fallback("weoffice.cat1_b3", "Adresses Casa, Rabat, Tanger"),
                ]}
              />
              <CategoryCard
                icon={<TrendingUp size={22} />}
                title={fallback("weoffice.cat2_title", "Acheter / Investir")}
                bullets={[
                  fallback("weoffice.cat2_b1", "Plateaux à diviser"),
                  fallback("weoffice.cat2_b2", "Immeubles tertiaires complets"),
                  fallback("weoffice.cat2_b3", "Rentabilité projetée chiffrée"),
                ]}
                featured
              />
              <CategoryCard
                icon={<Crown size={22} />}
                title={fallback("weoffice.cat3_title", "Commercialiser vos m²")}
                bullets={[
                  fallback("weoffice.cat3_b1", "Bureaux vacants à monétiser"),
                  fallback("weoffice.cat3_b2", "Marketing + diffusion premium"),
                  fallback("weoffice.cat3_b3", "Locataires entreprises qualifiés"),
                ]}
              />
            </div>
          </div>
        </section>

        {/* ─── WHY WEOFFICE ────────────────────────────────────── */}
        <section className="py-20 md:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute -left-20 top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-20 bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-14"
            >
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                <Target size={12} className="text-blue-300" />
                {fallback("weoffice.why_badge", "Pourquoi WeOffice")}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
                {fallback(
                  "weoffice.why_title",
                  "Le bureau influence votre business. Choisissez-le bien."
                )}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <BenefitDark
                icon={<Network size={22} />}
                title={fallback("weoffice.benefit_1_title", "Off-market exclusif")}
                description={fallback(
                  "weoffice.benefit_1_desc",
                  "Accès aux espaces premium qui ne sortent jamais sur les portails. Notre force : le réseau direct propriétaires."
                )}
              />
              <BenefitDark
                icon={<Target size={22} />}
                title={fallback("weoffice.benefit_2_title", "Brief précis, options ciblées")}
                description={fallback(
                  "weoffice.benefit_2_desc",
                  "Tu nous donnes ton besoin (équipe, image, budget, zone). On revient avec 3 options qui matchent vraiment."
                )}
              />
              <BenefitDark
                icon={<TrendingUp size={22} />}
                title={fallback("weoffice.benefit_3_title", "Marketing intégré")}
                description={fallback(
                  "weoffice.benefit_3_desc",
                  "Pour les landlords : photos IA, plans 3D, vidéo drone, diffusion premium. Vos m² deviennent désirables."
                )}
              />
              <BenefitDark
                icon={<ShieldCheck size={22} />}
                title={fallback("weoffice.benefit_4_title", "Juridique & financier")}
                description={fallback(
                  "weoffice.benefit_4_desc",
                  "Négociation du bail, conditions suspensives, vérifications, garanties. On reste à tes côtés jusqu'à la signature."
                )}
              />
              <BenefitDark
                icon={<Users size={22} />}
                title={fallback("weoffice.benefit_5_title", "Locataires entreprises")}
                description={fallback(
                  "weoffice.benefit_5_desc",
                  "Pour les bailleurs : on filtre les locataires. Société établie, dossier financier solide, projet d'occupation clair."
                )}
              />
              <BenefitDark
                icon={<Crown size={22} />}
                title={fallback("weoffice.benefit_6_title", "Approche premium")}
                description={fallback(
                  "weoffice.benefit_6_desc",
                  "Pas de spam, pas de visites en série. Un conseil sur-mesure, comme un cabinet de courtage d'entreprise."
                )}
              />
            </div>
          </div>
        </section>

        {/* ─── BRIEF FORM ───────────────────────────────────────── */}
        <section id="brief" className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {success ? (
              <SuccessState />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-10"
                >
                  <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles size={12} className="text-blue-300" />
                    {fallback("weoffice.brief_badge", "Briefez-nous en 60 secondes")}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                    {fallback(
                      "weoffice.brief_title",
                      "Décrivez votre besoin. On revient avec des options."
                    )}
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">
                    {fallback(
                      "weoffice.brief_subtitle",
                      "Nous traitons votre demande sous 24h. Confidentiel, sans engagement."
                    )}
                  </p>
                </motion.div>

                <motion.form
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleSubmit}
                  className="bg-white border border-border rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-900/[0.04] space-y-7"
                >
                  {/* Mode */}
                  <Field label={fallback("weoffice.field_mode", "Vous souhaitez")}>
                    <div className="grid grid-cols-3 gap-2">
                      {(["rent", "buy", "list"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMode(m)}
                          className={`py-3 rounded-xl text-xs md:text-sm font-bold border transition-colors ${
                            mode === m
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                              : "bg-white border-border text-foreground/70 hover:border-foreground/40"
                          }`}
                        >
                          {modeLabel(m)}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={fallback("weoffice.field_company", "Société")}>
                      <Input
                        value={company}
                        onChange={setCompany}
                        placeholder={fallback(
                          "weoffice.field_company_placeholder",
                          "Ex: Ma société SARL"
                        )}
                      />
                    </Field>
                    <Field label={fallback("weoffice.field_role", "Fonction")}>
                      <Input
                        value={contactRole}
                        onChange={setContactRole}
                        placeholder={fallback(
                          "weoffice.field_role_placeholder",
                          "Ex: CEO, RH, etc."
                        )}
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={fallback("weoffice.field_name", "Votre nom")} required>
                      <Input
                        value={contactName}
                        onChange={setContactName}
                        placeholder={fallback("weoffice.field_name_placeholder", "Prénom Nom")}
                      />
                    </Field>
                    <Field
                      label={fallback("weoffice.field_email", "Email")}
                      required
                      icon={<Mail size={15} />}
                    >
                      <Input
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="vous@societe.ma"
                      />
                    </Field>
                  </div>

                  <Field
                    label={fallback("weoffice.field_phone", "Téléphone")}
                    required
                    icon={<Phone size={15} />}
                  >
                    <Input
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field
                      label={fallback("weoffice.field_city", "Ville cible")}
                      icon={<MapPin size={15} />}
                    >
                      <Input value={city} onChange={setCity} placeholder="Casablanca" />
                    </Field>
                    <Field
                      label={fallback("weoffice.field_surface", "Surface (m²)")}
                      icon={<Square size={15} />}
                    >
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={surface}
                        onChange={setSurface}
                        placeholder="150"
                      />
                    </Field>
                    <Field
                      label={fallback("weoffice.field_headcount", "Effectif")}
                      icon={<Users size={15} />}
                    >
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={headcount}
                        onChange={setHeadcount}
                        placeholder="12"
                      />
                    </Field>
                  </div>

                  <Field
                    label={fallback(
                      "weoffice.field_budget",
                      mode === "rent" ? "Budget mensuel (MAD)" : "Budget (MAD)"
                    )}
                  >
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={budget}
                      onChange={setBudget}
                      placeholder={mode === "rent" ? "Ex: 25000" : "Ex: 5000000"}
                    />
                  </Field>

                  <Field label={fallback("weoffice.field_message", "Détails supplémentaires")}>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={fallback(
                        "weoffice.field_message_placeholder",
                        "Image souhaitée, contraintes, délais, etc."
                      )}
                      rows={4}
                      className="w-full px-3 py-3 rounded-xl bg-muted/40 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-sm transition-all resize-none"
                    />
                  </Field>

                  {submitError && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-4 flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      {submitError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground max-w-md">
                      {fallback(
                        "weoffice.consent",
                        "En envoyant ce brief vous autorisez WeOffice à vous recontacter. Données traitées en toute confidentialité."
                      )}
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold bg-slate-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {fallback("weoffice.submitting", "Envoi...")}
                        </>
                      ) : (
                        <>
                          {fallback("weoffice.submit", "Envoyer mon brief")}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    {fallback("weoffice.whatsapp_prefix", "Ou écris-nous direct sur")}{" "}
                    <a
                      href={whatsappWeOffice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 font-semibold hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </motion.form>
              </>
            )}
          </div>
        </section>

        {/* ─── FINAL CTA — vers weoffice.ma ────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-14 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                    <ExternalLink size={12} className="text-blue-300" />
                    {fallback("weoffice.final_badge", "Catalogue complet")}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                    {fallback(
                      "weoffice.final_title",
                      "Plus de 100 espaces référencés sur weoffice.ma."
                    )}
                  </h2>
                  <p className="text-base md:text-lg opacity-85 mt-4 leading-relaxed max-w-xl">
                    {fallback(
                      "weoffice.final_subtitle",
                      "Notre plateforme dédiée aux bureaux : recherche fine, plans, photos, vidéos. Découvre tous nos espaces commercialisés actuellement."
                    )}
                  </p>
                </div>

                <a
                  href={WEOFFICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold bg-white text-slate-900 shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  {fallback("weoffice.final_cta", "Voir le catalogue")}
                  <ExternalLink
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-display font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1 leading-tight">
        {label}
      </div>
    </div>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  title,
  description,
  accent = "blue",
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "blue" | "purple";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${className} bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/40`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white ${
            accent === "purple"
              ? "bg-gradient-to-br from-purple-500 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-blue-600"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-sm leading-tight">{title}</div>
          <div className="text-xs text-slate-600 mt-0.5 leading-snug">{description}</div>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({
  icon,
  title,
  bullets,
  featured = false,
}: {
  icon: React.ReactNode;
  title: string;
  bullets: string[];
  featured?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`relative bg-card rounded-3xl p-7 border transition-all ${
        featured
          ? "border-slate-900 shadow-xl shadow-slate-900/10 ring-4 ring-slate-900/5"
          : "border-border hover:shadow-lg hover:-translate-y-0.5 hover:border-foreground/20"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-7 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md">
          <Sparkles size={11} />
          Le plus demandé
        </div>
      )}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
          featured ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-foreground leading-tight">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-foreground/75">
            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function BenefitDark({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/20 transition-all"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center mb-5 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-display font-bold leading-tight">{title}</h3>
      <p className="text-sm opacity-75 mt-2 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SuccessState() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-border rounded-3xl p-10 md:p-14 text-center shadow-xl"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center mb-6">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
        {fallback("weoffice.success_title", "Brief reçu. On revient sous 24h.")}
      </h2>
      <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
        {fallback(
          "weoffice.success_body",
          "Notre équipe analyse votre besoin et revient avec des options qualifiées. En attendant, vous pouvez explorer le catalogue complet."
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <a
          href={WEOFFICE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full font-bold bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {fallback("weoffice.success_cta_catalog", "Voir le catalogue")}
          <ExternalLink size={16} />
        </a>
        <Link
          href="/"
          className="px-6 py-3 rounded-full font-bold border-2 border-foreground/15 text-foreground hover:border-foreground/40 transition-colors"
        >
          {fallback("weoffice.success_cta_home", "Retour à l'accueil")}
        </Link>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground/85 mb-1.5">
        {icon && <span className="text-slate-700/70">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full px-3 py-3 rounded-xl bg-muted/40 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-sm font-medium transition-all"
    />
  );
}
