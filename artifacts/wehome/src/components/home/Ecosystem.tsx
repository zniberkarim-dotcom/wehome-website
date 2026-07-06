import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Home as HomeIcon,
  Building2,
  Palette,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

/**
 * Ecosystem — showcases the 3 brands of the group.
 *  - WeHome (this site)
 *  - WeOffice (separate site weoffice.ma + internal landing /weoffice)
 *  - WeDesign (separate site wedesignagency.ma)
 *
 * TODO: confirm WeDesign final URL with team. Currently assumes .ma TLD.
 */

const WEOFFICE_INTERNAL = "/weoffice";
const WEOFFICE_EXTERNAL = "https://weoffice.ma";
const WEDESIGN_EXTERNAL = "https://wedesignagency.ma";

type Brand = {
  id: "wehome" | "weoffice" | "wedesign";
  badgeKey: string;
  badgeFallback: string;
  titleKey: string;
  titleFallback: string;
  taglineKey: string;
  taglineFallback: string;
  bulletsKeys: string[];
  bulletsFallbacks: string[];
  ctaInternal?: { href: string; labelKey: string; labelFallback: string };
  ctaExternal?: { href: string; labelKey: string; labelFallback: string };
};

const BRANDS: Brand[] = [
  {
    id: "wehome",
    badgeKey: "ecosystem.wehome_badge",
    badgeFallback: "Résidentiel",
    titleKey: "ecosystem.wehome_title",
    titleFallback: "WeHome",
    taglineKey: "ecosystem.wehome_tagline",
    taglineFallback: "Achat, location, vente — pour particuliers et familles.",
    bulletsKeys: ["ecosystem.wehome_b1", "ecosystem.wehome_b2", "ecosystem.wehome_b3"],
    bulletsFallbacks: [
      "Biens premium sélectionnés",
      "Accompagnement personnalisé",
      "Photos IA, home staging virtuel",
    ],
    ctaInternal: {
      href: "/biens",
      labelKey: "ecosystem.wehome_cta",
      labelFallback: "Voir les biens",
    },
  },
  {
    id: "weoffice",
    badgeKey: "ecosystem.weoffice_badge",
    badgeFallback: "Entreprises",
    titleKey: "ecosystem.weoffice_title",
    titleFallback: "WeOffice",
    taglineKey: "ecosystem.weoffice_tagline",
    taglineFallback: "Bureaux, plateaux et locaux pro pour les entreprises ambitieuses.",
    bulletsKeys: ["ecosystem.weoffice_b1", "ecosystem.weoffice_b2", "ecosystem.weoffice_b3"],
    bulletsFallbacks: [
      "Adresses prestige Casa / Rabat / Tanger",
      "Off-market exclusif",
      "Brief pro, options ciblées sous 24h",
    ],
    ctaInternal: {
      href: WEOFFICE_INTERNAL,
      labelKey: "ecosystem.weoffice_cta_internal",
      labelFallback: "Briefer WeOffice",
    },
    ctaExternal: {
      href: WEOFFICE_EXTERNAL,
      labelKey: "ecosystem.weoffice_cta_external",
      labelFallback: "Catalogue",
    },
  },
  {
    id: "wedesign",
    badgeKey: "ecosystem.wedesign_badge",
    badgeFallback: "Aménagement",
    titleKey: "ecosystem.wedesign_title",
    titleFallback: "WeDesign",
    taglineKey: "ecosystem.wedesign_tagline",
    taglineFallback: "Aménagement, design d'intérieur et valorisation des espaces.",
    bulletsKeys: ["ecosystem.wedesign_b1", "ecosystem.wedesign_b2", "ecosystem.wedesign_b3"],
    bulletsFallbacks: [
      "Conception sur-mesure",
      "Home staging réel + virtuel",
      "Valorisation avant vente / location",
    ],
    ctaExternal: {
      href: WEDESIGN_EXTERNAL,
      labelKey: "ecosystem.wedesign_cta_external",
      labelFallback: "Découvrir WeDesign",
    },
  },
];

