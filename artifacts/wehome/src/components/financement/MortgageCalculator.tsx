import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Info, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatMAD } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────────
 * Mortgage maths
 *   M = P · r · (1+r)^n / ((1+r)^n − 1)
 *     P = principal (montant emprunté)
 *     r = monthly rate (annual / 12)
 *     n = number of months
 * ────────────────────────────────────────────────────────────────────────── */

export interface MortgageInputs {
  prix: number;
  apport: number;
  dureeAnnees: number;
  tauxAnnuel: number;
}

export interface MortgageResult {
  montantEmprunte: number;
  mensualite: number;
  totalInterets: number;
  coutTotal: number;
  apportPct: number;
  fraisNotaireEstime: number;
}

export function computeMortgage(inputs: MortgageInputs): MortgageResult {
  const { prix, apport, dureeAnnees, tauxAnnuel } = inputs;
  const montantEmprunte = Math.max(0, prix - apport);
  const n = Math.max(1, Math.round(dureeAnnees * 12));
  const r = tauxAnnuel / 100 / 12;
  let mensualite = 0;
  if (montantEmprunte > 0) {
    if (r === 0) {
      mensualite = montantEmprunte / n;
    } else {
      const factor = Math.pow(1 + r, n);
      mensualite = (montantEmprunte * r * factor) / (factor - 1);
    }
  }
  const coutTotal = mensualite * n;
  const totalInterets = Math.max(0, coutTotal - montantEmprunte);
  const apportPct = prix > 0 ? (apport / prix) * 100 : 0;
  // Maroc ≈ 6,5 % (notaire + conservation foncière + droits + honoraires)
  const fraisNotaireEstime = prix * 0.065;
  return { montantEmprunte, mensualite, totalInterets, coutTotal, apportPct, fraisNotaireEstime };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────────────────────── */

interface Props {
  initialPrix?: number;
  initialApportPct?: number;
  initialDuree?: number;
  initialTaux?: number;
  /** Hides the internal Calculator icon header (use when the parent has its own title) */
  compact?: boolean;
}

const PRIX_MIN = 100_000;
const TAUX_MIN = 2;
const TAUX_MAX = 10;
const DUREE_MIN = 5;
const DUREE_MAX = 30;

export function MortgageCalculator({
  initialPrix = 1_500_000,
  initialApportPct = 20,
  initialDuree = 20,
  initialTaux = 5.5,
  compact = false,
}: Props) {
  const { t } = useTranslation();
  const [prix, setPrix] = useState(initialPrix);
  const [apport, setApport] = useState(Math.round((initialPrix * initialApportPct) / 100));
  const [duree, setDuree] = useState(initialDuree);
  const [taux, setTaux] = useState(initialTaux);

  // Validation errors
  const [prixError, setPrixError] = useState("");
  const [tauxError, setTauxError] = useState("");
  const [dureeError, setDureeError] = useState("");

  // If the parent prix changes (user opens a different bien), keep the same %
  useEffect(() => {
    setPrix(initialPrix);
    setApport(Math.round((initialPrix * initialApportPct) / 100));
  }, [initialPrix, initialApportPct]);

  // Cap apport at prix
  useEffect(() => {
    if (apport > prix) setApport(prix);
  }, [prix, apport]);

  const result = useMemo(
    () => computeMortgage({ prix, apport, dureeAnnees: duree, tauxAnnuel: taux }),
    [prix, apport, duree, taux]
  );

  const apportPctValue = prix > 0 ? Math.round((apport / prix) * 10000) / 100 : 0;

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">
              {t("mortgage.header_title")}
            </h3>
            <p className="text-xs text-muted-foreground">{t("mortgage.header_subtitle")}</p>
          </div>
        </div>
      )}

      {/* Headline mensualité */}
      <motion.div
        key={Math.round(result.mensualite)}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white p-4 shadow-md shadow-primary/20"
      >
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          {t("mortgage.monthly_estimate")}
        </p>
        <p className="text-3xl font-display font-bold mt-0.5 tabular-nums">
          {formatMAD(Math.round(result.mensualite))}
          <span className="text-sm font-medium opacity-90">{t("mortgage.per_month")}</span>
        </p>
        <p className="text-xs opacity-80 mt-0.5 tabular-nums">
          {t("mortgage.over_years", { count: duree, rate: taux.toFixed(2) })}
        </p>
      </motion.div>

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Prix du bien */}
        <Field label={t("mortgage.price")}>
          <SuffixInput
            value={prix}
            onCommit={(v) => {
              if (v < PRIX_MIN) {
                setPrixError(t("mortgage.err_min_price", { amount: formatMAD(PRIX_MIN) }));
                setPrix(PRIX_MIN);
              } else {
                setPrixError("");
                setPrix(v);
              }
            }}
            suffix="MAD"
            decimals={0}
            step={10_000}
          />
          {prixError && <FieldError msg={prixError} />}
        </Field>

        {/* Mise de fonds — dual input (% + MAD) */}
        <Field label={t("mortgage.down_payment")}>
          <div className="grid grid-cols-2 gap-2">
            <SuffixInput
              value={apportPctValue}
              onCommit={(pct) => {
                const clamped = Math.min(100, Math.max(0, pct));
                setApport(Math.round((prix * clamped) / 100));
              }}
              suffix="%"
              decimals={2}
              step={0.5}
            />
            <SuffixInput
              value={apport}
              onCommit={(v) => setApport(Math.min(prix, Math.max(0, v)))}
              suffix="MAD"
              decimals={0}
              step={10_000}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {t("mortgage.down_payment_hint")}
          </p>
        </Field>

        {/* Durée */}
        <Field label={t("mortgage.duration")}>
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
        </Field>

        {/* Taux */}
        <Field label={t("mortgage.interest_rate")}>
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
          {!tauxError && (
            <p className="text-[11px] text-muted-foreground mt-1">
              {t("mortgage.interest_rate_hint")}
            </p>
          )}
        </Field>
      </div>

      {/* ── Résumé ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <SummaryTile
          label={t("mortgage.loan_amount")}
          value={formatMAD(Math.round(result.montantEmprunte))}
        />
        <SummaryTile
          label={t("mortgage.total_interest")}
          value={formatMAD(Math.round(result.totalInterets))}
        />
        <SummaryTile
          label={t("mortgage.monthly_estimate")}
          value={`${formatMAD(Math.round(result.mensualite))}${t("mortgage.per_month")}`}
          highlight
        />
        <SummaryTile
          label={t("mortgage.total_cost")}
          value={formatMAD(Math.round(result.coutTotal))}
        />
        {!compact && (
          <SummaryTile
            label={t("mortgage.acquisition_fees")}
            value={formatMAD(Math.round(result.fraisNotaireEstime))}
            hint={t("mortgage.acquisition_fees_hint")}
          />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <Info size={12} className="shrink-0 mt-0.5" />
        {t("mortgage.disclaimer")}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

/**
 * SuffixInput — typed numeric input with a trailing unit (%, MAD, ans…).
 */
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

function SummaryTile({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${highlight ? "bg-primary/8 border-primary/25" : "bg-secondary/60 border-border/40"}`}
    >
      <p
        className={`text-[10px] uppercase tracking-wide font-semibold ${highlight ? "text-primary/70" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-display font-bold mt-0.5 tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
