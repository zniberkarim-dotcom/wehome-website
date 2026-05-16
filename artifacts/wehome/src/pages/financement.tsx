import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MortgageCalculator } from "@/components/financement/MortgageCalculator";
import { formatMAD } from "@/lib/utils";

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
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Budget total accessible</p>
        <p className="text-3xl font-display font-bold mt-0.5 tabular-nums">
          {formatMAD(result.budgetTotal)}
        </p>
        <p className="text-xs opacity-80 mt-0.5 tabular-nums">
          Emprunt {formatMAD(result.principalMax)} + apport {formatMAD(apport)}
        </p>
      </motion.div>

      {/* Inputs */}
      <div className="space-y-3">
        <CapField label="Revenu mensuel net">
          <SuffixInput value={revenu} onCommit={setRevenu} suffix="MAD" decimals={0} step={500} />
        </CapField>

        <CapField label="Charges / crédits en cours">
          <SuffixInput value={charges} onCommit={setCharges} suffix="MAD" decimals={0} step={250} />
        </CapField>

        <CapField label="Apport personnel">
          <SuffixInput value={apport} onCommit={setApport} suffix="MAD" decimals={0} step={10_000} />
        </CapField>

        <CapField label="Durée du crédit">
          <SuffixInput
            value={duree}
            onCommit={(v) => {
              const r = Math.round(v);
              if (r < DUREE_MIN) { setDureeError(`Durée minimum : ${DUREE_MIN} ans`); setDuree(DUREE_MIN); }
              else if (r > DUREE_MAX) { setDureeError(`Durée maximum : ${DUREE_MAX} ans`); setDuree(DUREE_MAX); }
              else { setDureeError(""); setDuree(r); }
            }}
            suffix={duree > 1 ? "ans" : "an"}
            decimals={0}
            step={1}
          />
          {dureeError && <FieldError msg={dureeError} />}
        </CapField>

        <CapField label="Taux d'intérêt annuel">
          <SuffixInput
            value={taux}
            onCommit={(v) => {
              if (v < TAUX_MIN) { setTauxError(`Taux minimum : ${TAUX_MIN} %`); setTaux(TAUX_MIN); }
              else if (v > TAUX_MAX) { setTauxError(`Taux maximum : ${TAUX_MAX} %`); setTaux(TAUX_MAX); }
              else { setTauxError(""); setTaux(v); }
            }}
            suffix="%"
            decimals={2}
            step={0.05}
          />
          {tauxError && <FieldError msg={tauxError} />}
        </CapField>

        <CapField label="Taux d'endettement maximum">
          <SuffixInput
            value={endettementPct}
            onCommit={(v) => setEndettementPct(Math.max(10, Math.min(55, v)))}
            suffix="%"
            decimals={0}
            step={1}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Standard au Maroc : 40–45 % (varie selon la banque).
          </p>
        </CapField>
      </div>

      <div className="rounded-xl bg-secondary/60 border border-border/40 p-3">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Mensualité maximale</p>
        <p className="text-base font-display font-bold text-foreground tabular-nums">
          {formatMAD(result.mensualiteMax)}
          <span className="text-sm font-medium text-muted-foreground">/mois</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          (revenu × {endettementPct} %) − charges actuelles
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <Info size={12} className="shrink-0 mt-0.5" />
        Estimation indicative. Les banques marocaines ajustent selon votre profil (CDI, ancienneté, garanties).
      </p>
    </div>
  );
}

function CapField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground/75 mb-1.5 uppercase tracking-wide">{label}</label>
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

const PARTNERS = [
  { label: "CDI / fonctionnaire", duration: "Jusqu'à 25 ans", desc: "Conditions premium" },
  { label: "Profession libérale", duration: "Jusqu'à 20 ans", desc: "Études personnalisées" },
  { label: "MRE", duration: "Jusqu'à 25 ans", desc: "Crédit Sakane / Damane" },
];

export default function FinancementPage() {
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
                Outil gratuit
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                Simulez votre financement immobilier
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Mensualité, capacité d'emprunt et frais d'acquisition — mis à jour en temps réel.
              </p>
            </div>
            <a
              href={whatsappFinancement}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              Parler à un conseiller
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
                  <h2 className="font-display font-bold text-foreground text-base leading-tight">Calculateur de mensualité</h2>
                  <p className="text-xs text-muted-foreground">Combien va me coûter mon crédit ?</p>
                </div>
              </div>
              <MortgageCalculator compact />
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
                  <h2 className="font-display font-bold text-foreground text-base leading-tight">Capacité d'emprunt</h2>
                  <p className="text-xs text-muted-foreground">Quel budget puis-je viser ?</p>
                </div>
              </div>
              <CapacityCalculator />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Profils ───────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground text-center mb-8">
            Conditions selon votre profil
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {PARTNERS.map((p) => (
              <div
                key={p.label}
                className="bg-[#f6f5f3] border border-border/50 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm">{p.label}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{p.duration}</p>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Besoin d'un coup de pouce pour votre dossier ?
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Nos conseillers vous mettent en relation avec les meilleurs partenaires bancaires du Maroc.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <a
              href={whatsappFinancement}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Parler à un conseiller
              <ArrowRight size={18} />
            </a>
            <Link
              href="/biens"
              className="px-6 py-3.5 rounded-full font-bold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Voir les biens disponibles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
