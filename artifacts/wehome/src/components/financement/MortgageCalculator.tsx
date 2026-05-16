import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Info } from "lucide-react";
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
  compact?: boolean;
}

export function MortgageCalculator({
  initialPrix = 1_500_000,
  initialApportPct = 20,
  initialDuree = 20,
  initialTaux = 5.5,
  compact = false,
}: Props) {
  const [prix, setPrix] = useState(initialPrix);
  // Apport is tracked in MAD; the % field is a derived view that the user can
  // edit directly. Editing % updates apport; editing apport-MAD updates apport.
  const [apport, setApport] = useState(Math.round((initialPrix * initialApportPct) / 100));
  const [duree, setDuree] = useState(initialDuree);
  const [taux, setTaux] = useState(initialTaux);

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

  // % shown in the field. We compute from current apport/prix so the field
  // stays in lockstep when MAD is edited.
  const apportPctValue = prix > 0 ? Math.round((apport / prix) * 10000) / 100 : 0;

  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">Calculateur hypothécaire</h3>
            <p className="text-xs text-muted-foreground">Saisissez vos paramètres pour estimer votre mensualité</p>
          </div>
        </div>
      )}

      {/* Headline mensualité */}
      <motion.div
        key={Math.round(result.mensualite)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-5 shadow-lg shadow-primary/20"
      >
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Mensualité estimée</p>
        <p className="text-3xl md:text-4xl font-display font-bold mt-1 tabular-nums">
          {formatMAD(Math.round(result.mensualite))}
          <span className="text-base font-medium opacity-90">/mois</span>
        </p>
        <p className="text-xs opacity-90 mt-1 tabular-nums">
          sur {duree} {duree > 1 ? "ans" : "an"} · taux {taux.toFixed(2)} %
        </p>
      </motion.div>

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Prix du bien */}
        <Field label="Prix du bien">
          <SuffixInput
            value={prix}
            onCommit={(v) => setPrix(Math.max(0, v))}
            suffix="MAD"
            decimals={0}
            step={10_000}
          />
        </Field>

        {/* Mise de fonds — dual input (% + MAD) that stay in sync */}
        <Field label="Mise de fonds (apport)">
          <div className="grid grid-cols-2 gap-3">
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
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Modifiez le % ou le montant — l'autre champ se met à jour.
          </p>
        </Field>

        {/* Durée */}
        <Field label="Durée du crédit">
          <SuffixInput
            value={duree}
            onCommit={(v) => setDuree(Math.min(30, Math.max(1, Math.round(v))))}
            suffix={duree > 1 ? "ans" : "an"}
            decimals={0}
            step={1}
          />
        </Field>

        {/* Taux */}
        <Field label="Taux d'intérêt annuel">
          <SuffixInput
            value={taux}
            onCommit={(v) => setTaux(Math.max(0, Math.min(20, v)))}
            suffix="%"
            decimals={2}
            step={0.05}
          />
        </Field>
      </div>

      {/* ── Résumé ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryTile label="Montant emprunté" value={formatMAD(Math.round(result.montantEmprunte))} />
        <SummaryTile label="Total des intérêts" value={formatMAD(Math.round(result.totalInterets))} />
        <SummaryTile label="Mensualité estimée" value={`${formatMAD(Math.round(result.mensualite))}/mois`} highlight />
        <SummaryTile label="Coût total du crédit" value={formatMAD(Math.round(result.coutTotal))} />
        {!compact && (
          <SummaryTile
            label="Frais d'acquisition (~6,5 %)"
            value={formatMAD(Math.round(result.fraisNotaireEstime))}
            hint="Notaire, conservation, droits"
          />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <Info size={12} className="shrink-0 mt-0.5" />
        Estimation indicative. Le taux et les conditions définitives dépendent de votre dossier bancaire (revenus, durée, garanties). WeHome peut vous mettre en relation avec ses partenaires bancaires.
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
      <label className="block text-sm font-semibold text-foreground/85 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

/**
 * SuffixInput — typed numeric input with a trailing unit (%, MAD, ans…).
 * Keeps a local string buffer so users can clear the field, type freely,
 * use decimals, etc. Commits on blur or Enter so derived state stays clean.
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

  // Re-sync from outside when not actively typing
  useEffect(() => {
    if (!focused) setText(formatLocal(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, focused]);

  const parse = (raw: string) => {
    // Accept "1 500 000", "1500000", "5,5", "5.5"
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
      // Revert to last good value
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
          // Select-all on focus → faster overwrite
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
        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-semibold tabular-nums focus:outline-none"
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
    <div className={`rounded-xl border p-3 ${highlight ? "bg-primary/8 border-primary/25" : "bg-secondary/60 border-border/40"}`}>
      <p className={`text-[11px] uppercase tracking-wide font-semibold ${highlight ? "text-primary/70" : "text-muted-foreground"}`}>{label}</p>
      <p className={`text-sm font-display font-bold mt-0.5 tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
