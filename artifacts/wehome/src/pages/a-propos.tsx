import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown, LayoutGrid, Handshake, Gem,
  Users, BarChart2, Cpu, Building2, Palette, Home,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── Scroll-triggered fade-in ────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
  from = "bottom",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right" | "none";
  style?: React.CSSProperties;
}) {
  const initial =
    from === "bottom" ? { opacity: 0, y: 32 }
    : from === "left"  ? { opacity: 0, x: -32 }
    : from === "right" ? { opacity: 0, x: 32 }
    : { opacity: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Overline label ──────────────────────────────────────────────────────────
function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
      style={{ color: "var(--primary, #8B1A2E)" }}
    >
      {children}
    </p>
  );
}

// ─── Team member ─────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Kenza Zerrouk",
    title: "Fondatrice",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face&q=80",
    bio: "Architecte de formation et entrepreneure dans l'âme, Kenza a fondé WeHome avec une conviction : le marché immobilier marocain méritait une approche radicalement plus transparente, plus humaine, plus exigeante.",
  },
  {
    name: "Karim Zniber",
    title: "CEO",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face&q=80",
    bio: "À la tête de la stratégie et des opérations, Karim pilote la croissance de WeHome et veille à ce que chaque transaction soit aussi mémorable que le bien lui-même.",
  },
  {
    name: "Basma Tazi",
    title: "Responsable Commerciale",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face&q=80",
    bio: "Avec une connaissance intime des quartiers casablancais, Basma guide les acquéreurs et vendeurs avec une précision chirurgicale et une écoute rare.",
  },
];

