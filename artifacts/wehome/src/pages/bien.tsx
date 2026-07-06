import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  fetchProperty,
  fetchAgentById,
  getPropertyImageUrls,
  submitLead,
  submitAppointment,
} from "@/lib/data";
import { formatMAD } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Sofa,
  ArrowLeft,
  Building2,
  Layers,
  CheckCircle2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Loader2,
  LayoutGrid,
  Send,
  CheckCircle,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSwipe } from "@/hooks/useSwipe";
import { MortgageCalculator } from "@/components/financement/MortgageCalculator";
import { FavoriteButton } from "@/components/favoris/FavoriteButton";

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

  // ── RDV modal state ───────────────────────────────────────────────────────
  const [rdvOpen, setRdvOpen] = useState(false);
  const [rdvName, setRdvName] = useState("");
  const [rdvPhone, setRdvPhone] = useState("");
  const [rdvEmail, setRdvEmail] = useState("");
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("10:00");
  const [rdvLoading, setRdvLoading] = useState(false);
  const [rdvSuccess, setRdvSuccess] = useState(false);
  const [rdvError, setRdvError] = useState("");

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["property", params.id],
    queryFn: () => fetchProperty(params.id),
    enabled: !!params.id,
  });

  // Fetch the linked agent when agentId is available
  const { data: agentData } = useQuery({
    queryKey: ["agent-for-property", property?.agentId],
    queryFn: () => fetchAgentById(property!.agentId!),
    enabled: !!property?.agentId,
  });

  // ── Hooks that must run unconditionally (before any early return) ─────────
  const imageUrls = useMemo(() => (property ? getPropertyImageUrls(property) : []), [property]);

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
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Bien introuvable
            </h1>
            <p className="text-muted-foreground mb-8">Ce bien n'existe pas ou a été retiré.</p>
            <Link
              href="/biens"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour aux biens
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const validCount = imageUrls.length - failedIndexes.size;
  const hasImages = validCount > 0;
  const hasMultiple = validCount > 1;

  const hasPrice = property.price > 0;
  const showBeds = property.beds !== undefined && property.beds > 0;
  const showBaths = property.baths !== undefined && property.baths > 0;
  const showSalons = property.salons !== undefined && property.salons > 0;
  const showRooms = property.rooms !== undefined && property.rooms > 0 && !showBeds;

  const specs = [
    showBeds && {
      icon: Bed,
      label: `${property.beds} Chambre${(property.beds ?? 0) > 1 ? "s" : ""}`,
      key: "beds",
    },
    showRooms && {
      icon: LayoutGrid,
      label: `${property.rooms} Pièce${(property.rooms ?? 0) > 1 ? "s" : ""}`,
      key: "rooms",
    },
    showSalons && {
      icon: Sofa,
      label: `${property.salons} Salon${(property.salons ?? 0) > 1 ? "s" : ""}`,
      key: "salons",
    },
    showBaths && {
      icon: Bath,
      label: `${property.baths} Salle${(property.baths ?? 0) > 1 ? "s" : ""} de bain`,
      key: "baths",
    },
    property.surface > 0 && {
      icon: Square,
      label: property.surfaceLabel || `${property.surface.toLocaleString("fr-FR")} m²`,
      key: "surface",
    },
    property.floor && { icon: Layers, label: property.floor, key: "floor" },
    { icon: Building2, label: property.type, key: "type" },
    property.furnished && { icon: CheckCircle2, label: "Meublé", key: "furnished" },
  ].filter(Boolean) as { icon: typeof Bed; label: string; key: string }[];

  const whatsappMessage = encodeURIComponent(
    `Bonjour WeHome,\n\nJe suis intéressé(e) par le bien "${property.title}" (Réf: ${property.reference ?? property.id}) situé à ${property.location}.\n\nPouvez-vous me donner plus d'informations ?\n\nMerci !`
  );
  const whatsappUrl = `https://wa.me/212653535156?text=${whatsappMessage}`;

  const handleRdvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdvName || !rdvPhone || !rdvDate || !rdvTime) return;
    setRdvLoading(true);
    setRdvError("");
    try {
      await submitAppointment({
        property_id: property!.id,
        property_title: property!.title,
        agent_name: property!.agent,
        visitor_name: rdvName,
        visitor_phone: rdvPhone,
        visitor_email: rdvEmail || undefined,
        appointment_date: rdvDate,
        appointment_time: rdvTime,
        notes: `RDV depuis wehome.ma — Réf: ${property!.reference ?? property!.id}`,
      });
      setRdvSuccess(true);
    } catch {
      setRdvError("Erreur lors de la réservation. Veuillez réessayer.");
    } finally {
      setRdvLoading(false);
    }
  };

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
        message:
          formMessage ||
          `Intéressé(e) par le bien ${property.reference ?? property.id} — ${property.title}`,
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
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
            {hasMultiple && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
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
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/biens"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour aux biens
            </Link>

            {/* Image gallery */}
            <div
              className={`group relative w-full rounded-3xl overflow-hidden mb-8 ${!hasImages ? property.gradientClass + " aspect-video" : ""}`}
            >
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
                      className={`absolute inset-0 w-full h-full object-contain bg-gray-50 transition-opacity duration-300 cursor-pointer ${i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                      onError={() => handleImgError(i)}
                      onClick={() => setFullscreen(true)}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ))}

                  {hasMultiple && (
                    <>
                      <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg z-10"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {imageUrls.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentIndex ? "bg-white w-6 shadow-md" : "bg-white/60 hover:bg-white/80"}`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        <button
                          onClick={() => setFullscreen(true)}
                          className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
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
                {property.status === "Réservé" && (
                  <span className="px-4 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-lg shadow-md uppercase tracking-wide">
                    Réservé
                  </span>
                )}
                {property.status === "Sous compromis" && (
                  <span className="px-4 py-1.5 bg-orange-600 text-white text-sm font-bold rounded-lg shadow-md uppercase tracking-wide">
                    Sous compromis
                  </span>
                )}
                {property.isPepite && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-lg shadow-md uppercase tracking-wide flex items-center gap-1.5">
                    ★ Pépite du mois
                  </span>
                )}
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-foreground text-sm font-bold rounded-lg shadow-sm">
                  {property.type}
                </span>
                <span
                  className={`px-4 py-1.5 text-white text-sm font-bold rounded-lg shadow-sm ${property.transaction === "Location" ? "bg-foreground" : "bg-primary"}`}
                >
                  {property.transaction}
                </span>
                {property.furnished && (
                  <span className="px-4 py-1.5 bg-primary/80 text-white text-sm font-bold rounded-lg shadow-sm">
                    Meublé
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: details */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                      {property.title}
                    </h1>
                    <FavoriteButton
                      propertyId={property.id}
                      variant="inline"
                      size="md"
                      stopPropagation={false}
                    />
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground mb-4">
                    <MapPin size={20} className="shrink-0 mt-1" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                    {hasPrice ? (
                      <>
                        {formatMAD(property.price)}
                        {property.isRental && (
                          <span className="text-xl font-medium text-muted-foreground">/mois</span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl">{property.priceLabel || "Prix sur demande"}</span>
                    )}
                  </div>
                  {hasPrice && property.priceLabel && (
                    <p className="text-sm text-muted-foreground mt-1">{property.priceLabel}</p>
                  )}

                  {/* Quick stats bar — like the screenshot */}
                  {(() => {
                    const hasBeds = property.beds && property.beds > 0;
                    const hasSalons = property.salons && property.salons > 0;
                    const hasBaths = property.baths && property.baths > 0;
                    const hasRoomsFallback =
                      !hasBeds && !hasSalons && property.rooms && property.rooms > 0;
                    const hasSurface = property.surface > 0;
                    if (!hasBeds && !hasSalons && !hasBaths && !hasRoomsFallback && !hasSurface)
                      return null;
                    return (
                      <div className="flex items-stretch divide-x divide-border/60 border border-border/60 rounded-2xl overflow-hidden mt-5">
                        {hasBeds && (
                          <div className="flex flex-col items-center justify-center gap-1 py-4 px-5 flex-1">
                            <Bed size={20} style={{ color: "#8B1A2E" }} />
                            <span className="text-sm font-bold text-foreground">
                              {property.beds}
                            </span>
                            <span className="text-xs text-muted-foreground">Ch.</span>
                          </div>
                        )}
                        {hasRoomsFallback && (
                          <div className="flex flex-col items-center justify-center gap-1 py-4 px-5 flex-1">
                            <Bed size={20} style={{ color: "#8B1A2E" }} />
                            <span className="text-sm font-bold text-foreground">
                              {property.rooms}
                            </span>
                            <span className="text-xs text-muted-foreground">Pièces</span>
                          </div>
                        )}
                        {hasSalons && (
                          <div className="flex flex-col items-center justify-center gap-1 py-4 px-5 flex-1">
                            <Sofa size={20} style={{ color: "#8B1A2E" }} />
                            <span className="text-sm font-bold text-foreground">
                              {property.salons}
                            </span>
                            <span className="text-xs text-muted-foreground">Sal.</span>
                          </div>
                        )}
                        {hasBaths && (
                          <div className="flex flex-col items-center justify-center gap-1 py-4 px-5 flex-1">
                            <Bath size={20} style={{ color: "#8B1A2E" }} />
                            <span className="text-sm font-bold text-foreground">
                              {property.baths}
                            </span>
                            <span className="text-xs text-muted-foreground">SdB</span>
                          </div>
                        )}
                        {hasSurface && (
                          <div className="flex flex-col items-center justify-center gap-1 py-4 px-5 flex-1">
                            <Square size={20} style={{ color: "#8B1A2E" }} />
                            <span className="text-sm font-bold text-foreground">
                              {property.surface.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-xs text-muted-foreground">m²</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {specs.length > 0 && (
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-4">
                      Caractéristiques
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {specs.map((spec) => (
                        <div
                          key={spec.key}
                          className="flex items-center gap-3 p-4 bg-secondary rounded-2xl"
                        >
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
                    <h2 className="text-xl font-display font-bold text-foreground mb-4">
                      Description
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Calculateur hypothécaire — visible uniquement pour les biens à la vente avec prix */}
                {!property.isRental && hasPrice && (
                  <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-display font-bold text-foreground mb-1">
                      Estimer votre financement
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Combien coûterait ce bien chaque mois ? Ajustez l'apport, la durée et le taux.
                    </p>
                    <MortgageCalculator initialPrix={property.price} compact />
                  </div>
                )}
              </div>

              {/* Right: contact form */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-card border border-border rounded-3xl p-8 shadow-lg space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prix</p>
                    <p className="text-2xl font-display font-bold text-primary">
                      {hasPrice ? formatMAD(property.price) : property.priceLabel || "Sur demande"}
                      {hasPrice && property.isRental && (
                        <span className="text-base font-medium text-muted-foreground">/mois</span>
                      )}
                    </p>
                  </div>

                  <hr className="border-border" />

                  {/* ── Agent widget ── */}
                  {agentData ? (
                    <div className="space-y-4">
                      {/* Photo + identité */}
                      <div className="flex flex-col items-center text-center gap-3 pt-1">
                        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 ring-4 ring-primary/10 bg-secondary">
                          {agentData.photo_url ? (
                            <img
                              src={agentData.photo_url}
                              alt={`${agentData.prenom} ${agentData.nom}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                              style={{ background: "#8B1A2E" }}
                            >
                              {agentData.prenom.charAt(0)}
                              {agentData.nom.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-display font-bold text-foreground text-lg leading-tight">
                            {agentData.prenom} {agentData.nom}
                          </p>
                          <p className="text-sm text-primary font-semibold mt-0.5">Agent WeHome</p>
                          {agentData.specialites && agentData.specialites.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                              {agentData.specialites.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground/60"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {agentData.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 text-center">
                          {agentData.bio}
                        </p>
                      )}

                      {/* Boutons contact */}
                      <div className="space-y-2">
                        <a
                          href={`tel:${agentData.telephone || "+212653535156"}`}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                        >
                          <Phone size={16} />
                          {agentData.telephone || "+212 6 53 53 51 56"}
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://wa.me/${(agentData.telephone || "212653535156").replace(/\D/g, "")}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-foreground/80 text-foreground font-semibold text-xs hover:bg-foreground hover:text-background transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-current">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                          </a>
                          {agentData.email ? (
                            <a
                              href={`mailto:${agentData.email}`}
                              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-foreground/70 font-semibold text-xs hover:border-primary hover:text-primary transition-colors"
                            >
                              <Mail size={14} />
                              Email
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setRdvOpen(true);
                                setRdvSuccess(false);
                                setRdvError("");
                              }}
                              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/40 bg-primary/5 text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors"
                            >
                              <Calendar size={14} />
                              RDV
                            </button>
                          )}
                        </div>
                        {agentData.email && (
                          <button
                            onClick={() => {
                              setRdvOpen(true);
                              setRdvSuccess(false);
                              setRdvError("");
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/40 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
                          >
                            <Calendar size={15} />
                            Prendre rendez-vous
                          </button>
                        )}
                      </div>

                      {/* Lien profil */}
                      <Link
                        href={`/agents/${agentData.slug ?? agentData.id}`}
                        className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink size={12} />
                        Voir le profil complet
                      </Link>

                      <hr className="border-border" />
                    </div>
                  ) : property.agent ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center gap-3 pt-1">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-primary/10"
                          style={{ background: "#8B1A2E" }}
                        >
                          {property.agent.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display font-bold text-foreground text-base">
                            {property.agent}
                          </p>
                          <p className="text-sm text-primary font-semibold mt-0.5">Agent WeHome</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <a
                          href="tel:+212653535156"
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          <Phone size={16} />
                          +212 6 53 53 51 56
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-foreground/80 text-foreground font-semibold text-xs hover:bg-foreground hover:text-background transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                          </a>
                          <button
                            onClick={() => {
                              setRdvOpen(true);
                              setRdvSuccess(false);
                              setRdvError("");
                            }}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/40 bg-primary/5 text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors"
                          >
                            <Calendar size={14} />
                            RDV
                          </button>
                        </div>
                      </div>
                      <hr className="border-border" />
                    </div>
                  ) : null}

                  {formSuccess ? (
                    <div className="text-center py-4">
                      <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                      <p className="font-display font-bold text-foreground text-lg mb-1">
                        Message envoyé !
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Notre équipe vous contactera très prochainement.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-display font-bold text-foreground mb-1">
                        Contactez WeHome
                      </h3>
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

                        {formError && <p className="text-xs text-destructive">{formError}</p>}

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full py-3.5 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors duration-300 disabled:opacity-60"
                        >
                          {formLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
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
      {/* RDV Modal */}
      <Dialog
        open={rdvOpen}
        onOpenChange={(open) => {
          setRdvOpen(open);
          if (!open) {
            setRdvSuccess(false);
            setRdvError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Prendre rendez-vous</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {property?.title} — {property?.location}
            </DialogDescription>
          </DialogHeader>

          {rdvSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <p className="font-display font-bold text-foreground text-lg mb-2">RDV confirmé !</p>
              <p className="text-sm text-muted-foreground">
                Notre équipe vous contactera pour confirmer le rendez-vous.
              </p>
              <button
                onClick={() => setRdvOpen(false)}
                className="mt-5 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleRdvSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <input
                      type="date"
                      required
                      value={rdvDate}
                      onChange={(e) => setRdvDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">
                    Heure *
                  </label>
                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <select
                      required
                      value={rdvTime}
                      onChange={(e) => setRdvTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                    >
                      {[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                        "17:30",
                        "18:00",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">
                  Votre nom *
                </label>
                <input
                  type="text"
                  required
                  value={rdvName}
                  onChange={(e) => setRdvName(e.target.value)}
                  placeholder="Prénom et nom"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={rdvPhone}
                  onChange={(e) => setRdvPhone(e.target.value)}
                  placeholder="06 XX XX XX XX"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={rdvEmail}
                  onChange={(e) => setRdvEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              {rdvError && <p className="text-xs text-destructive">{rdvError}</p>}

              <button
                type="submit"
                disabled={rdvLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {rdvLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Calendar size={18} />
                )}
                {rdvLoading ? "Réservation en cours..." : "Confirmer le rendez-vous"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
