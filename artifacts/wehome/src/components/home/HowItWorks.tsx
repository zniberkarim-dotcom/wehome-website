import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Search, Home, Network, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    audience: "how.step1_audience",
    title: "how.step1_title",
    body: "how.step1_body",
    cta: null,
    number: "01",
  },
  {
    icon: Home,
    audience: "how.step2_audience",
    title: "how.step2_title",
    body: "how.step2_body",
    cta: { label: "how.step2_cta", href: "/estimer" },
    number: "02",
  },
  {
    icon: Network,
    audience: "how.step3_audience",
    title: "how.step3_title",
    body: "how.step3_body",
    cta: { label: "how.step3_cta", href: "/partenaires" },
    number: "03",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

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
            {t("how.overline")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-foreground leading-tight"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
          >
            {t("how.title_part1")}
            <br />
            {t("how.title_part2")}
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
                  <Icon size={24} style={{ color: "var(--primary, #5C1428)" }} />
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
                style={{ color: "var(--primary, #5C1428)" }}
              >
                {t(audience)}
              </p>

              <h3 className="font-display font-bold text-foreground text-xl mb-4 leading-snug">
                {t(title)}
              </h3>
              <p className="text-muted-foreground text-sm leading-[1.8] flex-grow">{t(body)}</p>

              {cta && (
                <Link
                  href={cta.href}
                  className="relative inline-flex items-center gap-1.5 mt-6 text-sm font-semibold group/link after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100"
                  style={{ color: "var(--primary, #5C1428)" }}
                >
                  {t(cta.label)}
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
