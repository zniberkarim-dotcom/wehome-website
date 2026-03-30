import { motion } from "framer-motion";
import { Eye, Target, ArrowUpCircle, Users } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      icon: <Eye size={28} />,
      title: "Creation de Visibilite",
      description: "Nous ne listons pas simplement votre bien ; nous creons activement de la visibilite sur plusieurs plateformes pour une exposition maximale."
    },
    {
      icon: <Target size={28} />,
      title: "Generation de Demande",
      description: "Grace a des funnels marketing avances, nous generons une demande ciblee plutot que d'attendre que les acheteurs vous trouvent."
    },
    {
      icon: <ArrowUpCircle size={28} />,
      title: "Valeur Percue",
      description: "Notre production media haut de gamme et notre mise en scene elevent la valeur percue de votre bien, garantissant de meilleures offres."
    },
    {
      icon: <Users size={28} />,
      title: "Leads Qualifies",
      description: "Notre approche data-driven filtre les curieux et vous connecte uniquement avec des acheteurs serieux et qualifies."
    }
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] rounded-full border-[60px] border-white/5 opacity-50" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/5 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
          
          <motion.div 
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Pourquoi choisir WeHome ?
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              Nous utilisons des outils modernes pour reinventer l'immobilier. Decouvrez la puissance d'une agence construite pour le marche d'aujourd'hui.
            </p>
            <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Decouvrir notre methode
            </button>
          </motion.div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:bg-white/15 transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-primary flex items-center justify-center mb-6 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
