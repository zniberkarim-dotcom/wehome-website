import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Home as HomeIcon,
  DollarSign,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Bath,
  Maximize,
  Sofa,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { PROPERTY_TYPES, buildSearchUrl } from "@/lib/data";

const SALE_PRICE_RANGES: {
  i18nKey: string;
  fallback: string;
  value: string;
  prix_min?: number;
  prix_max?: number;
}[] = [
  { i18nKey: "price_ranges.any", fallback: "Tout prix", value: "" },
  {
    i18nKey: "price_ranges.under_500k",
    fallback: "Moins de 500 000 MAD",
    value: "0-500k",
    prix_max: 500000,
  },
  {
    i18nKey: "price_ranges.500k_1m",
    fallback: "500 000 - 1M MAD",
    value: "500k-1m",
    prix_min: 500000,
    prix_max: 1000000,
  },
  {
    i18nKey: "price_ranges.1m_3m",
    fallback: "1M - 3M MAD",
    value: "1m-3m",
    prix_min: 1000000,
    prix_max: 3000000,
  },
  {
    i18nKey: "price_ranges.3m_5m",
    fallback: "3M - 5M MAD",
    value: "3m-5m",
    prix_min: 3000000,
    prix_max: 5000000,
  },
  { i18nKey: "price_ranges.over_5m", fallback: "Plus de 5M MAD", value: "5m+", prix_min: 5000000 },
];

const RENT_PRICE_RANGES: {
  i18nKey: string;
  fallback: string;
  value: string;
  prix_min?: number;
  prix_max?: number;
}[] = [
  { i18nKey: "price_ranges.rent_any", fallback: "Tout loyer", value: "" },
  {
    i18nKey: "price_ranges.rent_under_5k",
    fallback: "Moins de 5 000 MAD",
    value: "0-5k",
    prix_max: 5000,
  },
  {
    i18nKey: "price_ranges.rent_5k_10k",
    fallback: "5 000 - 10 000 MAD",
    value: "5k-10k",
    prix_min: 5000,
    prix_max: 10000,
  },
  {
    i18nKey: "price_ranges.rent_10k_20k",
    fallback: "10 000 - 20 000 MAD",
    value: "10k-20k",
    prix_min: 10000,
    prix_max: 20000,
  },
  {
    i18nKey: "price_ranges.rent_20k_30k",
    fallback: "20 000 - 30 000 MAD",
    value: "20k-30k",
    prix_min: 20000,
    prix_max: 30000,
  },
  {
    i18nKey: "price_ranges.rent_over_30k",
    fallback: "Plus de 30 000 MAD",
    value: "30k+",
    prix_min: 30000,
  },
];

const POPULAR_CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"];

const FEATURES_LIST = [
  { key: "Parking", i18nKey: "features.parking" },
  { key: "Piscine", i18nKey: "features.pool" },
  { key: "Ascenseur", i18nKey: "features.elevator" },
  { key: "Gardien", i18nKey: "features.doorman" },
  { key: "Terrasse", i18nKey: "features.terrace" },
  { key: "Climatisation", i18nKey: "features.ac" },
  { key: "Jardin", i18nKey: "features.garden" },
  { key: "Balcon", i18nKey: "features.balcony" },
  { key: "Garage", i18nKey: "features.garage" },
  { key: "Vue mer", i18nKey: "features.sea_view" },
];