export function Ecosystem() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-foreground/[0.02] to-background relative overflow-hidden">
      <div className="absolute -left-32 top-40 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 bottom-40 w-80 h-80 bg-blue-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 bg-foreground text-background rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-5">
            <Sparkles size={12} />
            {fallback("ecosystem.badge", "Notre écosystème")}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
            {fallback("ecosystem.title_part1", "Trois pôles,")}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-amber-600 bg-clip-text text-transparent">
              {fallback("ecosystem.title_part2", "un seul écosystème.")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
            {fallback(
              "ecosystem.subtitle",
              "Résidentiel, professionnel et aménagement. Chaque pôle a son expertise, ses outils, son équipe — pour que chaque projet soit traité comme il le mérite."
            )}
          </p>
        </motion.div>

        {/* Brand cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} index={i} fallback={fallback} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandCard({
  brand,
  index,
  fallback,
}: {
  brand: Brand;
  index: number;
  fallback: (k: string, d: string) => string;
}) {
  const styles = STYLES[brand.id];
  const brandName = fallback(brand.titleKey, brand.titleFallback);
  // Track image errors per card — fall back to text+icon if PNG fails to load
  const [imgLoadError, setImgLoadError] = useState(false);
  const showLogo = !!styles.logoSrc && !imgLoadError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`relative rounded-3xl border ${styles.border} bg-white flex flex-col group hover:-translate-y-1 hover:shadow-2xl transition-all overflow-hidden`}
    >
      {/* ── HERO zone — branded dark/colorful banner with logo or icon+name ── */}
      <div
        className={`relative h-44 ${styles.heroBg} flex items-center justify-center px-5 overflow-hidden`}
      >
        {/* Decorative blob inside the hero */}
        <div
          className={`absolute -top-12 -right-12 w-48 h-48 ${styles.heroBlob} rounded-full blur-3xl pointer-events-none`}
        />

        {/* Badge — top-right overlay */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.badge} z-10`}
        >
          {fallback(brand.badgeKey, brand.badgeFallback)}
        </span>

        {/* Logo OR fallback (icon + brand name in white) */}
        {showLogo ? (
          <img
            src={styles.logoSrc}
            alt={`Logo ${brandName}`}
            className="relative h-24 md:h-28 w-auto max-w-[85%] object-contain"
            onError={() => setImgLoadError(true)}
          />
        ) : (
          <div className="relative flex items-center gap-3 text-white">
            <span className="opacity-90">{styles.icon}</span>
            <span className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {brandName}
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT zone — tagline + bullets + CTAs on light background ── */}
      <div className="relative p-6 flex-1 flex flex-col">
        <p className="text-base leading-relaxed text-foreground/80">
          {fallback(brand.taglineKey, brand.taglineFallback)}
        </p>

        {/* Bullets */}
        <ul className="mt-5 space-y-2 flex-1">
          {brand.bulletsKeys.map((k, idx) => (
            <li key={k} className="flex gap-2 text-sm text-foreground/70">
              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${styles.bulletDot}`} />
              <span className="leading-snug">{fallback(k, brand.bulletsFallbacks[idx])}</span>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-7 pt-5 border-t border-border/60">
          {brand.ctaInternal && (
            <Link
              href={brand.ctaInternal.href}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold ${styles.ctaPrimary} hover:-translate-y-0.5 transition-all`}
            >
              {fallback(brand.ctaInternal.labelKey, brand.ctaInternal.labelFallback)}
              <ArrowRight size={14} />
            </Link>
          )}
          {brand.ctaExternal && (
            <a
              href={brand.ctaExternal.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold ${styles.ctaSecondary} hover:-translate-y-0.5 transition-all`}
            >
              {fallback(brand.ctaExternal.labelKey, brand.ctaExternal.labelFallback)}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* Per-brand styles. Each card has a dark/colorful HERO zone at the top (where
 *  the logo or icon+name lives) and a light CONTENT zone below.
 *  logoSrc: PNG in /public/images/. If image fails to load (404, broken),
 *  the card gracefully falls back to icon + brand name in white text. */
const STYLES: Record<
  Brand["id"],
  {
    border: string;
    heroBg: string;
    heroBlob: string;
    icon: React.ReactNode;
    logoSrc?: string;
    badge: string;
    bulletDot: string;
    ctaPrimary: string;
    ctaSecondary: string;
  }
> = {
  wehome: {
    border: "border-primary/20",
    // Red gradient hero — WeHome's brand signature
    heroBg: "bg-gradient-to-br from-primary via-rose-600 to-primary",
    heroBlob: "bg-rose-300/30",
    icon: <HomeIcon size={28} strokeWidth={2.5} />,
    // No logoSrc → always shows the icon + "WeHome" text in white
    badge: "bg-white/20 backdrop-blur-sm text-white",
    bulletDot: "bg-primary",
    ctaPrimary: "bg-primary text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-primary/30 text-primary hover:border-primary",
  },
  weoffice: {
    border: "border-slate-900/15",
    // Dark slate hero — matches the logo's original black background
    heroBg: "bg-gradient-to-br from-slate-900 via-slate-800 to-black",
    heroBlob: "bg-blue-500/25",
    icon: <Building2 size={28} strokeWidth={2.5} />,
    logoSrc: `${import.meta.env.BASE_URL}images/weoffice-logo.png`,
    badge: "bg-white/15 backdrop-blur-sm text-white",
    bulletDot: "bg-slate-900",
    ctaPrimary: "bg-slate-900 text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-slate-900/30 text-slate-900 hover:border-slate-900",
  },
  wedesign: {
    border: "border-amber-500/20",
    // Black hero with warm accent — matches the white-on-black wedesign logo
    heroBg: "bg-gradient-to-br from-black via-zinc-900 to-amber-950",
    heroBlob: "bg-amber-400/25",
    icon: <Palette size={28} strokeWidth={2.5} />,
    logoSrc: `${import.meta.env.BASE_URL}images/wedesign-logo.png`,
    badge: "bg-white/15 backdrop-blur-sm text-white",
    bulletDot: "bg-amber-500",
    ctaPrimary:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-amber-500/30 text-amber-700 hover:border-amber-500",
  },
};
