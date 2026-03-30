import { motion } from "framer-motion";
import { Sparkles, LineChart, Video } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Sparkles size={32} />,
      title: "Marketing Intelligent",
      description: "Nous transformons les biens en produits hautement attractifs grace a la mise en scene professionnelle, un contenu visuel exceptionnel et une diffusion ciblee."
    },
    {
      icon: <LineChart size={32} />,
      title: "Strategie Data-Driven",
      description: "Nous testons differents angles de communication, analysons les performances et optimisons pour capter les leads les plus qualifies."
    },
    {
      icon: <Video size={32} />,
      title: "Media & Contenu",
      description: "En tant que media immobilier, nous produisons du contenu a forte valeur ajoutee : analyses de marche, guides d'achat et strategies d'investissement."
    }
  ];

  return (
    <section className="py-24 bg-secondary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6"
          >
            Pas une agence immobiliere classique.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Nous sommes un ecosysteme hybride combinant Immobilier, Marketing, Generation de leads et Media. Voici comment nous reinventons l'experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
