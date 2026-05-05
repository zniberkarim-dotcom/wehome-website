import { motion } from "framer-motion";
import { Users, MapPin, BarChart2, Network } from "lucide-react";

const STATS = [
  { icon: Users,    value: "500+",    label: "clients accompagnés" },
  { icon: MapPin,   value: "5 villes", label: "Casa · Rabat · Marra · Tanger · et plus" },
  { icon: BarChart2,value: "Temps réel", label: "Prix du marché actualisés" },
  { icon: Network,  value: "Réseau",  label: "Agences partenaires — bientôt" },
];

export function StatsBar() {
  return (
    <section className="bg-foreground border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center gap-3 py-5 px-4 sm:px-6 lg:px-8"
            >
              <Icon size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight">{value}</p>
                <p className="text-white/40 text-xs leading-tight truncate">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
