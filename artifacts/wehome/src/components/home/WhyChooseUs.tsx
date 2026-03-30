import { motion } from "framer-motion";
import { Eye, Target, ArrowUpCircle, Users } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      icon: <Eye size={28} />,
      title: "Visibility Creation",
      description: "We don't just list your property; we actively create visibility across multiple platforms to ensure maximum exposure."
    },
    {
      icon: <Target size={28} />,
      title: "Demand Generation",
      description: "Using advanced marketing funnels, we generate targeted demand rather than waiting for buyers to find you."
    },
    {
      icon: <ArrowUpCircle size={28} />,
      title: "Perceived Value",
      description: "Our high-end media production and staging elevate the perceived value of your property, securing higher offers."
    },
    {
      icon: <Users size={28} />,
      title: "Qualified Leads",
      description: "Our data-driven approach filters out window shoppers, connecting you only with serious, qualified buyers."
    }
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Abstract background graphics */}
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
              Why Choose WeHome?
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              We leverage modern tools to reinvent how real estate is bought and sold. Experience the power of an agency built for today's market.
            </p>
            <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Learn about our method
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
