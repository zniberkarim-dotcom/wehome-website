import { useState } from "react";
import { Search, MapPin, Home as HomeIcon, DollarSign, ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { PROPERTY_TYPES, buildSearchUrl } from "@/lib/data";

const PRICE_RANGES: { label: string; value: string; prix_min?: number; prix_max?: number }[] = [
  { label: "Tout prix", value: "" },
  { label: "Moins de 500 000 MAD", value: "0-500k", prix_max: 500000 },
  { label: "500 000 - 1M MAD", value: "500k-1m", prix_min: 500000, prix_max: 1000000 },
  { label: "1M - 3M MAD", value: "1m-3m", prix_min: 1000000, prix_max: 3000000 },
  { label: "3M - 5M MAD", value: "3m-5m", prix_min: 3000000, prix_max: 5000000 },
  { label: "Plus de 5M MAD", value: "5m+", prix_min: 5000000 },
];

const FEATURES_LIST = [
  { key: "Parking", label: "Parking" },
  { key: "Piscine", label: "Piscine" },
  { key: "Ascenseur", label: "Ascenseur" },
  { key: "Gardien", label: "Gardien" },
  { key: "Terrasse", label: "Terrasse" },
  { key: "Climatisation", label: "Climatisation" },
];

const whatsappVendre = `https://wa.me/212653535156?text=${encodeURIComponent("Bonjour WeHome,\n\nJe souhaite vendre mon bien immobilier.\n\nPouvez-vous me contacter pour en discuter ?\n\nMerci !")}`;

export function Hero() {
  const [activeTab, setActiveTab] = useState<"acheter" | "louer" | "vendre">("acheter");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [surfaceMin, setSurfaceMin] = useState("");
  const [chambresMin, setChambresMin] = useState<number | undefined>(undefined);
  const [isFurnished, setIsFurnished] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [, navigate] = useLocation();

  const toggleFeature = (key: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleSearch = () => {
    if (activeTab === "vendre") {
      window.open(whatsappVendre, "_blank");
      return;
    }
    const range = PRICE_RANGES.find((r) => r.value === priceRange);
    const url = buildSearchUrl({
      transaction: activeTab === "acheter" ? "Vente" : "Location",
      city: city.trim() || undefined,
      type: type || undefined,
      prix_min: range?.prix_min,
      prix_max: range?.prix_max,
      surface_min: surfaceMin ? Number(surfaceMin) : undefined,
      chambres_min: chambresMin,
      is_furnished: isFurnished || undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
    });
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Villa de luxe avec piscine"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: "5px 14px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.35)",
              marginBottom: "24px",
              cursor: "default",
            }}
          >
            <span style={{ color: "rgba(192,57,43,0.4)", fontSize: "6px", verticalAlign: "middle", marginRight: "8px" }}>◆</span>
            La plateforme immobilière du Maroc
          </motion.span>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6"
            style={{ color: "#FFFFFF", textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            L'immobilier marocain,<br/>enfin transparent.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}>
            WeHome centralise les meilleures opportunités immobilières du Maroc — avec la donnée de marché, l'expertise locale, et l'accompagnement que vous méritez vraiment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4 md:p-8"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/50 pb-4">
            {(["acheter", "louer", "vendre"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Main search row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ville, quartier ou adresse"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground font-medium"
              />
            </div>

            <div className="md:col-span-3 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <HomeIcon size={20} />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full pl-12 pr-8 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground font-medium appearance-none"
              >
                <option value="">Type de bien</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <DollarSign size={20} />
              </div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full pl-12 pr-8 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground font-medium appearance-none"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSearch}
                className="w-full h-full min-h-[56px] bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <Search size={20} />
                <span>Rechercher</span>
              </button>
            </div>
          </div>

          {/* Advanced filters toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtres avancés
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>
            {(city || type || priceRange || surfaceMin || chambresMin || isFurnished || selectedFeatures.length > 0) && (
              <button
                onClick={() => {
                  setCity(""); setType(""); setPriceRange("");
                  setSurfaceMin(""); setChambresMin(undefined);
                  setIsFurnished(false); setSelectedFeatures([]);
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Advanced filters panel */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-5 border-t border-border/40 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Surface min */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Surface minimum (m²)</label>
                    <input
                      type="number"
                      value={surfaceMin}
                      onChange={(e) => setSurfaceMin(e.target.value)}
                      placeholder="Ex: 100"
                      min={0}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Chambres min */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Chambres minimum</label>
                    <div className="flex gap-2">
                      {[undefined, 1, 2, 3, 4].map((n) => (
                        <button
                          key={n ?? "any"}
                          onClick={() => setChambresMin(n)}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                            chambresMin === n
                              ? "bg-primary text-white border-primary shadow-md"
                              : "bg-white/50 border-border/50 text-foreground/70 hover:bg-white hover:border-primary/40"
                          }`}
                        >
                          {n === undefined ? "Tous" : `${n}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meublé */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Meublé</label>
                    <button
                      onClick={() => setIsFurnished(!isFurnished)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        isFurnished
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white/50 border-border/50 text-foreground/70 hover:bg-white hover:border-primary/40"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isFurnished ? "border-white bg-white" : "border-foreground/40"}`}>
                        {isFurnished && <span className="w-2.5 h-2.5 rounded-full bg-primary block" />}
                      </span>
                      Meublé uniquement
                    </button>
                  </div>

                  {/* Features / Équipements */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-foreground/70 mb-3 uppercase tracking-wider">Équipements</label>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES_LIST.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => toggleFeature(f.key)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                            selectedFeatures.includes(f.key)
                              ? "bg-primary text-white border-primary shadow-md"
                              : "bg-white/50 border-border/50 text-foreground/70 hover:bg-white hover:border-primary/40"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
