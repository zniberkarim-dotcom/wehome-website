import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { BarChart2, ShieldCheck, Handshake, Network } from "lucide-react";

const CARDS = [
  {
    icon: BarChart2,
    title: "why.card1_title",
    body: "why.card1_body",
  },
  {
    icon: ShieldCheck,
    title: "why.card2_title",
    body: "why.card2_body",
  },
  {
    icon: Handshake,
    title: "why.card3_title",
    body: "why.card3_body",
  },
  {
    icon: Network,
    title: "why.card4_title",
    body: "why.card4_body",
    cta: { label: "why.card4_cta", href: "/partenaires" },
  },
];

export function WhyChooseUs() {
  const { t } = useTranslation();

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
              {t("why.overline")}
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              {t("why.title_part1")}
              <br />
              {t("why.title_part2")}
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 text-base leading-relaxed max-w-md lg:text-right"
          >
            {t("why.sub_part1")}
            <br />
            {t("why.sub_part2")}
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
              <h3 className="font-display font-bold text-lg mb-3 leading-snug">{t(title)}</h3>
              <p className="text-primary-foreground/70 text-sm leading-[1.75] flex-grow">
                {t(body)}
              </p>
              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold tracking-wide uppercase text-white/70 hover:text-white transition-colors"
                >
                  {t(cta.label)} →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
