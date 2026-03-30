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
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Ready to make your move?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Whether you are looking to find your dream home or sell your property for maximum value, our hybrid approach guarantees results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/sell" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Key size={22} />
                Sell My Property
              </Link>
              
              <Link href="/buy" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300">
                <Home size={22} />
                Find a Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
