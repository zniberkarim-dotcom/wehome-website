import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProperties, getPropertyImageUrls } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Award,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid,
  Zap,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatMAD } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { useSwipe } from "@/hooks/useSwipe";

/* ────────────────────────────────────────────────────────────────────────────
 * Pépite du Mois — "0 frais d'agence pendant 48h" signature concept.
 *
 * Karim updates PEPITE_DEAL_START once per month when launching the new pépite.
 * The countdown + urgency state derive automatically from that single date.
 *
 * Format: ISO 8601 with timezone (Morocco = +01:00). The 48h window starts at
 * this exact moment. Set it slightly in the future to build anticipation,
 * or at "now" to launch the deal immediately.
 * ────────────────────────────────────────────────────────────────────────── */

const PEPITE_DEAL_START_ISO = "2026-07-01T09:00:00+01:00";
const PEPITE_DEAL_DURATION_MS = 48 * 60 * 60 * 1000; // 48h
const PEPITE_OFFER_LABEL = "0 frais d'agence"; // change to e.g. "−10% exceptionnel" if you alternate offers

const PEPITE_DEAL_START = new Date(PEPITE_DEAL_START_ISO);
const PEPITE_DEAL_END = new Date(PEPITE_DEAL_START.getTime() + PEPITE_DEAL_DURATION_MS);

type DealState = "live" | "upcoming" | "finished";

function computeDealState(now: Date): { state: DealState; targetMs: number; targetDate: Date } {
  if (now < PEPITE_DEAL_START) {
    return { state: "upcoming", targetMs: PEPITE_DEAL_START.getTime() - now.getTime(), targetDate: PEPITE_DEAL_START };
  }
  if (now < PEPITE_DEAL_END) {
    return { state: "live", targetMs: PEPITE_DEAL_END.getTime() - now.getTime(), targetDate: PEPITE_DEAL_END };
  }
  // Deal finished — show "next pépite" countdown to the 1st of next month at 9am
  const next = new Date(now);
  next.setMonth(now.getMonth() + 1);
  next.setDate(1);
  next.setHours(9, 0, 0, 0);
  return { state: "finished", targetMs: next.getTime() - now.getTime(), targetDate: next };
}

