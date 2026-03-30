import { motion } from "framer-motion";
import { Link } from "wouter";
import { Award, MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { formatCAD } from "@/lib/utils";

export function PepiteDuMois() {
  const pepite = {
    id: 100,
    title: "The Architectural Masterpiece",
    address: "Summit Circle, Westmount, QC",
    price: 4500000,
    description: "An extraordinary modern marvel nestled in the prestigious Westmount neighborhood. This custom-built residence features floor-to-ceiling windows, a private infinity pool, and sweeping views of the city skyline. A true testament to luxury living.",
    beds: 5,
    baths: 6,
    sqft: 6500,
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <Award size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            La Pépite du Mois
          </h2>
        </div>

        <div className="bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-2xl flex flex-col lg:flex-row">
          
          {/* Image Side */}
          <div className="w-full lg:w-3/5 relative min-h-[400px] lg:min-h-[600px] bg-slate-100">
            <img 
              src={`${import.meta.env.BASE_URL}images/pepite.png`}
              alt="La Pepite du Mois"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Gradient for text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
            
            {/* Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-accent-foreground font-bold rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
              <Award size={18} />
              <span>Gem of the Month</span>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Exclusive Listing</span>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                  {pepite.title}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-6">
                  <MapPin size={20} className="shrink-0 mt-1" />
                  <span className="text-lg">{pepite.address}</span>
                </div>
                <div className="text-4xl font-display font-bold text-primary mb-6">
                  {formatCAD(pepite.price)}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {pepite.description}
              </p>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/80 mb-8">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Bed size={20} />
                  </div>
                  <span className="font-semibold">{pepite.beds} Beds</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 border-x border-border/80">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Bath size={20} />
                  </div>
                  <span className="font-semibold">{pepite.baths} Baths</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Square size={20} />
                  </div>
                  <span className="font-semibold">{pepite.sqft} sqft</span>
                </div>
              </div>

              <Link 
                href={`/property/${pepite.id}`} 
                className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary transition-colors duration-300 group"
              >
                Discover the Gem
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
