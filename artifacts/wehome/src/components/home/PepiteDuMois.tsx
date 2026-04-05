import { motion } from "framer-motion";
import { Link } from "wouter";
import { Award, MapPin, Bed, Bath, Square, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMAD } from "@/lib/utils";
import { PEPITE_DU_MOIS, getPropertyImageUrls } from "@/lib/data";
import { useState, useCallback } from "react";
import { useSwipe } from "@/hooks/useSwipe";

export function PepiteDuMois() {
  const pepite = PEPITE_DU_MOIS;
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageUrls = getPropertyImageUrls(pepite);
  const validCount = imageUrls.length - failedIndexes.size;
  const hasImages = validCount > 0;
  const hasMultiple = validCount > 1;

  const goNextIndex = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goPrevIndex = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goNextIndex();
  }, [goNextIndex]);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goPrevIndex();
  }, [goPrevIndex]);

  const { onTouchStart, onTouchEnd } = useSwipe(goNextIndex, goPrevIndex);

  const handleImgError = useCallback((index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  }, []);

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
          
          <div
            className={`group w-full lg:w-3/5 relative min-h-[400px] lg:min-h-[600px] ${!hasImages ? 'bg-slate-100' : ''}`}
            onTouchStart={hasMultiple ? onTouchStart : undefined}
            onTouchEnd={hasMultiple ? onTouchEnd : undefined}
          >
            {hasImages ? (
              <>
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${pepite.title} - Photo ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    onError={() => handleImgError(i)}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                ))}
                {hasMultiple && (
                  <>
                    <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                      <ChevronLeft size={22} />
                    </button>
                    <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                      <ChevronRight size={22} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {imageUrls.map((_, i) => (
                        <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }} className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-white w-5 shadow-md' : 'bg-white/60 hover:bg-white/80'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img 
                src={`${import.meta.env.BASE_URL}images/pepite.png`}
                alt="La Pépite du Mois"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden pointer-events-none" />
            
            <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-accent-foreground font-bold rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 z-10">
              <Award size={18} />
              <span>Pépite du Mois</span>
            </div>
          </div>

          <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <span className="text-primary font-bold tracking-wider uppercase text-sm">Annonce Exclusive</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-md">{pepite.transaction}</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                  {pepite.title}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-6">
                  <MapPin size={20} className="shrink-0 mt-1" />
                  <span className="text-lg">{pepite.location}</span>
                </div>
                <div className="text-4xl font-display font-bold text-primary mb-6">
                  {formatMAD(pepite.price)}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {pepite.description}
              </p>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/80 mb-8">
                {pepite.beds && (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bed size={20} />
                    </div>
                    <span className="font-semibold">{pepite.beds} Ch.</span>
                  </div>
                )}
                {pepite.baths && (
                  <div className="flex flex-col items-center justify-center gap-2 border-x border-border/80">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <Bath size={20} />
                    </div>
                    <span className="font-semibold">{pepite.baths} SdB</span>
                  </div>
                )}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Square size={20} />
                  </div>
                  <span className="font-semibold">{pepite.surface} m²</span>
                </div>
              </div>

              <Link 
                href={`/bien/${pepite.id}`} 
                className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary transition-colors duration-300 group"
              >
                Découvrir la Pépite
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
