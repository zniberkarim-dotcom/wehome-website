import { motion } from "framer-motion";
import { Link } from "wouter";
import { BarChart2, ShieldCheck, Handshake, Network } from "lucide-react";

const CARDS = [
  {
    icon: BarChart2,
    title: "Données de marché réelles",
    body: "Nous publions les prix au m² par ville et par quartier chaque mois. Pas des estimations. Les vraies transactions du marché marocain.",
  },
  {
    icon: ShieldCheck,
    title: "Biens vérifiés et mandatés",
    body: "Chaque bien listé sur WeHome a été visité et mandaté par un agent. Zéro annonce fantôme. Zéro doublon.",
  },
  {
    icon: Handshake,
    title: "Accompagnement de bout en bout",
    body: "De l'estimation à la remise des clés — un agent dédié vous suit à chaque étape, où que vous soyez au Maroc.",
  },
  {
    icon: Network,
    title: "Le réseau se construit",
    body: "Nous ouvrons notre plateforme aux agences partenaires qui partagent nos standards. Le premier MLS privé du Maroc — rejoignez l'aventure.",
    cta: { label: "Rejoindre le réseau", href: "/partenaires" },
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] rounded-full border-[60px] border-white/5 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/5 opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-white/50">
              Notre différence
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              Pourquoi WeHome
              <br />
              est différent
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 text-base leading-relaxed max-w-md lg:text-right"
          >
            WeHome n'est pas une plateforme d'annonces.
            <br />
            C'est l'infrastructure de confiance du marché immobilier marocain.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map(({ icon: Icon, title, body, cta }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-7 hover:bg-white/[0.15] transition-colors duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center mb-6 shadow-sm">
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-3 leading-snug">{title}</h3>
              <p className="text-primary-foreground/70 text-sm leading-[1.75] flex-grow">{body}</p>
              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold tracking-wide uppercase text-white/70 hover:text-white transition-colors"
                >
                  {cta.label} →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