function breakdown(ms: number) {
  const total = Math.max(0, ms);
  const days = Math.floor(total / (24 * 60 * 60 * 1000));
  const hours = Math.floor((total % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((total % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((total % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return computeDealState(now);
}

export function PepiteDuMois() {
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: fetchFeaturedProperties,
  });

  const pepite = properties[0];
  const imageUrls = pepite ? getPropertyImageUrls(pepite) : [];
  const validCount = imageUrls.length - failedIndexes.size;
  const hasImages = validCount > 0;
  const hasMultiple = validCount > 1;

  const { state, targetMs, targetDate } = useCountdown();
  const { days, hours, minutes, seconds } = breakdown(targetMs);

  const goNextIndex = useCallback(() => setCurrentIndex((p) => (p + 1) % imageUrls.length), [imageUrls.length]);
  const goPrevIndex = useCallback(() => setCurrentIndex((p) => (p - 1 + imageUrls.length) % imageUrls.length), [imageUrls.length]);
  const goNext = useCallback((e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goNextIndex(); }, [goNextIndex]);
  const goPrev = useCallback((e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goPrevIndex(); }, [goPrevIndex]);
  const { onTouchStart, onTouchEnd } = useSwipe(goNextIndex, goPrevIndex);
  const handleImgError = useCallback((index: number) => setFailedIndexes((prev) => new Set(prev).add(index)), []);

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!pepite) return null;

  const hasPrice = pepite.price > 0;
  const showRooms = pepite.rooms !== undefined && pepite.rooms > 0;

  // ─── Per-state visual config ─────────────────────────────────────────────
  const stateConfig = {
    live: {
      bannerBg: "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700",
      bannerPulse: true,
      badgeLabel: "DEAL ACTIF",
      headline: `${PEPITE_OFFER_LABEL.toUpperCase()} · 48H SEULEMENT`,
      subline: "Saisissez cette opportunité avant la fin du compte à rebours",
      ribbon: PEPITE_OFFER_LABEL,
      ribbonColor: "bg-red-600 text-white",
      countdownLabel: "Fin du deal dans",
      ctaLabel: "Réserver ma visite avant la fin",
      ctaClass: "bg-red-600 text-white hover:bg-red-700 shadow-2xl shadow-red-600/30",
    },
    upcoming: {
      bannerBg: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700",
      bannerPulse: false,
      badgeLabel: "BIENTÔT",
      headline: `${PEPITE_OFFER_LABEL} arrive bientôt`,
      subline: "Soyez prévenu·e au lancement du deal",
      ribbon: "À venir",
      ribbonColor: "bg-blue-600 text-white",
      countdownLabel: "Lancement du deal dans",
      ctaLabel: "Être prévenu·e au lancement",
      ctaClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30",
    },
    finished: {
      bannerBg: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700",
      bannerPulse: false,
      badgeLabel: "ANNONCE EXCLUSIVE",
      headline: "Le deal du mois est terminé",
      subline: `Prochain ${PEPITE_OFFER_LABEL} dans ${formatDuration(targetMs)}`,
      ribbon: "Exclusivité",
      ribbonColor: "bg-amber-600 text-white",
      countdownLabel: "Prochaine Pépite dans",
      ctaLabel: "Découvrir la Pépite",
      ctaClass: "bg-foreground text-background hover:bg-primary shadow-xl",
    },
  }[state];

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Section heading ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600">
            <Award size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            La Pépite du Mois
          </h2>
        </div>

        {/* ─── Top urgency banner ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-2xl ${stateConfig.bannerBg} text-white p-5 md:p-6 mb-6 shadow-lg`}
        >
          {/* Subtle animated overlay for live state */}
          {stateConfig.bannerPulse && (
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_40%),radial-gradient(circle_at_80%_50%,white_0%,transparent_40%)] animate-pulse pointer-events-none" />
          )}

          <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            {/* Left: headline + badge */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Zap size={11} className="text-yellow-200" />
                {stateConfig.badgeLabel}
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold leading-tight">
                {stateConfig.headline}
              </p>
              <p className="text-sm md:text-base opacity-90 mt-1.5 leading-snug">
                {stateConfig.subline}
              </p>
            </div>

            {/* Right: countdown */}
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-2 md:text-right">
                {stateConfig.countdownLabel}
              </p>
              <div className="flex gap-1.5 md:gap-2">
                <CountdownBox value={days} label="Jours" />
                <CountdownBox value={hours} label="Heures" />
                <CountdownBox value={minutes} label="Min" />
                <CountdownBox value={seconds} label="Sec" highlight={state === "live"} />
              </div>
              <p className="text-[11px] opacity-80 mt-2 text-right flex items-center gap-1 justify-end">
                <Calendar size={11} />
                {state === "live"
                  ? `Fin le ${formatDate(targetDate)}`
                  : state === "upcoming"
                  ? `Début le ${formatDate(targetDate)}`
                  : `Reprise le ${formatDate(targetDate)}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Main card ────────────────────────────────────────────────── */}
        <div className="bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-2xl flex flex-col lg:flex-row">

          {/* Image carousel */}
          <div
            className={`group w-full lg:w-3/5 relative min-h-[400px] lg:min-h-[600px] ${!hasImages ? 'bg-slate-100' : ''}`}
            onTouchStart={hasMultiple ? onTouchStart : undefined}
            onTouchEnd={hasMultiple ? onTouchEnd : undefined}
          >
            {hasImages ? (
              <>
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${pepite.title} - Photo ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    onError={() => handleImgError(i)}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                ))}
                {hasMultiple && (
                  <>
                    <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                      <ChevronLeft size={22} />
                    </button>
                    <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                      <ChevronRight size={22} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {imageUrls.map((_, i) => (
                        <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }} className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-white w-5 shadow-md' : 'bg-white/60 hover:bg-white/80'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img
                src={`${import.meta.env.BASE_URL}images/pepite.png`}
                alt="La Pépite du Mois"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden pointer-events-none" />

            {/* Offer ribbon — diagonal across the corner */}
            <div className={`absolute top-6 left-6 px-4 py-2 ${stateConfig.ribbonColor} font-bold rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 z-10`}>
              {state === "live" ? <Zap size={16} /> : <Sparkles size={16} />}
              <span className="text-sm">{stateConfig.ribbon}</span>
            </div>

            {/* Bottom-left highlight: "Pépite du Mois" badge */}
            <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 z-10">
              <Award size={12} className="text-amber-300" />
              Pépite du Mois
            </div>
          </div>

          {/* Right column: details */}
          <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-primary font-bold tracking-wider uppercase text-xs">Annonce Exclusive</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">{pepite.transaction}</span>
                  {state === "live" && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <Zap size={9} />
                      Deal actif
                    </span>
                  )}
                </div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                  {pepite.title}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-6">
                  <MapPin size={20} className="shrink-0 mt-1" />
                  <span className="text-lg">{pepite.location}</span>
                </div>
                <div className="text-4xl font-display font-bold text-primary mb-2">
                  {hasPrice ? formatMAD(pepite.price) : (pepite.priceLabel || "Prix sur demande")}
                </div>
                {state === "live" && hasPrice && (
                  <p className="text-sm text-red-700 font-semibold flex items-center gap-1.5">
                    <Sparkles size={13} />
                    {PEPITE_OFFER_LABEL} si vous validez avant la fin du compte à rebours
                  </p>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 text-base line-clamp-4">
                {pepite.description}
              </p>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/80 mb-8">
                {pepite.beds ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bed size={20} />
                    </div>
                    <span className="font-semibold">{pepite.beds} Ch.</span>
                  </div>
                ) : showRooms ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <LayoutGrid size={20} />
                    </div>
                    <span className="font-semibold">{pepite.rooms} p.</span>
                  </div>
                ) : null}
                {pepite.baths ? (
                  <div className="flex flex-col items-center justify-center gap-2 border-x border-border/80">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bath size={20} />
                    </div>
                    <span className="font-semibold">{pepite.baths} SdB</span>
                  </div>
                ) : null}
                {pepite.surface > 0 && (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Square size={20} />
                    </div>
                    <span className="font-semibold">{pepite.surface} m²</span>
                  </div>
                )}
              </div>

              <Link
                href={`/bien/${pepite.id}`}
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-0.5 ${stateConfig.ctaClass}`}
              >
                {stateConfig.ctaLabel}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {state === "live" && (
                <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Zap size={11} className="text-red-600" />
                  Plus que <span className="font-bold text-foreground tabular-nums">{pad2(hours)}h{pad2(minutes)}m{pad2(seconds)}s</span> avant la fin
                </p>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function CountdownBox({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[44px] md:min-w-[56px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className={`text-2xl md:text-3xl font-display font-bold tabular-nums ${highlight ? "text-yellow-200" : "text-white"}`}
        >
          {pad2(value)}
        </motion.div>
      </AnimatePresence>
      <span className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{label}</span>
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days >= 1) return `${days} jour${days > 1 ? "s" : ""}`;
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 1) return `${hours} h`;
  const minutes = Math.floor(ms / (60 * 1000));
  return `${minutes} min`;
}
