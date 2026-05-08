import { MapPin, Bed, Bath, Square, ArrowRight, Sofa, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatMAD } from "@/lib/utils";
import { useState, useCallback } from "react";
import type { Property } from "@/lib/data";
import { getPropertyImageUrls } from "@/lib/data";
import { useSwipe } from "@/hooks/useSwipe";
import { FavoriteButton } from "@/components/favoris/FavoriteButton";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const [, navigate] = useLocation();

  const imageUrls = getPropertyImageUrls(property);
  const hasImages = imageUrls.length > 0;
  const hasMultiple = imageUrls.length > 1;

  const showBeds = property.beds !== undefined && property.beds > 0;
  const showBaths = property.baths !== undefined && property.baths > 0;
  const showSalons = property.salons !== undefined && property.salons > 0;
  // Fallback: show total rooms as "Pièces" when individual room counts are absent
  const showRooms = !showBeds && !showSalons && property.rooms !== undefined && property.rooms > 0;
  const isTerrain = ["Terrain", "Bâtiment industriel", "Commerce", "Ferme"].includes(property.type);
  const hasPrice = property.price > 0;

  const statCount = [showBeds || showRooms, showBaths, showSalons, true].filter(Boolean).length;

  const goNextIndex = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goPrevIndex = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    goNextIndex();
  }, [goNextIndex]);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    goPrevIndex();
  }, [goPrevIndex]);

  const { onTouchStart, onTouchEnd, didSwipe } = useSwipe(goNextIndex, goPrevIndex);

  const handleImgError = useCallback((index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  }, []);

  const currentImageFailed = failedIndexes.has(currentIndex);
  const showImage = hasImages && !currentImageFailed;

  return (
    <div className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-1">
      <div
        role="link"
        tabIndex={0}
        onClick={() => { if (!didSwipe.current) navigate(`/bien/${property.id}`); }}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/bien/${property.id}`); }}
        onTouchStart={hasMultiple ? onTouchStart : undefined}
        onTouchEnd={hasMultiple ? onTouchEnd : undefined}
        className={`relative aspect-[4/5] w-full overflow-hidden cursor-pointer ${!showImage ? property.gradientClass : ''}`}
      >
        {hasImages && imageUrls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${property.title} - Photo ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            onError={() => handleImgError(i)}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold rounded-lg shadow-sm">
            {property.type}
          </span>
          <span className={`px-3 py-1 text-white text-xs font-bold rounded-lg shadow-sm ${
            property.transaction === "Location" ? "bg-foreground" : "bg-primary"
          }`}>
            {property.transaction}
          </span>
          {property.furnished && (
            <span className="px-3 py-1 bg-primary/80 text-white text-xs font-bold rounded-lg shadow-sm">
              Meublé
            </span>
          )}
        </div>
        
        <FavoriteButton
          propertyId={property.id}
          variant="floating"
          size="md"
          className="absolute top-4 right-4 z-10"
        />

        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md z-10"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentIndex ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-2xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {hasPrice ? (
              <>
                {formatMAD(property.price)}{property.isRental ? <span className="text-base font-medium text-muted-foreground">/mois</span> : ""}
              </>
            ) : (
              <span className="text-lg">{property.priceLabel || "Prix sur demande"}</span>
            )}
          </h3>
          {hasPrice && property.priceLabel && (
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
          <div className={`grid gap-0 py-0 border-y border-border/60 mt-auto divide-x divide-border/60 ${
            statCount === 4 ? 'grid-cols-4' : statCount === 3 ? 'grid-cols-3' : statCount === 2 ? 'grid-cols-2' : 'grid-cols-1'
          }`}>
            {showBeds && (
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2">
                <Bed size={18} style={{ color: "#8B1A2E" }} />
                <span className="text-xs font-bold text-foreground">{property.beds}</span>
                <span className="text-[10px] text-muted-foreground">Ch.</span>
              </div>
            )}
            {showRooms && (
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2">
                <Bed size={18} style={{ color: "#8B1A2E" }} />
                <span className="text-xs font-bold text-foreground">{property.rooms}</span>
                <span className="text-[10px] text-muted-foreground">Pces.</span>
              </div>
            )}
            {showSalons && (
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2">
                <Sofa size={18} style={{ color: "#8B1A2E" }} />
                <span className="text-xs font-bold text-foreground">{property.salons}</span>
                <span className="text-[10px] text-muted-foreground">Sal.</span>
              </div>
            )}
            {showBaths && (
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2">
                <Bath size={18} style={{ color: "#8B1A2E" }} />
                <span className="text-xs font-bold text-foreground">{property.baths}</span>
                <span className="text-[10px] text-muted-foreground">SdB</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2">
              <Square size={18} style={{ color: "#8B1A2E" }} />
              <span className="text-xs font-bold text-foreground">{property.surface > 0 ? property.surface.toLocaleString("fr-FR") : "—"}</span>
              <span className="text-[10px] text-muted-foreground">m²</span>
            </div>
          </div>
        )}

        <div className="pt-4 mt-2">
          <Link href={`/bien/${property.id}`} className="w-full py-3 rounded-xl bg-secondary hover:bg-primary hover:text-white text-secondary-foreground font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/btn">
            Voir les détails
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
