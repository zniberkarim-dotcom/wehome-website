import { motion } from "framer-motion";
import { Users, MapPin, BarChart2, Network } from "lucide-react";
import { useTranslation } from "react-i18next";

/** `upcoming` marks a tile that is not a verified metric yet, so it is styled
 *  differently and never reads as a fourth fact next to the live ones. */
const STATS = [
  { icon: Users, valueKey: "stats.clients_value", labelKey: "stats.clients_label" },
  { icon: MapPin, valueKey: "stats.cities_value", labelKey: "stats.cities_label" },
  { icon: BarChart2, valueKey: "stats.prices_value", labelKey: "stats.prices_label" },
  {
    icon: Network,
    valueKey: "stats.network_value",
    labelKey: "stats.network_label",
    upcoming: true,
  },
];

export function StatsBar() {
  const { t } = useTranslation();

  return (
    <section className="bg-foreground border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
          {STATS.map(({ icon: Icon, valueKey, labelKey, upcoming }, i) => (
            <motion.div
              key={labelKey}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 py-5 px-4 sm:px-6 lg:px-8"
            >
              <Icon
                size={18}
                className={upcoming ? "text-white/25 shrink-0" : "text-primary shrink-0"}
              />
              <div className="min-w-0">
                <p
                  className={
                    upcoming
                      ? "text-white/50 font-semibold text-sm leading-tight"
                      : "text-white font-bold text-sm leading-tight"
                  }
                >
                  {t(valueKey)}
                </p>
                <p className="text-white/40 text-xs leading-tight truncate">{t(labelKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
