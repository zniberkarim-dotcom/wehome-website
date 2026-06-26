import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home as HomeIcon, Building2, Palette, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

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
    ctaInternal: { href: "/biens", labelKey: "ecosystem.wehome_cta", labelFallback: "Voir les biens" },
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
    ctaInternal: { href: WEOFFICE_INTERNAL, labelKey: "ecosystem.weoffice_cta_internal", labelFallback: "Briefer WeOffice" },
    ctaExternal: { href: WEOFFICE_EXTERNAL, labelKey: "ecosystem.weoffice_cta_external", labelFallback: "Catalogue" },
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
    ctaExternal: { href: WEDESIGN_EXTERNAL, labelKey: "ecosystem.wedesign_cta_external", labelFallback: "Découvrir WeDesign" },
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
            <BrandCard
              key={brand.id}
              brand={brand}
              index={i}
              fallback={fallback}
            />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`relative rounded-3xl border ${styles.border} ${styles.bg} p-7 flex flex-col group hover:-translate-y-1 hover:shadow-2xl transition-all overflow-hidden`}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 ${styles.blob} rounded-full blur-3xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="relative">
        {/* Logo bar (full width for branded logos) OR icon square (for WeHome) */}
        {styles.logoSrc ? (
          <div className="flex items-start justify-between mb-5 gap-3">
            <div className="flex-1 h-14 rounded-2xl bg-black flex items-center justify-center px-4 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img
                src={styles.logoSrc}
                alt={`Logo ${fallback(brand.titleKey, brand.titleFallback)}`}
                className="max-h-9 w-auto object-contain"
              />
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.badge}`}>
              {fallback(brand.badgeKey, brand.badgeFallback)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.iconBg} ${styles.iconText} shadow-lg`}>
              {styles.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.badge}`}>
              {fallback(brand.badgeKey, brand.badgeFallback)}
            </span>
          </div>
        )}

        {/* Title + tagline — title hidden when logo is shown (logo already contains brand name) */}
        {!styles.logoSrc && (
          <h3 className={`text-2xl font-display font-bold leading-tight ${styles.title}`}>
            {fallback(brand.titleKey, brand.titleFallback)}
          </h3>
        )}
        <p className={`text-sm leading-relaxed ${styles.tagline} ${styles.logoSrc ? "" : "mt-2"}`}>
          {fallback(brand.taglineKey, brand.taglineFallback)}
        </p>

        {/* Bullets */}
        <ul className="mt-5 space-y-2">
          {brand.bulletsKeys.map((k, idx) => (
            <li key={k} className={`flex gap-2 text-sm ${styles.bullet}`}>
              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${styles.bulletDot}`} />
              <span className="leading-snug">{fallback(k, brand.bulletsFallbacks[idx])}</span>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-7 pt-5 border-t border-current/10">
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

/* Per-brand styles — gives each brand its identity.
 *  logoSrc is set for brands with a real logo asset on disk (in /public/images/).
 *  When set, BrandCard renders the logo on a black bar instead of the Lucide icon. */
const STYLES: Record<Brand["id"], {
  border: string; bg: string; blob: string;
  iconBg: string; iconText: string; icon: React.ReactNode;
  logoSrc?: string;
  badge: string; title: string; tagline: string;
  bullet: string; bulletDot: string;
  ctaPrimary: string; ctaSecondary: string;
}> = {
  wehome: {
    border: "border-primary/20",
    bg: "bg-gradient-to-br from-primary/5 via-rose-50/40 to-background",
    blob: "bg-primary/15",
    iconBg: "bg-gradient-to-br from-primary to-primary/80",
    iconText: "text-white",
    icon: <HomeIcon size={24} />,
    badge: "bg-primary/10 text-primary",
    title: "text-foreground",
    tagline: "text-muted-foreground",
    bullet: "text-foreground/75",
    bulletDot: "bg-primary",
    ctaPrimary: "bg-primary text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-primary/30 text-primary hover:border-primary",
  },
  weoffice: {
    border: "border-slate-900/15",
    bg: "bg-gradient-to-br from-slate-900/[0.04] via-blue-50/40 to-background",
    blob: "bg-blue-500/15",
    iconBg: "bg-gradient-to-br from-slate-900 to-slate-700",
    iconText: "text-white",
    icon: <Building2 size={24} />,
    logoSrc: `${import.meta.env.BASE_URL}images/weoffice-logo.png`,
    badge: "bg-slate-900/10 text-slate-900",
    title: "text-foreground",
    tagline: "text-muted-foreground",
    bullet: "text-foreground/75",
    bulletDot: "bg-slate-900",
    ctaPrimary: "bg-slate-900 text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-slate-900/30 text-slate-900 hover:border-slate-900",
  },
  wedesign: {
    border: "border-amber-500/20",
    bg: "bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-background",
    blob: "bg-amber-500/15",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    iconText: "text-white",
    icon: <Palette size={24} />,
    logoSrc: `${import.meta.env.BASE_URL}images/wedesign-logo.png`,
    badge: "bg-amber-500/10 text-amber-700",
    title: "text-foreground",
    tagline: "text-muted-foreground",
    bullet: "text-foreground/75",
    bulletDot: "bg-amber-500",
    ctaPrimary: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg",
    ctaSecondary: "border-2 border-amber-500/30 text-amber-700 hover:border-amber-500",
  },
};