// ─── Commitments ─────────────────────────────────────────────────────────────
const COMMITMENTS = [
  { n: "01", text: "Pas d'annonces sans accompagnement humain." },
  { n: "02", text: "Pas de prix sans explication du marché." },
  { n: "03", text: "Pas d'honoraires sans résultat justifié." },
  { n: "04", text: "Pas de raccourcis sur la qualité du suivi." },
  { n: "05", text: "Pas de promesses qu'on ne peut pas tenir." },
  { n: "06", text: "Pas de transaction sans transparence totale." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AProposPage() {
  const heroRef  = useRef<HTMLElement>(null);
  const ctaRef   = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallax = useTransform(heroProgress, [0, 1], ["0%", "22%"]);

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaParallax = useTransform(ctaProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div
          style={{ y: heroParallax }}
          className="absolute inset-0 scale-110 will-change-transform"
        >
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Villa de luxe Casablanca"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.72) 100%)",
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-xs font-bold tracking-[0.28em] uppercase mb-10"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            WeHome — Casablanca
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-white leading-[1.08] tracking-tight mb-8"
            style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
          >
            L'immobilier tel qu'il aurait<br className="hidden sm:block" /> toujours dû exister.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl font-light tracking-wide"
            style={{ color: "rgba(255,255,255,0.72)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            Expertise humaine.&nbsp; Intelligence des données.&nbsp; Transparence absolue.
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            <ChevronDown size={24} style={{ color: "rgba(255,255,255,0.4)" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — MANIFESTO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 md:py-40">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn>
            <div className="flex gap-10 md:gap-16">
              {/* Burgundy vertical line */}
              <div
                className="w-[2px] rounded-full shrink-0 self-stretch"
                style={{ background: "var(--primary, #8B1A2E)", minHeight: "100%" }}
              />

              {/* Manifesto text */}
              <div
                className="space-y-7 text-foreground"
                style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)", lineHeight: 1.88, letterSpacing: "0.01em" }}
              >
                <p className="font-medium text-foreground/90">
                  Il y a quelque chose de particulier dans l'acte d'acheter une maison.
                </p>

                <p className="text-foreground/75">
                  Ce n'est pas une transaction. C'est une décision de vie.<br />
                  C'est choisir où vos enfants grandiront.<br />
                  C'est définir le cadre dans lequel vous vous réveillerez chaque matin.<br />
                  C'est, souvent, le fruit de dix ans d'effort.
                </p>

                <p className="text-foreground/75">
                  Et pourtant — le marché immobilier marocain vous offre deux options :
                  des plateformes qui publient des annonces et vous laissent seuls face à l'incertitude,
                  ou des agences traditionnelles qui n'ont pas évolué depuis vingt ans.
                </p>

                <p
                  className="font-semibold"
                  style={{ color: "var(--primary, #8B1A2E)" }}
                >
                  Nous avons refusé ces deux options.
                </p>

                <p className="text-foreground/75">
                  WeHome est né d'une conviction simple mais radicale :<br />
                  l'immobilier mérite d'être traité avec la rigueur d'une science<br />
                  et la sensibilité d'un art.
                </p>

                <p className="font-medium text-foreground/90">
                  Nous mettons l'actif au centre.{" "}
                  <span style={{ color: "var(--primary, #8B1A2E)" }}>L'humain au cœur.</span>{" "}
                  La technologie au service.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — TWO MODELS HAVE FAILED
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40" style={{ background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center mb-20">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "rgba(139,26,46,0.9)" }}>
              Le constat
            </p>
            <h2
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              Deux modèles ont échoué.<br />
              Nous en construisons un troisième.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
            {/* Column 1 */}
            <FadeIn delay={0.0} className="bg-[#111] p-10 md:p-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: "rgba(139,26,46,0.12)" }}>
                <LayoutGrid size={22} style={{ color: "rgba(139,26,46,0.85)" }} />
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-4">
                Les plateformes vous abandonnent.
              </h3>
              <p className="text-white/50 leading-relaxed text-sm">
                Mubawab, Yakeey — elles publient. Elles indexent. Elles disparaissent.
                Aucun accompagnement. Aucune expertise. Aucune responsabilité
                sur le résultat.
              </p>
            </FadeIn>

            {/* Column 2 */}
            <FadeIn delay={0.12} className="bg-[#111] p-10 md:p-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: "rgba(139,26,46,0.12)" }}>
                <Handshake size={22} style={{ color: "rgba(139,26,46,0.85)" }} />
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-4">
                Les agences traditionnelles vous dépassent.
              </h3>
              <p className="text-white/50 leading-relaxed text-sm">
                Pas de données. Pas de transparence sur le marché.
                Des honoraires sans justification. Un suivi qui dépend
                de l'humeur de l'agent.
              </p>
            </FadeIn>

            {/* Column 3 — WeHome */}
            <FadeIn delay={0.24} className="p-10 md:p-12 relative" style={{ background: "#161010" }}>
              <div
                className="absolute inset-0 rounded-none pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(139,26,46,0.25)" }}
              />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: "rgba(139,26,46,0.2)" }}>
                <Gem size={22} style={{ color: "#C0392B" }} />
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-4">
                WeHome : la troisième voie.
              </h3>
              <p className="text-white/65 leading-relaxed text-sm">
                Des agents experts, formés, engagés sur la performance.
                Des données marché accessibles et lisibles. Une technologie
                qui sert le client — pas qui le remplace.
              </p>
              <div
                className="mt-8 h-0.5 w-16 rounded-full"
                style={{ background: "var(--primary, #8B1A2E)" }}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — THREE PILLARS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="max-w-2xl mb-20">
            <Overline>Notre philosophie</Overline>
            <h2
              className="font-display font-bold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              L'actif d'abord. Toujours.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Expertise humaine",
                body: "Nos agents ne sont pas des vendeurs. Ce sont des conseillers immobiliers — sélectionnés pour leur connaissance du marché casablancais, formés à l'écoute, et évalués sur la satisfaction client. La technologie les assiste. Elle ne les remplace jamais.",
                delay: 0,
              },
              {
                icon: BarChart2,
                title: "Données & Transparence",
                body: "Nous vous donnons accès à ce que vous méritez de savoir : les prix réels du marché, les tendances par quartier, les délais de vente moyens, les comparables. Vous prenez vos décisions avec la bonne information — pas avec des arguments commerciaux.",
                delay: 0.12,
              },
              {
                icon: Cpu,
                title: "Technologie au service",
                body: "Notre CRM, notre plateforme, notre marketing data-driven — ces outils existent pour une seule raison : mieux servir le bien et le client. Pas pour faire de l'effet. Pas pour remplacer l'humain. Pour lui donner les moyens d'être excellent.",
                delay: 0.24,
              },
            ].map(({ icon: Icon, title, body, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div className="group h-full flex flex-col p-8 md:p-10 rounded-3xl border border-border/60 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 bg-card">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: "rgba(139,26,46,0.07)" }}
                  >
                    <Icon size={24} style={{ color: "var(--primary, #8B1A2E)" }} />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-5">{title}</h3>
                  <p className="text-muted-foreground leading-[1.8] text-sm flex-grow">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — ECOSYSTEM
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40" style={{ background: "#f7f6f5" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="max-w-2xl mb-20">
            <Overline>Un écosystème pensé pour l'actif</Overline>
            <h2
              className="font-display font-bold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              Trois expertises.<br />Une vision.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                brand: "WeHome",
                sub: "Résidentiel",
                body: "L'accompagnement complet pour l'achat, la vente, et la location de votre bien. Du premier contact jusqu'à la remise des clés.",
                cta: { label: "Voir nos biens", href: "/biens" },
                delay: 0,
              },
              {
                icon: Building2,
                brand: "WeOffice",
                sub: "Commercial",
                body: "Bureaux, locaux commerciaux, baux longue durée. Pour les entreprises qui comprennent que leur espace de travail est un actif stratégique.",
                cta: null,
                delay: 0.12,
              },
              {
                icon: Palette,
                brand: "WeDesign",
                sub: "Architecture & Staging",
                body: "Valorisez votre bien avant de le mettre sur le marché. Architecture d'intérieur, home staging, mise en valeur photographique.",
                cta: null,
                delay: 0.24,
              },
            ].map(({ icon: Icon, brand, sub, body, cta, delay }) => (
              <FadeIn key={brand} delay={delay}>
                <div className="flex flex-col h-full bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-xl transition-shadow duration-500">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "rgba(139,26,46,0.08)" }}
                  >
                    <Icon size={22} style={{ color: "var(--primary, #8B1A2E)" }} />
                  </div>
                  <div className="mb-6">
                    <span
                      className="font-display font-bold text-2xl"
                      style={{ color: "var(--primary, #8B1A2E)" }}
                    >
                      {brand}
                    </span>
                    <span className="text-muted-foreground font-medium text-sm ml-2">— {sub}</span>
                  </div>
                  <p className="text-muted-foreground leading-[1.8] text-sm flex-grow mb-8">{body}</p>
                  {cta ? (
                    <Link
                      href={cta.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                      style={{ color: "var(--primary, #8B1A2E)" }}
                    >
                      {cta.label} →
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">Bientôt disponible</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 — TEAM
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="max-w-2xl mb-6">
            <Overline>Les personnes derrière la vision</Overline>
            <h2
              className="font-display font-bold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              Une équipe. Un standard.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1} className="mb-20">
            <p className="text-muted-foreground leading-relaxed max-w-2xl" style={{ fontSize: "1.05rem" }}>
              Chez WeHome, nous croyons que la qualité d'une agence se mesure à la qualité des personnes
              qui la composent. Voici ceux qui portent cette vision.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map(({ name, title, photo, bio }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <div className="group flex flex-col">
                  {/* Photo */}
                  <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-6 bg-secondary">
                    <img
                      src={photo}
                      alt={name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "linear-gradient(to top, rgba(139,26,46,0.25) 0%, transparent 60%)" }}
                    />
                  </div>
                  {/* Info */}
                  <p className="font-display font-bold text-foreground text-lg leading-tight">{name}</p>
                  <p className="text-sm font-semibold mt-1 mb-3" style={{ color: "var(--primary, #8B1A2E)" }}>
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 — COMMITMENTS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40" style={{ background: "#0a0a0a" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-8">
          <FadeIn className="text-center mb-20">
            <h2
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
            >
              Ce que nous vous promettons.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
            {COMMITMENTS.map(({ n, text }, i) => (
              <FadeIn key={n} delay={i * 0.08}>
                <div className="flex items-start gap-6 py-7 border-b border-white/[0.07] group">
                  <span
                    className="text-xs font-bold tracking-widest shrink-0 mt-1 transition-colors duration-300 group-hover:opacity-100"
                    style={{ color: "rgba(139,26,46,0.55)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {n}
                  </span>
                  <p
                    className="text-white/60 leading-relaxed group-hover:text-white/90 transition-colors duration-300"
                    style={{ fontSize: "1rem" }}
                  >
                    {text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 8 — CLOSING CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div
          style={{ y: ctaParallax }}
          className="absolute inset-0 scale-110 will-change-transform"
        >
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80"
            alt="Luxueuse propriété au crépuscule"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.48) 60%, rgba(0,0,0,0.65) 100%)",
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <FadeIn from="none">
            <h2
              className="font-display font-bold text-white leading-tight mb-5"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              L'immobilier mérite mieux.
            </h2>
            <p
              className="text-xl md:text-2xl font-light mb-12 tracking-wide"
              style={{ color: "rgba(255,255,255,0.7)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
            >
              Travaillons ensemble.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-9 py-4 rounded-2xl font-bold text-base text-white shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ background: "var(--primary, #8B1A2E)", boxShadow: "0 8px 32px rgba(139,26,46,0.45)" }}
              >
                Parler à un agent
              </Link>
              <Link
                href="/biens"
                className="px-9 py-4 rounded-2xl font-bold text-base text-white border-2 border-white/60 hover:bg-white hover:text-foreground hover:-translate-y-1 transition-all duration-300"
              >
                Découvrir nos biens
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
