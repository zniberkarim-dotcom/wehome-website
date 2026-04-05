import { MapPin, Bed, Bath, Square, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { formatMAD } from "@/lib/utils";
import { useState } from "react";
import type { Property } from "@/lib/data";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const showBeds = property.beds !== undefined && property.beds > 0;
  const showBaths = property.baths !== undefined && property.baths > 0;
  const isTerrain = ["Terrain", "Bâtiment industriel", "Commerce", "Ferme"].includes(property.type);

  return (
    <div 
      className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative h-64 w-full ${property.gradientClass} overflow-hidden`}>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold rounded-lg shadow-sm">
            {property.type}
          </span>
          <span className={`px-3 py-1 text-white text-xs font-bold rounded-lg shadow-sm ${
            property.transaction === "Location" ? "bg-blue-600" : "bg-primary"
          }`}>
            {property.transaction}
          </span>
          {property.furnished && (
            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
              Meublé
            </span>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-destructive hover:scale-110 transition-all shadow-sm"
        >
          <Heart size={20} className={isLiked ? "fill-destructive text-destructive" : ""} />
        </button>

        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-2xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {formatMAD(property.price)}{property.isRental ? <span className="text-base font-medium text-muted-foreground">/mois</span> : ""}
          </h3>
          {property.priceLabel && (
            <p className="text-xs text-muted-foreground">{property.priceLabel}</p>
          )}
          <p className="font-semibold text-foreground/90 line-clamp-1">{property.title}</p>
          <div className="flex items-start gap-1.5 mt-2 text-muted-foreground">
            <MapPin size={16} className="shrink-0 mt-0.5" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {isTerrain ? (
          <div className="flex items-center justify-center gap-2 py-4 border-y border-border/60 mt-auto">
            <Square size={20} className="text-primary/70" />
            <span className="text-sm font-medium">{property.surfaceLabel || `${property.surface.toLocaleString("fr-FR")} m²`}</span>
          </div>
        ) : (
          <div className={`grid gap-4 py-4 border-y border-border/60 mt-auto ${showBeds && showBaths ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {showBeds && (
              <div className="flex flex-col items-center justify-center gap-1">
                <Bed size={20} className="text-primary/70" />
                <span className="text-sm font-medium">{property.beds} Ch.</span>
              </div>
            )}
            {showBaths && (
              <div className={`flex flex-col items-center justify-center gap-1 ${showBeds ? 'border-x border-border/60' : ''}`}>
                <Bath size={20} className="text-primary/70" />
                <span className="text-sm font-medium">{property.baths} SdB</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-1">
              <Square size={20} className="text-primary/70" />
              <span className="text-sm font-medium">{property.surface} m²</span>
            </div>
          </div>
        )}

        <div className="pt-4 mt-2">
          <Link href={`/bien/${property.id}`} className="w-full py-3 rounded-xl bg-secondary hover:bg-primary hover:text-white text-secondary-foreground font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/btn">
            Voir les details
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
