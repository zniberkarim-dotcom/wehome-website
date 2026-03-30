import { motion } from "framer-motion";
import { Sparkles, LineChart, Video } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Sparkles size={32} />,
      title: "Smart Marketing",
      description: "We transform properties into highly attractive products through professional staging, exceptional visual content, and targeted distribution channels."
    },
    {
      icon: <LineChart size={32} />,
      title: "Data-Driven Strategy",
      description: "We don't just guess; we test different communication angles, analyze performance metrics, and optimize to capture the most qualified leads."
    },
    {
      icon: <Video size={32} />,
      title: "Media & Content",
      description: "As a media company, we produce high-value content including market analysis, neighborhood guides, and investment strategies to build trust."
    }
  ];

  return (
    <section className="py-24 bg-secondary/50 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6"
          >
            Not your classic real estate agency.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            We are a hybrid ecosystem combining Real Estate, Marketing, Lead Generation, and Media. Here is how we redefine the experience.
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
