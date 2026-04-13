import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchProperty, getPropertyImageUrls, submitLead } from "@/lib/data";
import { formatMAD } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import {
  MapPin, Bed, Bath, Square, Sofa, ArrowLeft,
  Building2, Layers, CheckCircle2, Phone, ChevronLeft, ChevronRight,
  X, Maximize2, Loader2, LayoutGrid, Send, CheckCircle
} from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";

export default function BienPage() {
  const params = useParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());
  const [fullscreen, setFullscreen] = useState(false);

  // ── Contact form state ────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", params.id],
    queryFn: () => fetchProperty(params.id),
    enabled: !!params.id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Not found or error
  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">Bien introuvable</h1>
            <p className="text-muted-foreground mb-8">Ce bien n'existe pas ou a été retiré.</p>
            <Link href="/biens" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              <ArrowLeft size={18} />
              Retour aux biens
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrls = getPropertyImageUrls(property);
  const validCount = imageUrls.length - failedIndexes.size;
  const hasImages = validCount > 0;
  const hasMultiple = validCount > 1;

  const hasPrice = property.price > 0;
  const showBeds = property.beds !== undefined && property.beds > 0;
  const showBaths = property.baths !== undefined && property.baths > 0;
  const showSalons = property.salons !== undefined && property.salons > 0;
  const showRooms = property.rooms !== undefined && property.rooms > 0 && !showBeds;

  const specs = [
    showBeds && { icon: Bed, label: `${property.beds} Chambre${(property.beds ?? 0) > 1 ? "s" : ""}`, key: "beds" },
    showRooms && { icon: LayoutGrid, label: `${property.rooms} Pièce${(property.rooms ?? 0) > 1 ? "s" : ""}`, key: "rooms" },
    showSalons && { icon: Sofa, label: `${property.salons} Salon${(property.salons ?? 0) > 1 ? "s" : ""}`, key: "salons" },
    showBaths && { icon: Bath, label: `${property.baths} Salle${(property.baths ?? 0) > 1 ? "s" : ""} de bain`, key: "baths" },
    property.surface > 0 && { icon: Square, label: property.surfaceLabel || `${property.surface.toLocaleString("fr-FR")} m²`, key: "surface" },
    property.floor && { icon: Layers, label: property.floor, key: "floor" },
    { icon: Building2, label: property.type, key: "type" },
    property.furnished && { icon: CheckCircle2, label: "Meublé", key: "furnished" },
  ].filter(Boolean) as { icon: typeof Bed; label: string; key: string }[];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  const { onTouchStart, onTouchEnd } = useSwipe(goNext, goPrev);

  const handleImgError = useCallback((index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [fullscreen, goNext, goPrev]);

  const whatsappMessage = encodeURIComponent(
    `Bonjour WeHome,\n\nJe suis intéressé(e) par le bien "${property.title}" (Réf: ${property.reference ?? property.id}) situé à ${property.location}.\n\nPouvez-vous me donner plus d'informations ?\n\nMerci !`
  );
  const whatsappUrl = `https://wa.me/212653535156?text=${whatsappMessage}`;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;
    setFormLoading(true);
    setFormError("");
    try {
      await submitLead({
        name: formName,
        phone: formPhone,
        email: formEmail,
        message: formMessage || `Intéressé(e) par le bien ${property.reference ?? property.id} — ${property.title}`,
        property_reference: property.reference ?? property.id,
      });
      setFormSuccess(true);
    } catch {
      setFormError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {fullscreen && hasImages && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-lg">
              {currentIndex + 1} / {imageUrls.length}
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div
            className="flex-1 relative flex items-center justify-center"
            onTouchStart={hasMultiple ? onTouchStart : undefined}
            onTouchEnd={hasMultiple ? onTouchEnd : undefined}
          >
            {imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${property.title} - Photo ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
            {hasMultiple && (
              <>
                <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
          {hasMultiple && (
            <div className="flex justify-center gap-2 p-4">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/biens" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-6 transition-colors">
              <ArrowLeft size={18} />
              Retour aux biens
            </Link>

            {/* Image gallery */}
            <div className={`group relative w-full rounded-3xl overflow-hidden mb-8 ${!hasImages ? property.gradientClass + ' aspect-video' : ''}`}>
              {hasImages && (
                <div
                  className="relative aspect-[4/5] md:aspect-[3/2] w-full"
                  onTouchStart={hasMultiple ? onTouchStart : undefined}
                  onTouchEnd={hasMultiple ? onTouchEnd : undefined}
                >
                  {imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${property.title} - Photo ${i + 1}`}
                      className={`absolute inset-0 w-full h-full object-contain bg-gray-50 transition-opacity duration-300 cursor-pointer ${i === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      onError={() => handleImgError(i)}
                      onClick={() => setFullscreen(true)}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ))}

                  {hasMultiple && (
                    <>
                      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10">
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {imageUrls.map((_, i) => (
                          <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-white w-6 shadow-md' : 'bg-white/60 hover:bg-white/80'}`} />
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        <button onClick={() => setFullscreen(true)} className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                          <Maximize2 size={18} />
                        </button>
                        <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                          {currentIndex + 1} / {imageUrls.length}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-foreground text-sm font-bold rounded-lg shadow-sm">{property.type}</span>
                <span className={`px-4 py-1.5 text-white text-sm font-bold rounded-lg shadow-sm ${property.transaction === "Location" ? "bg-foreground" : "bg-primary"}`}>
                  {property.transaction}
                </span>
                {property.furnished && (
                  <span className="px-4 py-1.5 bg-primary/80 text-white text-sm font-bold rounded-lg shadow-sm">Meublé</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: details */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">{property.title}</h1>
                  <div className="flex items-start gap-2 text-muted-foreground mb-4">
                    <MapPin size={20} className="shrink-0 mt-1" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                    {hasPrice ? (
                      <>
                        {formatMAD(property.price)}
                        {property.isRental && <span className="text-xl font-medium text-muted-foreground">/mois</span>}
                      </>
                    ) : (
                      <span className="text-2xl">{property.priceLabel || "Prix sur demande"}</span>
                    )}
                  </div>
                  {hasPrice && property.priceLabel && (
                    <p className="text-sm text-muted-foreground mt-1">{property.priceLabel}</p>
                  )}
                </div>

                {specs.length > 0 && (
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-4">Caractéristiques</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {specs.map((spec) => (
                        <div key={spec.key} className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <spec.icon size={20} />
                          </div>
                          <span className="font-medium text-foreground text-sm">{spec.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.description && (
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-4">Description</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: contact form */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-card border border-border rounded-3xl p-8 shadow-lg space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prix</p>
                    <p className="text-2xl font-display font-bold text-primary">
                      {hasPrice ? formatMAD(property.price) : (property.priceLabel || "Sur demande")}
                      {hasPrice && property.isRental && <span className="text-base font-medium text-muted-foreground">/mois</span>}
                    </p>
                  </div>

                  <hr className="border-border" />

                  {formSuccess ? (
                    <div className="text-center py-4">
                      <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                      <p className="font-display font-bold text-foreground text-lg mb-1">Message envoyé !</p>
                      <p className="text-sm text-muted-foreground">Notre équipe vous contactera très prochainement.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-display font-bold text-foreground mb-1">Contactez WeHome</h3>
                      <p className="text-sm text-muted-foreground mb-5">
                        Intéressé par ce bien ? Laissez-nous vos coordonnées.
                      </p>

                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Votre nom *"
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        <input
                          type="tel"
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="Téléphone *"
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="Email (optionnel)"
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        <textarea
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Votre message..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                        />

                        {formError && (
                          <p className="text-xs text-destructive">{formError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full py-3.5 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors duration-300 disabled:opacity-60"
                        >
                          {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                          {formLoading ? "Envoi en cours..." : "Envoyer"}
                        </button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-xl border-2 border-foreground text-foreground font-bold flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors duration-300 text-sm"
                        >
                          <Phone size={16} />
                          WhatsApp
                        </a>
                      </form>
                    </div>
                  )}

                  <hr className="border-border" />

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Référence: {property.reference ?? property.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
