import { motion } from "framer-motion";
import { ArrowRight, Home, Key } from "lucide-react";
import { Link } from "wouter";

export function CtaSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-card rounded-[3rem] p-10 md:p-16 border border-border shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Prêt à passer à l'action ?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Que vous cherchiez votre futur chez-vous ou que vous souhaitiez vendre votre bien au meilleur prix, notre approche hybride garantit des résultats.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href={`https://wa.me/212653535156?text=${encodeURIComponent("Bonjour WeHome,\n\nJe souhaite vendre mon bien immobilier.\n\nPouvez-vous me contacter pour en discuter ?\n\nMerci !")}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Key size={22} />
                Vendre mon bien
              </a>
              
              <Link href="/acheter" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300">
                <Home size={22} />
                Trouver un bien
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
