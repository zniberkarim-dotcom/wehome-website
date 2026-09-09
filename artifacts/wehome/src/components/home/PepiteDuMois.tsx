import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProperties, getPropertyImageUrls } from "@/lib/data";
import { motion } from "framer-motion";
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
  Sparkles,
} from "lucide-react";
import { formatMAD } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useSwipe } from "@/hooks/useSwipe";
import { ListingDescription } from "@/components/biens/ListingDescription";
import { useTranslation } from "react-i18next";

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

export function PepiteDuMois() {
  const { t } = useTranslation();
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

  const goNextIndex = useCallback(
    () => setCurrentIndex((p) => (p + 1) % imageUrls.length),
    [imageUrls.length]
  );
  const goPrevIndex = useCallback(
    () => setCurrentIndex((p) => (p - 1 + imageUrls.length) % imageUrls.length),
    [imageUrls.length]
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      goNextIndex();
    },
    [goNextIndex]
  );
  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      goPrevIndex();
    },
    [goPrevIndex]
  );
  const { onTouchStart, onTouchEnd } = useSwipe(goNextIndex, goPrevIndex);
  const handleImgError = useCallback(
    (index: number) => setFailedIndexes((prev) => new Set(prev).add(index)),
    []
  );

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

  // ─── Per-state visual config ───────────────────────────────────────────────
  // No deal states, no countdown: the Bible's restraint rules out an urgency mechanism.
  // The section simply presents this month's pick, or renders nothing at all when
  // there is none (see the early return above).
  const ribbonLabel = t("pepite.finished_ribbon");
  const ctaLabel = t("pepite.finished_cta");

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Section heading ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600">
            <Award size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {t("pepite.section_title")}
          </h2>
        </div>

        {/* ─── Main card ────────────────────────────────────────────────── */}
        <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl shadow-black/5 flex flex-col lg:flex-row">
          {/* Image carousel */}
          <div
            className={`group w-full lg:w-3/5 relative min-h-[400px] lg:min-h-[600px] ${!hasImages ? "bg-slate-100" : ""}`}
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
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === currentIndex ? "opacity-100" : "opacity-0"}`}
                    onError={() => handleImgError(i)}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                ))}
                {hasMultiple && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md shadow-black/10 z-10"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md shadow-black/10 z-10"
                    >
                      <ChevronRight size={22} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {imageUrls.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex(i);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? "bg-white w-5 shadow-md" : "bg-white/60 hover:bg-white/80"}`}
                        />
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
            <div
              className={`absolute top-6 left-6 px-4 py-2 bg-foreground text-background font-bold rounded-xl shadow-md shadow-black/10 backdrop-blur-md flex items-center gap-2 z-10`}
            >
              <Sparkles size={16} />
              <span className="text-sm">{ribbonLabel}</span>
            </div>

            {/* Bottom-left highlight: "Pépite du Mois" badge */}
            <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 z-10">
              <Award size={12} className="text-amber-300" />
              {t("pepite.photo_badge")}
            </div>
          </div>

          {/* Right column: details */}
          <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-primary font-bold tracking-wider uppercase text-xs">
                    {t("pepite.exclusive")}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {pepite.transaction}
                  </span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                  {pepite.title}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-6">
                  <MapPin size={20} className="shrink-0 mt-1" />
                  <span className="text-lg">{pepite.location}</span>
                </div>
                <div className="text-4xl font-display font-bold text-primary mb-2">
                  {hasPrice
                    ? formatMAD(pepite.price)
                    : pepite.priceLabel || t("pepite.price_on_request")}
                </div>
              </div>

              <ListingDescription
                text={pepite.description}
                className="text-muted-foreground leading-relaxed mb-8 text-base line-clamp-4"
              />

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/80 mb-8">
                {pepite.beds ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bed size={20} />
                    </div>
                    <span className="font-semibold">
                      {pepite.beds} {t("card.stat_bedrooms_short")}
                    </span>
                  </div>
                ) : showRooms ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <LayoutGrid size={20} />
                    </div>
                    <span className="font-semibold">
                      {pepite.rooms} {t("card.stat_rooms_short")}
                    </span>
                  </div>
                ) : null}
                {pepite.baths ? (
                  <div className="flex flex-col items-center justify-center gap-2 border-x border-border/80">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bath size={20} />
                    </div>
                    <span className="font-semibold">
                      {pepite.baths} {t("card.stat_baths_short")}
                    </span>
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
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-0.5 bg-foreground text-background hover:bg-primary shadow-md shadow-black/5`}
              >
                {ctaLabel}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
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
