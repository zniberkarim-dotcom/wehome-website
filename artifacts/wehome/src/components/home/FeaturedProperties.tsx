import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProperties } from "@/lib/data";
import { PropertyCard } from "./PropertyCard";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

export function FeaturedProperties() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: fetchFeaturedProperties,
  });

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Biens en vedette
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Découvrez notre sélection de biens immobiliers premium, commercialisés avec notre
              approche data-driven unique.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/biens"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors group"
            >
              Voir toutes les annonces
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Aucun bien disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <Link
            href="/biens"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-[6px] hover:bg-primary-hover transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group shadow-md shadow-black/5"
          >
            Voir toutes les annonces
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
