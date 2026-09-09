import { motion } from "framer-motion";
import { Users, MapPin, BarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Verified metrics only — nothing speculative belongs in this bar. */
const STATS = [
  { icon: Users, valueKey: "stats.clients_value", labelKey: "stats.clients_label" },
  { icon: MapPin, valueKey: "stats.cities_value", labelKey: "stats.cities_label" },
  { icon: BarChart2, valueKey: "stats.prices_value", labelKey: "stats.prices_label" },
];

export function StatsBar() {
  const { t } = useTranslation();

  return (
    <section className="bg-foreground border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-white/8">
          {STATS.map(({ icon: Icon, valueKey, labelKey }, i) => (
            <motion.div
              key={labelKey}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 py-5 px-4 sm:px-6 lg:px-8"
            >
              <Icon size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight">{t(valueKey)}</p>
                <p className="text-white/40 text-xs leading-tight truncate">{t(labelKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
