import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Sofa, Sun, ArrowRight, Move } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * BeforeAfter — interactive showcase of WeHome's AI photo / virtual staging power.
 * Drag the divider to reveal the "after" image. Tabs switch between 3 transformations.
 *
 * Images: replace with real WeHome before/after pairs when available.
 * For now we use Unsplash pairs that approximate the visual difference.
 */

type Example = {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  labelFallback: string;
  before: string;
  after: string;
  captionKey: string;
  captionFallback: string;
};

const EXAMPLES: Example[] = [
  {
    id: "salon",
    icon: <Wand2 size={14} />,
    labelKey: "before_after.tab_salon",
    labelFallback: "Retouche IA",
    // "Before": a dim, untouched-looking interior. "After": bright, polished editorial shot.
    before:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80&auto=format&fit=crop",
    after:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80&auto=format&fit=crop",
    captionKey: "before_after.caption_salon",
    captionFallback:
      "Photo brute prise au téléphone → rendu lumineux, couleurs justes, ambiance éditoriale.",
  },
  {
    id: "staging",
    icon: <Sofa size={14} />,
    labelKey: "before_after.tab_staging",
    labelFallback: "Home staging virtuel",
    before:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80&auto=format&fit=crop",
    after:
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1400&q=80&auto=format&fit=crop",
    captionKey: "before_after.caption_staging",
    captionFallback:
      "Pièce vide ou mal meublée → décoration virtuelle haut de gamme, sans bouger un meuble.",
  },
  {
    id: "exterior",
    icon: <Sun size={14} />,
    labelKey: "before_after.tab_exterior",
    labelFallback: "Extérieur sublimé",
    before:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80&auto=format&fit=crop",
    after:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=80&auto=format&fit=crop",
    captionKey: "before_after.caption_exterior",
    captionFallback:
      "Ciel gris, jardin terne → ciel bleu, végétation luxuriante, piscine cristalline.",
  },
];

export function BeforeAfter() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  const [activeIdx, setActiveIdx] = useState(0);
  const [position, setPosition] = useState(50); // 0–100
  const draggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const example = EXAMPLES[activeIdx];

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const clientX =
        "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true;
    const clientX =
      "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
    updateFromClientX(clientX);
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-amber-50/30 to-background relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute -left-32 top-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 bottom-20 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide mb-5 shadow-sm">
            <Sparkles size={12} />
            {fallback("before_after.badge", "Technologie WeHome")}
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            {fallback("before_after.title_part1", "L'IA WeHome transforme")}{" "}
            <span className="bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
              {fallback("before_after.title_part2", "vos annonces")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
            {fallback(
              "before_after.subtitle",
              "Glisse la barre pour voir ce que notre équipe peut faire avec tes photos. Retouche IA, home staging virtuel, ciel bleu garanti — la différence se voit en 5 secondes."
            )}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mt-10 mb-8"
        >
          {EXAMPLES.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => {
                setActiveIdx(idx);
                setPosition(50);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                activeIdx === idx
                  ? "bg-foreground text-background border-foreground shadow-lg"
                  : "bg-white border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              <span className={activeIdx === idx ? "text-amber-300" : "text-primary"}>{ex.icon}</span>
              {fallback(ex.labelKey, ex.labelFallback)}
            </button>
          ))}
        </motion.div>

        {/* Slider */}
        <motion.div
          key={example.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div
            ref={containerRef}
            className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/40 select-none cursor-ew-resize bg-muted"
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
          >
            {/* "After" — full image at the back */}
            <img
              src={example.after}
              alt="Après — rendu WeHome"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />

            {/* "Before" — clipped from right */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={example.before}
                alt="Avant — photo brute"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Before/After labels */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              {fallback("before_after.label_before", "Avant")}
            </div>
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
              <Sparkles size={11} />
              {fallback("before_after.label_after", "Après WeHome")}
            </div>

            {/* Drag handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-1/2 w-12 h-12 rounded-full bg-white shadow-2xl border-4 border-white flex items-center justify-center text-foreground pointer-events-none"
              style={{ left: `${position}%`, transform: "translate(-50%, -50%)" }}
            >
              <Move size={20} />
            </div>
          </div>

          {/* Hint */}
          <div className="text-center mt-4">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Move size={12} />
              {fallback("before_after.hint", "Glisse la barre pour comparer")}
            </p>
          </div>
        </motion.div>

        {/* Caption + CTA */}
        <motion.div
          key={`caption-${example.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 text-center max-w-2xl mx-auto"
        >
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
            {fallback(example.captionKey, example.captionFallback)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/services-pro"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold bg-foreground text-background shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {fallback("before_after.cta_primary", "Booster mes photos")}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/publier"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold border-2 border-foreground/15 text-foreground hover:border-foreground/40 hover:bg-foreground/5 transition-all"
            >
              {fallback("before_after.cta_secondary", "Publier mon annonce")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
