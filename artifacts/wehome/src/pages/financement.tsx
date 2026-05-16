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
  tauxEndettement: number; // 0..1
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

function CapacityCalculator() {
  const [revenu, setRevenu] = useState(20_000);
  const [charges, setCharges] = useState(2_000);
  const [duree, setDuree] = useState(20);
  const [taux, setTaux] = useState(5.5);
  const [apport, setApport] = useState(300_000);
  const [endettementPct, setEndettementPct] = useState(42); // % (milieu de la fourchette 40-45)

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">Capacité d'emprunt</h3>
          <p className="text-xs text-muted-foreground">Quel budget puis-je viser ?</p>
        </div>
      </div>

      {/* Headline */}
      <motion.div
        key={result.budgetTotal}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-white p-5 shadow-lg"
      >
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Budget total accessible</p>
        <p className="text-3xl md:text-4xl font-display font-bold mt-1 tabular-nums">
          {formatMAD(result.budgetTotal)}
        </p>
        <p className="text-xs opacity-90 mt-1 tabular-nums">
          Emprunt {formatMAD(result.principalMax)} + apport {formatMAD(apport)}
        </p>
      </motion.div>

      {/* Inputs */}
      <div className="space-y-4">
        <CapField label="Revenu mensuel net">
          <SuffixInput value={revenu} onCommit={setRevenu} suffix="MAD" decimals={0} step={500} />
        </CapField>

        <CapField label="Charges / crédits en cours (par mois)">
          <SuffixInput value={charges} onCommit={setCharges} suffix="MAD" decimals={0} step={250} />
        </CapField>

        <CapField label="Apport personnel">
          <SuffixInput value={apport} onCommit={setApport} suffix="MAD" decimals={0} step={10_000} />
        </CapField>

        <CapField label="Durée du crédit">
          <SuffixInput
            value={duree}
            onCommit={(v) => setDuree(Math.min(30, Math.max(1, Math.round(v))))}
            suffix={duree > 1 ? "ans" : "an"}
            decimals={0}
            step={1}
          />
        </CapField>

        <CapField label="Taux d'intérêt annuel">
          <SuffixInput
            value={taux}
            onCommit={(v) => setTaux(Math.max(0, Math.min(20, v)))}
            suffix="%"
            decimals={2}
            step={0.05}
          />
        </CapField>

        <CapField label="Taux d'endettement maximum">
          <SuffixInput
            value={endettementPct}
            onCommit={(v) => setEndettementPct(Math.max(10, Math.min(55, v)))}
            suffix="%"
            decimals={0}
            step={1}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Standard bancaire au Maroc : 40-45 % (varie selon la banque et le profil emprunteur).
          </p>
        </CapField>
      </div>

      <div className="rounded-xl bg-secondary/60 border border-border/40 p-4">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Mensualité maximale</p>
        <p className="text-lg font-display font-bold text-foreground tabular-nums">
          {formatMAD(result.mensualiteMax)}
          <span className="text-sm font-medium text-muted-foreground">/mois</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
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
      <label className="block text-sm font-semibold text-foreground/85 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

/**
 * SuffixInput — typed numeric input with trailing unit. Mirrors the one in
 * MortgageCalculator. Kept private here so the page stays self-contained.
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
        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-semibold tabular-nums focus:outline-none"
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-br from-primary via-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white_0%,transparent_50%),radial-gradient(circle_at_80%_70%,white_0%,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-5">
              <Sparkles size={14} />
              Outil gratuit
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Calculez le financement de votre futur logement
            </h1>
            <p className="text-lg md:text-xl mt-5 opacity-95 leading-relaxed">
              Mensualité, capacité d'emprunt, frais d'acquisition. Anticipez votre projet immobilier en quelques secondes — puis discutez-en avec nos partenaires bancaires.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculators */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground text-xl">Calculateur de mensualité</h2>
                  <p className="text-xs text-muted-foreground">Combien va me coûter mon crédit ?</p>
                </div>
              </div>
              <MortgageCalculator />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <CapacityCalculator />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Profils */}
      <section className="py-12 bg-secondary/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">
            Conditions selon votre profil
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {PARTNERS.map((p) => (
              <div
                key={p.label}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-display font-bold text-foreground">{p.label}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{p.duration}</p>
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Besoin d'un coup de pouce pour votre dossier ?
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            Nos conseillers vous mettent en relation avec les meilleurs partenaires bancaires du Maroc pour obtenir le taux le plus compétitif.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
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
