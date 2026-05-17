import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, CheckCircle2, Home, User, Zap,
  BarChart2, Shield, Clock, ArrowLeft, Loader2, Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitEstimationLead } from "@/lib/data";

// ─── Constants — DB values paired with i18n keys ────────────────────────────
// Each option stores the original FR `value` (sent to Supabase) plus a key
// used purely for display. Names/quartiers stay in their original characters.

const TYPE_BIEN: { value: string; labelKey: string }[] = [
  { value: "Appartement",       labelKey: "estimer.type_apt" },
  { value: "Villa",             labelKey: "estimer.type_villa" },
  { value: "Maison",            labelKey: "estimer.type_maison" },
  { value: "Bureau",            labelKey: "estimer.type_bureau" },
  { value: "Local commercial",  labelKey: "estimer.type_local" },
  { value: "Terrain",           labelKey: "estimer.type_terrain" },
];

const QUARTIERS = [
  "Maarif", "Racine", "Gauthier", "CIL", "Ain Diab", "Anfa", "Palmier",
  "Bourgogne", "Sidi Maârouf", "Bouskoura", "Casa Finance City",
  "Hay Hassani", "Bernoussi", "Autre",
];

const CHAMBRES_OPTIONS: { value: string; labelKey?: string }[] = [
  { value: "Studio", labelKey: "estimer.chambres_studio" },
  { value: "1" },
  { value: "2" },
  { value: "3" },
  { value: "4" },
  { value: "5+", labelKey: "estimer.chambres_5p" },
];

const ETAT_OPTIONS: { value: string; labelKey: string; descKey: string }[] = [
  { value: "Neuf / Récent", labelKey: "estimer.etat_neuf_value",     descKey: "estimer.etat_neuf_desc" },
  { value: "Bon état",      labelKey: "estimer.etat_bon_value",      descKey: "estimer.etat_bon_desc" },
  { value: "À rénover",     labelKey: "estimer.etat_renover_value",  descKey: "estimer.etat_renover_desc" },
];

const ETAGE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "RDC",            labelKey: "estimer.etage_rdc" },
  { value: "1–3",            labelKey: "estimer.etage_1_3" },
  { value: "4–6",            labelKey: "estimer.etage_4_6" },
  { value: "7+",             labelKey: "estimer.etage_7p" },
  { value: "Non applicable", labelKey: "estimer.etage_na" },
];

const CARACT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Parking / Garage",   labelKey: "estimer.caract_parking" },
  { value: "Terrasse / Balcon",  labelKey: "estimer.caract_terrace" },
  { value: "Vue dégagée",        labelKey: "estimer.caract_view" },
  { value: "Ascenseur",          labelKey: "estimer.caract_elevator" },
  { value: "Gardien / Sécurité", labelKey: "estimer.caract_security" },
  { value: "Piscine",            labelKey: "estimer.caract_pool" },
  { value: "Climatisation",      labelKey: "estimer.caract_ac" },
  { value: "Cuisine équipée",    labelKey: "estimer.caract_kitchen" },
];

const MOTIVATION_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Dans les 3 prochains mois", labelKey: "estimer.moti_3m" },
  { value: "Dans les 6 prochains mois", labelKey: "estimer.moti_6m" },
  { value: "J'explore les options",     labelKey: "estimer.moti_explore" },
  { value: "Je veux louer, pas vendre", labelKey: "estimer.moti_rent" },
];

