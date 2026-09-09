import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { TrendingUp, FileCheck, Globe } from "lucide-react";

const SERVICES = [
  {
    icon: <TrendingUp size={32} />,
    title: "services.item1_title",
    description: "services.item1_desc",
  },
  {
    icon: <FileCheck size={32} />,
    title: "services.item2_title",
    description: "services.item2_desc",
  },
  {
    icon: <Globe size={32} />,
    title: "services.item3_title",
    description: "services.item3_desc",
  },
];

export function Services() {
  const { t } = useTranslation();

  return (
    <section className="py-24 md:py-32 bg-secondary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-primary"
          >
            {t("services.overline")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5"
          >
            {t("services.title_part1")}
            <br />
            {t("services.title_part2")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base leading-relaxed"
          >
            {t("services.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-4">
                {t(service.title)}
              </h3>
              <p className="text-muted-foreground leading-[1.75] text-sm">
                {t(service.description)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
