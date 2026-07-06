import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Phone,
  Mail,
  User as UserIcon,
  Briefcase,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MortgageCalculator } from "@/components/financement/MortgageCalculator";
import { formatMAD } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

/* ────────────────────────────────────────────────────────────────────────────
 * Capacité d'emprunt — calcul inverse
 *   Mensualité max = revenu × tauxEndettement − charges
 *   Principal max = M · ((1+r)^n − 1) / (r · (1+r)^n)
 * ────────────────────────────────────────────────────────────────────────── */

function computeBorrowingCapacity({
  revenuMensuel,
  chargesMensuelles,
  dureeAnnees,
  tauxAnnuel,
  apport,
  tauxEndettement,
}: {
  revenuMensuel: number;
  chargesMensuelles: number;
  dureeAnnees: number;
  tauxAnnuel: number;
  apport: number;
  tauxEndettement: number;
}) {
  const mensualiteMax = Math.max(0, revenuMensuel * tauxEndettement - chargesMensuelles);
  const n = Math.max(1, Math.round(dureeAnnees * 12));
  const r = tauxAnnuel / 100 / 12;
  let principalMax = 0;
  if (mensualiteMax > 0) {
    if (r === 0) {
      principalMax = mensualiteMax * n;
    } else {
      const factor = Math.pow(1 + r, n);
      principalMax = (mensualiteMax * (factor - 1)) / (r * factor);
    }
  }
  const budgetTotal = principalMax + apport;
  return {
    mensualiteMax: Math.round(mensualiteMax),
    principalMax: Math.round(principalMax),
    budgetTotal: Math.round(budgetTotal),
  };
}

const DUREE_MIN = 5;
const DUREE_MAX = 30;
const TAUX_MIN = 2;
const TAUX_MAX = 10;

function CapacityCalculator() {
  const { t } = useTranslation();
  const [revenu, setRevenu] = useState(20_000);
  const [charges, setCharges] = useState(2_000);
  const [duree, setDuree] = useState(20);
  const [taux, setTaux] = useState(5.5);
  const [apport, setApport] = useState(300_000);
  const [endettementPct, setEndettementPct] = useState(42);

  const [tauxError, setTauxError] = useState("");
  const [dureeError, setDureeError] = useState("");

  const result = useMemo(
    () =>
      computeBorrowingCapacity({
        revenuMensuel: revenu,
        chargesMensuelles: charges,
        dureeAnnees: duree,
        tauxAnnuel: taux,
        apport,
        tauxEndettement: endettementPct / 100,
      }),
    [revenu, charges, duree, taux, apport, endettementPct]
  );

  return (
    <div className="space-y-4">
      {/* Headline */}
      <motion.div
        key={result.budgetTotal}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-foreground to-foreground/80 text-white p-4 shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          {t("capacity.headline")}
        </p>
        <p className="text-3xl font-display font-bold mt-0.5 tabular-nums">
          {formatMAD(result.budgetTotal)}
        </p>
        <p className="text-xs opacity-80 mt-0.5 tabular-nums">
          {t("capacity.headline_breakdown", {
            loan: formatMAD(result.principalMax),
            down: formatMAD(apport),
          })}
        </p>
      </motion.div>

      {/* Inputs */}
      <div className="space-y-3">
        <CapField label={t("capacity.monthly_income")}>
          <SuffixInput value={revenu} onCommit={setRevenu} suffix="MAD" decimals={0} step={500} />
        </CapField>

        <CapField label={t("capacity.current_charges")}>
          <SuffixInput value={charges} onCommit={setCharges} suffix="MAD" decimals={0} step={250} />
        </CapField>

        <CapField label={t("capacity.down_payment")}>
          <SuffixInput
            value={apport}
            onCommit={setApport}
            suffix="MAD"
            decimals={0}
            step={10_000}
          />
        </CapField>

        <CapField label={t("capacity.duration")}>
          <SuffixInput
            value={duree}
            onCommit={(v) => {
              const r = Math.round(v);
              if (r < DUREE_MIN) {
                setDureeError(t("mortgage.err_min_duration", { years: DUREE_MIN }));
                setDuree(DUREE_MIN);
              } else if (r > DUREE_MAX) {
                setDureeError(t("mortgage.err_max_duration", { years: DUREE_MAX }));
                setDuree(DUREE_MAX);
              } else {
                setDureeError("");
                setDuree(r);
              }
            }}
            suffix={duree > 1 ? t("mortgage.year_other") : t("mortgage.year_one")}
            decimals={0}
            step={1}
          />
          {dureeError && <FieldError msg={dureeError} />}
        </CapField>

        <CapField label={t("capacity.interest_rate")}>
          <SuffixInput
            value={taux}
            onCommit={(v) => {
              if (v < TAUX_MIN) {
                setTauxError(t("mortgage.err_min_rate", { rate: TAUX_MIN }));
                setTaux(TAUX_MIN);
              } else if (v > TAUX_MAX) {
                setTauxError(t("mortgage.err_max_rate", { rate: TAUX_MAX }));
                setTaux(TAUX_MAX);
              } else {
                setTauxError("");
                setTaux(v);
              }
            }}
            suffix="%"
            decimals={2}
            step={0.05}
          />
          {tauxError && <FieldError msg={tauxError} />}
        </CapField>

        <CapField label={t("capacity.debt_ratio")}>
          <SuffixInput
            value={endettementPct}
            onCommit={(v) => setEndettementPct(Math.max(10, Math.min(55, v)))}
            suffix="%"
            decimals={0}
            step={1}
          />
          <p className="text-[11px] text-muted-foreground mt-1">{t("capacity.debt_ratio_hint")}</p>
        </CapField>
      </div>

      <div className="rounded-xl bg-secondary/60 border border-border/40 p-3">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
          {t("capacity.max_monthly")}
        </p>
        <p className="text-base font-display font-bold text-foreground tabular-nums">
          {formatMAD(result.mensualiteMax)}
          <span className="text-sm font-medium text-muted-foreground">
            {t("mortgage.per_month")}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t("capacity.max_monthly_formula", { ratio: endettementPct })}
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <Info size={12} className="shrink-0 mt-0.5" />
        {t("capacity.disclaimer")}
      </p>
    </div>
  );
}