const FAQ_ITEMS = [
  { qKey: "estimer.faq_1_q", aKey: "estimer.faq_1_a" },
  { qKey: "estimer.faq_2_q", aKey: "estimer.faq_2_a" },
  { qKey: "estimer.faq_3_q", aKey: "estimer.faq_3_a" },
  { qKey: "estimer.faq_4_q", aKey: "estimer.faq_4_a" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "", from = "bottom" }: { children: React.ReactNode; delay?: number; className?: string; from?: "bottom" | "left" | "right" | "none" }) {
  const initial =
    from === "none" ? { opacity: 0 }
    : from === "left"  ? { opacity: 0, x: -24 }
    : from === "right" ? { opacity: 0, x: 24 }
    : { opacity: 0, y: 24 };
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ButtonGroup({
  options, value, onChange, columns = 3,
}: {
  /** Each option's `value` is the DB value sent to Supabase; `label` is the displayed text. */
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2.5`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all duration-200 text-center ${
            value === opt.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-border/60 bg-white text-foreground/70 hover:border-primary/40 hover:bg-primary/3"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold tracking-wider uppercase text-foreground/60 mb-3">
      {children}{required && <span className="text-primary ml-1">*</span>}
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EstimerPage() {
  const { t } = useTranslation();
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward

  // ── Form data ───────────────────────────────────────────────────────────────
  const [typeBien, setTypeBien] = useState("");
  const [quartier, setQuartier] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [chambres, setChambres] = useState("");

  const [etat, setEtat] = useState("");
  const [etage, setEtage] = useState("");
  const [caracteristiques, setCaracteristiques] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  // ── Submit state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!typeBien) e.typeBien = t("estimer.err_type");
    if (!quartier) e.quartier = t("estimer.err_quartier");
    if (!superficie || isNaN(Number(superficie)) || Number(superficie) <= 0)
      e.superficie = t("estimer.err_superficie");
    if (!chambres) e.chambres = t("estimer.err_chambres");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!etat) e.etat = t("estimer.err_etat");
    if (!motivation) e.motivation = t("estimer.err_motivation");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!nom.trim()) e.nom = t("estimer.err_nom");
    if (!telephone.trim()) e.telephone = t("estimer.err_telephone");
    if (!email.trim() || !email.includes("@")) e.email = t("estimer.err_email");
    if (!consent) e.consent = t("estimer.err_consent");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    const valid = step === 1 ? validateStep1() : step === 2 ? validateStep2() : false;
    if (!valid) return;
    setDirection(1);
    setStep((s) => s + 1);
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const toggleCaract = (v: string) =>
    setCaracteristiques((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    setSubmitError("");
    try {
      await submitEstimationLead({
        type_bien: typeBien,
        quartier,
        superficie: superficie ? Number(superficie) : null,
        chambres,
        etat,
        etage: etage || "Non précisé",
        caracteristiques,
        motivation,
        nom: nom.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        message: message.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setSubmitError(t("estimer.err_generic"));
    } finally {
      setLoading(false);
    }
  };

  // ── Step slide variants ──────────────────────────────────────────────────────
  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const prenom = nom.trim().split(" ")[0] || "vous";

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt="Belle propriété casablancaise"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.65) 100%)" }} />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">
              {t("estimer.hero_badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {t("estimer.hero_title_line1")}<br className="hidden sm:block" /> {t("estimer.hero_title_line2")}
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.72)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            {t("estimer.hero_subtitle")}
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.56 }}
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-base text-white shadow-2xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 8px 32px rgba(139,26,46,0.5)" }}
          >
            {t("estimer.hero_cta")}
            <ChevronDown size={18} />
          </motion.button>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            {[
              { icon: Home, text: t("estimer.trust_1") },
              { icon: User, text: t("estimer.trust_2") },
              { icon: Zap,  text: t("estimer.trust_3") },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} style={{ color: "rgba(255,255,255,0.55)" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — FORM
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-secondary/30" ref={formRef}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-border/40 overflow-hidden">

            {/* ── Progress bar ── */}
            {!success && (
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div
                        className="h-1.5 flex-1 rounded-full overflow-hidden bg-border/40"
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "var(--primary, #8B1A2E)" }}
                          initial={false}
                          animate={{ width: step > s ? "100%" : step === s ? "100%" : "0%" }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("estimer.step_indicator", {
                    current: step,
                    name: step === 1 ? t("estimer.step1_name") : step === 2 ? t("estimer.step2_name") : t("estimer.step3_name"),
                  })}
                </p>
              </div>
            )}

            {/* ── Form steps ── */}
            <div className="px-8 pb-10 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {success ? (
                  /* ── Success ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="py-8 text-center"
                  >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(139,26,46,0.08)" }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 size={40} style={{ color: "var(--primary, #8B1A2E)" }} />
                      </motion.div>
                    </div>
                    <h2 className="font-display font-bold text-foreground text-2xl mb-3">
                      {t("estimer.success_title")}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
                      {t("estimer.success_body_part1")} <strong>{prenom}</strong>{t("estimer.success_body_part2")}{" "}
                      <strong>{quartier}</strong> {t("estimer.success_body_part3")}
                      <br /><br />
                      {t("estimer.success_body_part4")}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/biens"
                        className="px-7 py-3 rounded-xl font-bold text-sm text-white hover:-translate-y-0.5 transition-all duration-200"
                        style={{ background: "var(--primary, #8B1A2E)" }}
                      >
                        {t("estimer.success_see_biens")} {quartier}
                      </Link>
                      <Link
                        href="/"
                        className="px-7 py-3 rounded-xl font-semibold text-sm text-foreground/70 hover:text-foreground border border-border/50 hover:border-border transition-colors"
                      >
                        {t("estimer.success_home")}
                      </Link>
                    </div>
                  </motion.div>

                ) : step === 1 ? (
                  /* ── Step 1 ── */
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="font-display font-bold text-foreground text-xl mb-7">
                      {t("estimer.step1_title")}
                    </h2>

                    {/* Type de bien */}
                    <div className="mb-6">
                      <FieldLabel required>{t("estimer.f_type")}</FieldLabel>
                      <ButtonGroup
                        options={TYPE_BIEN.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                        value={typeBien}
                        onChange={setTypeBien}
                        columns={3}
                      />
                      {errors.typeBien && <p className="text-xs text-destructive mt-2">{errors.typeBien}</p>}
                    </div>

                    {/* Quartier */}
                    <div className="mb-6">
                      <FieldLabel required>{t("estimer.f_quartier")}</FieldLabel>
                      <div className="relative">
                        <select
                          value={quartier}
                          onChange={(e) => setQuartier(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                        >
                          <option value="">{t("estimer.f_quartier_placeholder")}</option>
                          {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.quartier && <p className="text-xs text-destructive mt-2">{errors.quartier}</p>}
                    </div>

                    {/* Superficie */}
                    <div className="mb-6">
                      <FieldLabel required>{t("estimer.f_superficie")}</FieldLabel>
                      <div className="relative">
                        <input
                          type="number"
                          value={superficie}
                          onChange={(e) => setSuperficie(e.target.value)}
                          placeholder={t("estimer.f_superficie_placeholder")}
                          min={1}
                          className="w-full pl-4 pr-14 py-3.5 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">m²</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{t("estimer.f_superficie_hint")}</p>
                      {errors.superficie && <p className="text-xs text-destructive mt-1">{errors.superficie}</p>}
                    </div>

                    {/* Chambres */}
                    <div className="mb-8">
                      <FieldLabel required>{t("estimer.f_chambres")}</FieldLabel>
                      <ButtonGroup
                        options={CHAMBRES_OPTIONS.map((o) => ({ value: o.value, label: o.labelKey ? t(o.labelKey) : o.value }))}
                        value={chambres}
                        onChange={setChambres}
                        columns={6}
                      />
                      {errors.chambres && <p className="text-xs text-destructive mt-2">{errors.chambres}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                      style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 4px 20px rgba(139,26,46,0.25)" }}
                    >
                      {t("estimer.btn_continue")} <ChevronRight size={18} />
                    </button>
                  </motion.div>

                ) : step === 2 ? (
                  /* ── Step 2 ── */
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="font-display font-bold text-foreground text-xl mb-7">
                      {t("estimer.step2_title")}
                    </h2>

                    {/* État */}
                    <div className="mb-6">
                      <FieldLabel required>{t("estimer.f_etat")}</FieldLabel>
                      <div className="grid gap-2.5">
                        {ETAT_OPTIONS.map(({ value, labelKey, descKey }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEtat(value)}
                            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                              etat === value
                                ? "border-primary bg-primary/5"
                                : "border-border/60 hover:border-primary/30"
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${etat === value ? "border-primary" : "border-border"}`}>
                              {etat === value && <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary, #8B1A2E)" }} />}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${etat === value ? "text-primary" : "text-foreground"}`}>{t(labelKey)}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{t(descKey)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.etat && <p className="text-xs text-destructive mt-2">{errors.etat}</p>}
                    </div>

                    {/* Étage */}
                    <div className="mb-6">
                      <FieldLabel>{t("estimer.f_etage")}</FieldLabel>
                      <ButtonGroup
                        options={ETAGE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                        value={etage}
                        onChange={setEtage}
                        columns={5}
                      />
                    </div>

                    {/* Caractéristiques */}
                    <div className="mb-6">
                      <FieldLabel>{t("estimer.f_caract")}</FieldLabel>
                      <div className="grid grid-cols-2 gap-2.5">
                        {CARACT_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => toggleCaract(c.value)}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${
                              caracteristiques.includes(c.value)
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border/60 text-foreground/70 hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${caracteristiques.includes(c.value) ? "bg-primary border-primary" : "border-border"}`}>
                              {caracteristiques.includes(c.value) && <Check size={10} className="text-white" />}
                            </div>
                            {t(c.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Motivation */}
                    <div className="mb-8">
                      <FieldLabel required>{t("estimer.f_motivation")}</FieldLabel>
                      <div className="relative">
                        <select
                          value={motivation}
                          onChange={(e) => setMotivation(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                        >
                          <option value="">{t("estimer.f_motivation_placeholder")}</option>
                          {MOTIVATION_OPTIONS.map((m) => <option key={m.value} value={m.value}>{t(m.labelKey)}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.motivation && <p className="text-xs text-destructive mt-2">{errors.motivation}</p>}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={goNext}
                        className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                        style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 4px 20px rgba(139,26,46,0.25)" }}
                      >
                        {t("estimer.btn_continue")} <ChevronRight size={18} />
                      </button>
                      <button type="button" onClick={goBack} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                        <ArrowLeft size={14} /> {t("estimer.btn_back")}
                      </button>
                    </div>
                  </motion.div>

                ) : (
                  /* ── Step 3 ── */
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="font-display font-bold text-foreground text-xl mb-2">
                      {t("estimer.step3_title")}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-7">
                      {t("estimer.step3_subtitle")}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nom */}
                      <div>
                        <FieldLabel required>{t("estimer.f_name")}</FieldLabel>
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          placeholder={t("estimer.f_name_placeholder")}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        {errors.nom && <p className="text-xs text-destructive mt-1.5">{errors.nom}</p>}
                      </div>

                      {/* Téléphone */}
                      <div>
                        <FieldLabel required>{t("estimer.f_phone")}</FieldLabel>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                          placeholder={t("estimer.f_phone_placeholder")}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        {errors.telephone && <p className="text-xs text-destructive mt-1.5">{errors.telephone}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <FieldLabel required>{t("estimer.f_email")}</FieldLabel>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("estimer.f_email_placeholder")}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                      </div>

                      {/* Message */}
                      <div>
                        <FieldLabel>{t("estimer.f_message")}</FieldLabel>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t("estimer.f_message_placeholder")}
                          rows={3}
                          className="w-full px-4 py-3.5 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                        />
                      </div>

                      {/* Consent */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setConsent(!consent)}
                          className="flex items-start gap-3 text-left w-full"
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${consent ? "bg-primary border-primary" : "border-border/60"}`}>
                            {consent && <Check size={11} className="text-white" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t("estimer.consent_part1")}{" "}
                            <span className="font-semibold">{t("estimer.consent_part2")}</span>
                          </p>
                        </button>
                        {errors.consent && <p className="text-xs text-destructive mt-1.5">{errors.consent}</p>}
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
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        {loading ? t("estimer.btn_submitting") : t("estimer.btn_submit")}
                      </button>

                      <button type="button" onClick={goBack} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
                        <ArrowLeft size={14} /> {t("estimer.btn_back")}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — WHY TRUST
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-bold text-foreground text-3xl md:text-4xl">
              {t("estimer.why_title_line1")}<br />{t("estimer.why_title_line2")}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: User,
                title: t("estimer.why1_title"),
                body:  t("estimer.why1_body"),
                delay: 0,
              },
              {
                icon: BarChart2,
                title: t("estimer.why2_title"),
                body:  t("estimer.why2_body"),
                delay: 0.1,
              },
              {
                icon: Shield,
                title: t("estimer.why3_title"),
                body:  t("estimer.why3_body"),
                delay: 0.2,
              },
            ].map(({ icon: Icon, title, body, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div className="flex flex-col gap-5 p-8 rounded-3xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,26,46,0.08)" }}>
                    <Icon size={22} style={{ color: "var(--primary, #8B1A2E)" }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-lg mb-3">{title}</h3>
                    <p className="text-muted-foreground leading-[1.75] text-sm">{body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32" style={{ background: "#f7f6f5" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center max-w-xl mx-auto mb-14">
            <h2 className="font-display font-bold text-foreground text-3xl md:text-4xl">
              {t("estimer.testimonials_title")}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: t("estimer.testimonial_1_quote"), author: "Karim B.",  location: "Maarif",   delay: 0 },
              { quote: t("estimer.testimonial_2_quote"), author: "Sophia M.", location: "Racine",   delay: 0.1 },
              { quote: t("estimer.testimonial_3_quote"), author: "Ahmed R.",  location: "Gauthier", delay: 0.2 },
            ].map(({ quote, author, location, delay }) => (
              <FadeIn key={author} delay={delay}>
                <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm" style={{ color: "#F59E0B" }}>★</span>
                    ))}
                  </div>
                  <p className="text-foreground/80 leading-[1.75] text-sm flex-grow">"{quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "var(--primary, #8B1A2E)" }}>
                      {author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{author}</p>
                      <p className="text-xs text-muted-foreground">{location}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — FAQ
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center mb-14">
            <h2 className="font-display font-bold text-foreground text-3xl md:text-4xl">
              {t("estimer.faq_title")}
            </h2>
          </FadeIn>

          <div className="space-y-3">
            {FAQ_ITEMS.map(({ qKey, aKey }, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="border border-border/60 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <span className="font-semibold text-foreground text-sm leading-snug">{t(qKey)}</span>
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
                        <p className="px-6 pb-5 text-muted-foreground text-sm leading-[1.75] border-t border-border/40 pt-4">
                          {t(aKey)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — CLOSING CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 text-center" style={{ background: "#0a0a0a" }}>
        <FadeIn from="none" className="max-w-2xl mx-auto px-6">
          <h2
            className="font-display font-bold text-white leading-tight mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            {t("estimer.closing_title_line1")}<br />{t("estimer.closing_title_line2")}
          </h2>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-base text-white hover:-translate-y-1 transition-all duration-300"
            style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 8px 32px rgba(139,26,46,0.45)" }}
          >
            <Clock size={18} />
            {t("estimer.hero_cta")}
          </button>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