export function Hero() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  const [activeTab, setActiveTab] = useState<"acheter" | "louer" | "vendre">("acheter");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [surfaceMin, setSurfaceMin] = useState("");
  const [surfaceMax, setSurfaceMax] = useState("");
  const [chambresMin, setChambresMin] = useState<number | undefined>(undefined);
  const [sdbMin, setSdbMin] = useState<number | undefined>(undefined);
  const [salonsMin, setSalonsMin] = useState<number | undefined>(undefined);
  const [isFurnished, setIsFurnished] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customPrixMin, setCustomPrixMin] = useState("");
  const [customPrixMax, setCustomPrixMax] = useState("");

  const [, navigate] = useLocation();

  const isRent = activeTab === "louer";
  const priceRanges = isRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES;

  // Reset price preset when toggling between Acheter ↔ Louer to avoid mismatched ranges
  useEffect(() => {
    setPriceRange("");
    setCustomPrixMin("");
    setCustomPrixMax("");
  }, [activeTab]);

  const toggleFeature = (key: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const hasActiveFilters =
    !!city ||
    !!type ||
    !!priceRange ||
    !!surfaceMin ||
    !!surfaceMax ||
    chambresMin !== undefined ||
    sdbMin !== undefined ||
    salonsMin !== undefined ||
    isFurnished ||
    selectedFeatures.length > 0 ||
    !!customPrixMin ||
    !!customPrixMax;

  const resetAll = () => {
    setCity("");
    setType("");
    setPriceRange("");
    setSurfaceMin("");
    setSurfaceMax("");
    setChambresMin(undefined);
    setSdbMin(undefined);
    setSalonsMin(undefined);
    setIsFurnished(false);
    setSelectedFeatures([]);
    setCustomPrixMin("");
    setCustomPrixMax("");
  };

  const handleSearch = () => {
    if (activeTab === "vendre") {
      navigate("/publier");
      return;
    }
    const range = priceRanges.find((r) => r.value === priceRange);
    // Custom budget overrides the preset range
    const finalPrixMin = customPrixMin ? Number(customPrixMin) : range?.prix_min;
    const finalPrixMax = customPrixMax ? Number(customPrixMax) : range?.prix_max;

    const url = buildSearchUrl({
      transaction: activeTab === "acheter" ? "Vente" : "Location",
      city: city.trim() || undefined,
      types: type ? [type] : undefined,
      prix_min: finalPrixMin,
      prix_max: finalPrixMax,
      surface_min: surfaceMin ? Number(surfaceMin) : undefined,
      surface_max: surfaceMax ? Number(surfaceMax) : undefined,
      chambres: chambresMin ? [chambresMin] : undefined,
      sdb: sdbMin ? [sdbMin] : undefined,
      salons: salonsMin ? [salonsMin] : undefined,
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />
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
            <span
              style={{
                color: "rgba(192,57,43,0.4)",
                fontSize: "6px",
                verticalAlign: "middle",
                marginRight: "8px",
              }}
            >
              ◆
            </span>
            {t("hero.badge")}
          </motion.span>
          <h1
            className="text-[38px] md:text-[46px] lg:text-[56px] font-display font-bold leading-[1.1] mb-6"
            style={{ color: "#FFFFFF", textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            {t("hero.title_line1")}
            <br />
            {t("hero.title_line2")}
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto font-medium"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
          >
            {t("hero.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl bg-background/85 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-background/60 p-4 md:p-8"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/50 pb-4">
            {(
              [
                { id: "acheter", labelKey: "hero.tab_buy" },
                { id: "louer", labelKey: "hero.tab_rent" },
                { id: "vendre", labelKey: "hero.tab_sell" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {activeTab === "vendre" ? (
            <VendreCta t={t} />
          ) : (
            <>
              {/* Quick-select cities */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50 mr-1">
                  {fallback("hero.popular_cities", "Villes populaires")}
                </span>
                {POPULAR_CITIES.map((c) => {
                  const active = city.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      onClick={() => setCity(active ? "" : c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              {/* Main search row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 relative group transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <MapPin size={20} />
                  </div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("hero.city_placeholder")}
                    className="w-full pl-12 pr-4 py-4 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-foreground placeholder:text-muted-foreground font-medium"
                  />
                </div>

                <div className="md:col-span-3 relative group transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <HomeIcon size={20} />
                  </div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full pl-12 pr-8 py-4 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-foreground font-medium appearance-none"
                  >
                    <option value="">{t("hero.type_placeholder")}</option>
                    {PROPERTY_TYPES.map((tt) => (
                      <option key={tt} value={tt}>
                        {tt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 relative group transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <DollarSign size={20} />
                  </div>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    disabled={!!customPrixMin || !!customPrixMax}
                    className="w-full pl-12 pr-8 py-4 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-foreground font-medium appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {priceRanges.map((r) => (
                      <option key={r.value} value={r.value}>
                        {fallback(r.i18nKey, r.fallback)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleSearch}
                    className="w-full h-full min-h-[56px] bg-primary hover:bg-primary-hover text-primary-foreground rounded-[6px] font-bold flex items-center justify-center gap-2 shadow-md shadow-black/5 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  >
                    <Search size={20} />
                    <span>{t("hero.search")}</span>
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
                  {t("hero.advanced_filters")}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAll}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {t("hero.reset")}
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
                    <div className="pt-5 border-t border-border/40 mt-4 space-y-6">
                      {/* Custom budget row */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                          {fallback("hero.custom_budget", "Budget personnalisé (MAD)")}
                          {isRent && (
                            <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
                              {fallback("hero.per_month", "· par mois")}
                            </span>
                          )}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={customPrixMin}
                            onChange={(e) => setCustomPrixMin(e.target.value)}
                            placeholder={fallback(
                              "hero.budget_min_placeholder",
                              isRent ? "Min — ex: 5000" : "Min — ex: 800000"
                            )}
                            min={0}
                            className="w-full px-4 py-3 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-sm font-medium"
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            value={customPrixMax}
                            onChange={(e) => setCustomPrixMax(e.target.value)}
                            placeholder={fallback(
                              "hero.budget_max_placeholder",
                              isRent ? "Max — ex: 15000" : "Max — ex: 2500000"
                            )}
                            min={0}
                            className="w-full px-4 py-3 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-sm font-medium"
                          />
                        </div>
                        {(!!customPrixMin || !!customPrixMax) && (
                          <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                            <Sparkles size={10} />
                            {fallback(
                              "hero.custom_budget_active",
                              "Budget personnalisé activé · la fourchette est ignorée"
                            )}
                          </p>
                        )}
                      </div>

                      {/* Surface row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <Maximize size={11} />
                            {t("hero.surface_min")}
                          </label>
                          <input
                            type="number"
                            value={surfaceMin}
                            onChange={(e) => setSurfaceMin(e.target.value)}
                            placeholder={t("hero.surface_min_placeholder")}
                            min={0}
                            className="w-full px-4 py-3 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <Maximize size={11} />
                            {fallback("hero.surface_max", "Surface max (m²)")}
                          </label>
                          <input
                            type="number"
                            value={surfaceMax}
                            onChange={(e) => setSurfaceMax(e.target.value)}
                            placeholder={fallback("hero.surface_max_placeholder", "ex: 200")}
                            min={0}
                            className="w-full px-4 py-3 rounded-[6px] bg-background/60 border border-border/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Chambres + SDB */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                            {t("hero.bedrooms_min")}
                          </label>
                          <div className="flex gap-2">
                            {[undefined, 1, 2, 3, 4].map((n) => (
                              <button
                                key={n ?? "any"}
                                onClick={() => setChambresMin(n)}
                                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                                  chambresMin === n
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                                }`}
                              >
                                {n === undefined ? t("hero.bedrooms_any") : `${n}+`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <Bath size={11} />
                            {fallback("hero.bathrooms_min", "Salles de bain min")}
                          </label>
                          <div className="flex gap-2">
                            {[undefined, 1, 2, 3].map((n) => (
                              <button
                                key={`sdb-${n ?? "any"}`}
                                onClick={() => setSdbMin(n)}
                                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                                  sdbMin === n
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                                }`}
                              >
                                {n === undefined ? fallback("hero.bathrooms_any", "Tout") : `${n}+`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Salons min */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                          <Sofa size={11} />
                          {fallback("hero.salons_min", "Salons min")}
                        </label>
                        <div className="flex gap-2 max-w-md">
                          {[undefined, 1, 2, 3].map((n) => (
                            <button
                              key={`salon-${n ?? "any"}`}
                              onClick={() => setSalonsMin(n)}
                              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                                salonsMin === n
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                              }`}
                            >
                              {n === undefined ? fallback("hero.salons_any", "Tout") : `${n}+`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Meublé */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                          {t("hero.furnished")}
                        </label>
                        <button
                          onClick={() => setIsFurnished(!isFurnished)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            isFurnished
                              ? "bg-primary text-white border-primary shadow-md"
                              : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isFurnished ? "border-white bg-white" : "border-foreground/40"}`}
                          >
                            {isFurnished && (
                              <span className="w-2.5 h-2.5 rounded-full bg-primary block" />
                            )}
                          </span>
                          {t("hero.furnished_only")}
                        </button>
                      </div>

                      {/* Features / Équipements */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-3 uppercase tracking-wider">
                          {t("hero.features")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FEATURES_LIST.map((f) => (
                            <button
                              key={f.key}
                              onClick={() => toggleFeature(f.key)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                                selectedFeatures.includes(f.key)
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-background/60 border-border/50 text-foreground/70 hover:bg-background hover:border-primary/40"
                              }`}
                            >
                              {fallback(f.i18nKey, f.key)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * "Vendre" tab — replaces the search UI with a clear publish-flow CTA.
 * Drives visitors from search-intent confusion to the actual /publier form.
 * ────────────────────────────────────────────────────────────────────────── */

function VendreCta({ t }: { t: (key: string) => string }) {
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };
  return (
    <div className="text-center py-6 md:py-10">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide mb-5">
        <Sparkles size={14} />
        {fallback("hero.vendre_badge", "Gratuit · 100 % en ligne")}
      </div>
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
        {fallback("hero.vendre_title", "Publiez votre bien en 3 minutes")}
      </h2>
      <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
        {fallback(
          "hero.vendre_sub",
          "Décrivez votre bien, ajoutez vos photos, c'est tout. Notre équipe valide votre annonce sous 24 h et la diffuse à notre réseau d'acheteurs qualifiés."
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        <Pill
          icon={<ShieldCheck size={14} />}
          label={fallback("hero.vendre_pill_expert", "Validation expert")}
        />
        <Pill
          icon={<Clock size={14} />}
          label={fallback("hero.vendre_pill_24h", "Mise en ligne sous 24 h")}
        />
        <Pill
          icon={<CheckCircle2 size={14} />}
          label={fallback("hero.vendre_pill_free", "100 % gratuit")}
        />
      </div>

      <Link
        href="/publier"
        className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 rounded-[6px] font-bold bg-primary hover:bg-primary-hover text-white shadow-md shadow-black/5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        {fallback("hero.vendre_cta", "Publier mon annonce")}
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-muted/60 text-foreground/75 rounded-full px-3 py-1 text-[11px] font-semibold">
      {icon}
      {label}
    </span>
  );
}