function CapField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground/75 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1 text-[11px] text-destructive mt-1 font-medium">
      <AlertCircle size={11} className="shrink-0" />
      {msg}
    </p>
  );
}

function SuffixInput({
  value,
  onCommit,
  suffix,
  decimals = 0,
  step = 1,
}: {
  value: number;
  onCommit: (v: number) => void;
  suffix: string;
  decimals?: number;
  step?: number;
}) {
  const formatLocal = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
      useGrouping: true,
    }).format(n);

  const [text, setText] = useState(formatLocal(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatLocal(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, focused]);

  const parse = (raw: string) => {
    const cleaned = raw.replace(/\s/g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const commit = () => {
    const n = parse(text);
    if (Number.isFinite(n)) {
      onCommit(n);
      setText(formatLocal(n));
    } else {
      setText(formatLocal(value));
    }
    setFocused(false);
  };

  const stepBy = (delta: number) => {
    const n = parse(text);
    const base = Number.isFinite(n) ? n : value;
    const next = Math.round((base + delta) * 1e6) / 1e6;
    onCommit(next);
    setText(formatLocal(next));
  };

  return (
    <div className="relative flex items-stretch rounded-xl bg-muted/40 border border-border/60 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            stepBy(step);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            stepBy(-step);
          }
        }}
        className="flex-1 bg-transparent px-3 py-2 text-sm font-semibold tabular-nums focus:outline-none"
      />
      <span className="px-3 flex items-center text-xs font-semibold text-muted-foreground bg-muted/30 border-l border-border/40">
        {suffix}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────────────────── */

const whatsappFinancement = `https://wa.me/212653535156?text=${encodeURIComponent(
  "Bonjour WeHome,\n\nJe souhaite être mis(e) en relation avec un partenaire bancaire pour étudier mon financement.\n\nMerci !"
)}`;

const PARTNER_KEYS = [
  {
    labelKey: "financement.profile_cdi",
    durationKey: "financement.profile_cdi_duration",
    descKey: "financement.profile_cdi_desc",
  },
  {
    labelKey: "financement.profile_liberal",
    durationKey: "financement.profile_liberal_duration",
    descKey: "financement.profile_liberal_desc",
  },
  {
    labelKey: "financement.profile_mre",
    durationKey: "financement.profile_mre_duration",
    descKey: "financement.profile_mre_desc",
  },
];

export default function FinancementPage() {
  const { t } = useTranslation();
  const [leadModalCtx, setLeadModalCtx] = useState<"mortgage" | "capacity" | null>(null);
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f3]">
      <Navbar />

      {/* ── Slim header bar — stays above fold ───────────────────────────── */}
      <div className="pt-20 pb-5 bg-white border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-2">
                <Sparkles size={12} />
                {t("common.free_tool")}
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                {t("financement.page_title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{t("financement.page_subtitle")}</p>
            </div>
            <a
              href={whatsappFinancement}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              {t("common.speak_advisor")}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Calculators — visible immediately on load ─────────────────────── */}
      <section className="py-5 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Left: Mortgage calculator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/40">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calculator size={16} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground text-base leading-tight">
                    {t("financement.mortgage_card_title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("financement.mortgage_card_subtitle")}
                  </p>
                </div>
              </div>
              <MortgageCalculator compact />

              <button
                type="button"
                onClick={() => setLeadModalCtx("mortgage")}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Sparkles size={14} />
                {t(
                  "financement.lead_cta_mortgage",
                  "Être mis en relation avec un partenaire bancaire"
                )}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                {t("financement.lead_cta_hint", "Gratuit · Réponse sous 24h · Sans engagement")}
              </p>
            </motion.div>

            {/* Right: Borrowing capacity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/40">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground text-base leading-tight">
                    {t("financement.capacity_card_title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("financement.capacity_card_subtitle")}
                  </p>
                </div>
              </div>
              <CapacityCalculator />

              <button
                type="button"
                onClick={() => setLeadModalCtx("capacity")}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-foreground text-background shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Sparkles size={14} />
                {t("financement.lead_cta_capacity", "Valider ma capacité avec un expert bancaire")}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                {t("financement.lead_cta_hint", "Gratuit · Réponse sous 24h · Sans engagement")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Profils ───────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground text-center mb-8">
            {t("financement.profiles_title")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {PARTNER_KEYS.map((p) => (
              <div
                key={p.labelKey}
                className="bg-[#f6f5f3] border border-border/50 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm">{t(p.labelKey)}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{t(p.durationKey)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(p.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {t("financement.cta_title")}
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {t("financement.cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <a
              href={whatsappFinancement}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {t("common.speak_advisor")}
              <ArrowRight size={18} />
            </a>
            <Link
              href="/biens"
              className="px-6 py-3.5 rounded-full font-bold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              {t("common.see_properties")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <FinancementLeadModal
        open={leadModalCtx !== null}
        context={leadModalCtx}
        onClose={() => setLeadModalCtx(null)}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Lead capture modal — opened from the calculators' CTA.
 * Submits to Supabase `leads` table with source identifying the calculator.
 * ────────────────────────────────────────────────────────────────────────── */

const PROFILE_OPTIONS = [
  { value: "Salarié CDI", labelKey: "financement.modal_profile_cdi", fallback: "Salarié CDI" },
  {
    value: "Salarié CDD / Stage",
    labelKey: "financement.modal_profile_cdd",
    fallback: "Salarié CDD / Stage",
  },
  {
    value: "Profession libérale",
    labelKey: "financement.modal_profile_liberal",
    fallback: "Profession libérale",
  },
  {
    value: "Chef d'entreprise",
    labelKey: "financement.modal_profile_chef",
    fallback: "Chef d'entreprise",
  },
  {
    value: "MRE",
    labelKey: "financement.modal_profile_mre",
    fallback: "Marocain résident à l'étranger",
  },
  { value: "Autre", labelKey: "financement.modal_profile_other", fallback: "Autre" },
];

function FinancementLeadModal({
  open,
  context,
  onClose,
}: {
  open: boolean;
  context: "mortgage" | "capacity" | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lock body scroll while modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Reset form on close
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setNom("");
        setTelephone("");
        setEmail("");
        setProfile("");
        setBudget("");
        setMessage("");
        setSuccess(false);
        setSubmitError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const contextLabel =
    context === "mortgage"
      ? fallback("financement.modal_ctx_mortgage", "Simulation mensualité")
      : fallback("financement.modal_ctx_capacity", "Capacité d'emprunt");

  const isValid = (): string | null => {
    if (!nom.trim()) return fallback("financement.modal_err_name", "Merci d'indiquer votre nom.");
    if (!/^[+\d][\d\s-]{6,}$/.test(telephone))
      return fallback("financement.modal_err_phone", "Téléphone invalide.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return fallback("financement.modal_err_email", "Email invalide.");
    if (!profile)
      return fallback("financement.modal_err_profile", "Merci de choisir votre profil.");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v = isValid();
    if (v) {
      setSubmitError(v);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: nom.trim(),
        phone: telephone.trim(),
        email: email.trim(),
        notes: [
          `Outil : ${contextLabel}`,
          `Profil : ${profile}`,
          budget ? `Budget visé : ${budget} MAD` : null,
          message ? `Message : ${message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: `Financement — ${contextLabel}`,
        status: "New",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `${fallback("financement.modal_err_prefix", "Erreur :")} ${err.message}`
          : fallback("financement.modal_err_generic", "Une erreur est survenue. Réessayez.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border/40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors z-10"
              aria-label={fallback("financement.modal_close", "Fermer")}
            >
              <X size={16} />
            </button>

            {success ? (
              /* ── Success ── */
              <div className="p-8 md:p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {fallback("financement.modal_success_title", "Demande reçue.")}
                </h2>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
                  {fallback(
                    "financement.modal_success_body",
                    "Notre partenaire bancaire vous contacte sous 24h pour étudier votre dossier en toute confidentialité."
                  )}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded-full font-semibold text-sm bg-foreground text-background hover:-translate-y-0.5 transition-all"
                >
                  {fallback("financement.modal_close_cta", "Fermer")}
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="p-6 md:p-8 border-b border-border/40">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Sparkles size={11} />
                    {contextLabel}
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                    {fallback(
                      "financement.modal_title",
                      "Être contacté par un partenaire bancaire"
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {fallback(
                      "financement.modal_subtitle",
                      "Laissez vos coordonnées : un expert bancaire vous appelle sous 24h pour étudier votre dossier."
                    )}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                  <ModalField
                    label={fallback("financement.modal_name", "Nom complet")}
                    required
                    icon={<UserIcon size={14} />}
                  >
                    <ModalInput
                      value={nom}
                      onChange={setNom}
                      placeholder={fallback("financement.modal_name_placeholder", "Prénom Nom")}
                    />
                  </ModalField>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <ModalField
                      label={fallback("financement.modal_phone", "Téléphone")}
                      required
                      icon={<Phone size={14} />}
                    >
                      <ModalInput
                        type="tel"
                        value={telephone}
                        onChange={setTelephone}
                        placeholder="+212 6 XX XX XX XX"
                      />
                    </ModalField>
                    <ModalField
                      label={fallback("financement.modal_email", "Email")}
                      required
                      icon={<Mail size={14} />}
                    >
                      <ModalInput
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="vous@email.ma"
                      />
                    </ModalField>
                  </div>

                  <ModalField
                    label={fallback("financement.modal_profile_label", "Profil professionnel")}
                    required
                    icon={<Briefcase size={14} />}
                  >
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-muted/40 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all appearance-none"
                    >
                      <option value="">
                        {fallback("financement.modal_profile_placeholder", "Choisir...")}
                      </option>
                      {PROFILE_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {fallback(p.labelKey, p.fallback)}
                        </option>
                      ))}
                    </select>
                  </ModalField>

                  <ModalField
                    label={fallback("financement.modal_budget", "Budget visé (MAD) — optionnel")}
                  >
                    <ModalInput
                      type="number"
                      inputMode="numeric"
                      value={budget}
                      onChange={setBudget}
                      placeholder={fallback(
                        "financement.modal_budget_placeholder",
                        "Ex: 1 500 000"
                      )}
                    />
                  </ModalField>

                  <ModalField label={fallback("financement.modal_message", "Message — optionnel")}>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={fallback(
                        "financement.modal_message_placeholder",
                        "Détails utiles : type de bien, délai, situation particulière..."
                      )}
                      rows={3}
                      className="w-full px-3 py-3 rounded-xl bg-muted/40 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none"
                    />
                  </ModalField>

                  {submitError && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-3 flex items-start gap-2 text-xs text-destructive">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {fallback("financement.modal_submitting", "Envoi...")}
                      </>
                    ) : (
                      <>
                        {fallback("financement.modal_submit", "Recevoir un appel sous 24h")}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {fallback(
                      "financement.modal_consent",
                      "En validant, vous acceptez d'être recontacté par WeHome et nos partenaires bancaires. Données confidentielles, jamais revendues."
                    )}
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalField({
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
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
        {icon && <span className="text-primary/70">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalInput({
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
      className="w-full px-3 py-3 rounded-xl bg-muted/40 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
    />
  );
}
