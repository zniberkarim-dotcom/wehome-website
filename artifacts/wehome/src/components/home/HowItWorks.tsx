import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, Home, Network, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    audience: "Pour les acheteurs",
    title: "Cherchez en confiance",
    body: "Tous nos biens sont vérifiés, visités, et présentés avec les vraies données du marché. Pas de doublons. Pas d'annonces fantômes. Juste des opportunités réelles.",
    cta: null,
    number: "01",
  },
  {
    icon: Home,
    audience: "Pour les vendeurs",
    title: "Vendez au bon prix",
    body: "Estimation gratuite basée sur les transactions réelles de votre quartier. Exposition maximale sur notre réseau national. Accompagnement de A à Z jusqu'à la signature.",
    cta: { label: "Estimer mon bien →", href: "/estimer" },
    number: "02",
  },
  {
    icon: Network,
    audience: "Pour les professionnels",
    title: "Vous êtes une agence ?",
    body: "WeHome construit le premier réseau immobilier partagé du Maroc. Rejoignez la liste d'attente des agences partenaires et soyez parmi les premiers.",
    cta: { label: "Rejoindre le réseau →", href: "/partenaires" },
    number: "03",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-sand/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-primary"
          >
            Comment WeHome fonctionne
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-foreground leading-tight"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
          >
            Une plateforme.
            <br />
            Trois façons d'en bénéficier.
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map(({ icon: Icon, audience, title, body, cta, number }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col"
            >
              {/* Number + icon row */}
              <div className="flex items-start justify-between mb-7">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "rgba(139,26,46,0.07)" }}
                >
                  <Icon size={24} style={{ color: "var(--primary, #8B1A2E)" }} />
                </div>
                <span
                  className="font-display font-bold text-5xl leading-none select-none"
                  style={{ color: "rgba(139,26,46,0.08)" }}
                >
                  {number}
                </span>
              </div>

              {/* Audience tag */}
              <p
                className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3"
                style={{ color: "var(--primary, #8B1A2E)" }}
              >
                {audience}
              </p>

              <h3 className="font-display font-bold text-foreground text-xl mb-4 leading-snug">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-[1.8] flex-grow">{body}</p>

              {cta && (
                <Link
                  href={cta.href}
                  className="relative inline-flex items-center gap-1.5 mt-6 text-sm font-semibold group/link after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100"
                  style={{ color: "var(--primary, #8B1A2E)" }}
                >
                  {cta.label}
                  <ArrowRight
                    size={14}
                    className="group-hover/link:translate-x-1 transition-transform"
                  />
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Horizontal divider between steps on desktop */}
        <div className="hidden md:block relative mt-0">
          {/* connector line drawn with CSS under the step numbers — decorative */}
        </div>
      </div>
    </section>
  );
}
