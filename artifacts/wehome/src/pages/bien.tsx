import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ALL_PROPERTIES, getPropertyImageUrl } from "@/lib/data";
import { formatMAD } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  MapPin, Bed, Bath, Square, Sofa, ArrowLeft,
  Building2, Layers, CheckCircle2, Phone, Mail
} from "lucide-react";

export default function BienPage() {
  const params = useParams<{ id: string }>();
  const property = ALL_PROPERTIES.find((p) => p.id === params.id);
  const [imgError, setImgError] = useState(false);

  if (!property) {
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

  const hasPrice = property.price > 0;
  const showBeds = property.beds !== undefined && property.beds > 0;
  const showBaths = property.baths !== undefined && property.baths > 0;
  const showSalons = property.salons !== undefined && property.salons > 0;
  const hasImage = property.photoUrl && !imgError;

  const specs = [
    showBeds && { icon: Bed, label: `${property.beds} Chambre${(property.beds ?? 0) > 1 ? "s" : ""}`, key: "beds" },
    showSalons && { icon: Sofa, label: `${property.salons} Salon${(property.salons ?? 0) > 1 ? "s" : ""}`, key: "salons" },
    showBaths && { icon: Bath, label: `${property.baths} Salle${(property.baths ?? 0) > 1 ? "s" : ""} de bain`, key: "baths" },
    property.surface > 0 && { icon: Square, label: property.surfaceLabel || `${property.surface.toLocaleString("fr-FR")} m²`, key: "surface" },
    property.floor && { icon: Layers, label: property.floor, key: "floor" },
    { icon: Building2, label: property.type, key: "type" },
    property.furnished && { icon: CheckCircle2, label: "Meublé", key: "furnished" },
  ].filter(Boolean) as { icon: typeof Bed; label: string; key: string }[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/biens" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-6 transition-colors">
              <ArrowLeft size={18} />
              Retour aux biens
            </Link>

            <div className={`relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden mb-8 ${!hasImage ? property.gradientClass : ''}`}>
              {hasImage && (
                <img
                  src={getPropertyImageUrl(property.id)}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              )}

              <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-foreground text-sm font-bold rounded-lg shadow-sm">
                  {property.type}
                </span>
                <span className={`px-4 py-1.5 text-white text-sm font-bold rounded-lg shadow-sm ${
                  property.transaction === "Location" ? "bg-foreground" : "bg-primary"
                }`}>
                  {property.transaction}
                </span>
                {property.furnished && (
                  <span className="px-4 py-1.5 bg-primary/80 text-white text-sm font-bold rounded-lg shadow-sm">
                    Meublé
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 z-20">
                <p className="text-white/80 text-sm font-medium">{property.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                    {property.title}
                  </h1>
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

                <div>
                  <h2 className="text-xl font-display font-bold text-foreground mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </div>

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

                  <div>
                    <h3 className="font-display font-bold text-foreground mb-4">Contactez WeHome</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Intéressé par ce bien ? Notre équipe est à votre disposition pour organiser une visite.
                    </p>

                    <div className="space-y-3">
                      <a
                        href="https://www.instagram.com/wehomeagency"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors duration-300"
                      >
                        <Phone size={18} />
                        Nous contacter
                      </a>
                      <a
                        href="mailto:contact@wehome.ma"
                        className="w-full py-3.5 rounded-xl border-2 border-foreground text-foreground font-bold flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors duration-300"
                      >
                        <Mail size={18} />
                        Envoyer un email
                      </a>
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Référence: {property.id}
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
