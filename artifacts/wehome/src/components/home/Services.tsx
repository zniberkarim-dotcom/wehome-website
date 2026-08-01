import { motion } from "framer-motion";
import { TrendingUp, FileCheck, Globe } from "lucide-react";

const SERVICES = [
  {
    icon: <TrendingUp size={32} />,
    title: "Intelligence de marché",
    description:
      "Nous transformons la donnée brute des transactions marocaines en insights actionnables — prix réels au m², délais de vente, tendances par quartier. L'information que vous méritez.",
  },
  {
    icon: <FileCheck size={32} />,
    title: "Biens certifiés WeHome",
    description:
      "Chaque propriété sur notre plateforme est visitée, vérifiée, mandatée. Nos standards éliminent les annonces fantômes et les prix fictifs. La qualité du listing protège l'acheteur.",
  },
  {
    icon: <Globe size={32} />,
    title: "Distribution nationale",
    description:
      "Votre bien est exposé à notre audience nationale — acheteurs locaux, investisseurs, diaspora marocaine à l'étranger. Une portée que les agences isolées ne peuvent pas offrir.",
  },
];

export function Services() {
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
            La plateforme
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5"
          >
            Ce que WeHome apporte
            <br />
            que personne d'autre n'offre.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base leading-relaxed"
          >
            Entre les plateformes qui abandonnent les acheteurs et les agences qui manquent de
            données — WeHome construit le standard que le marché attendait.
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
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-[1.75] text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
