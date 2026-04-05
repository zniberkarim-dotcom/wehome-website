import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { ALL_PROPERTIES, PROPERTY_TYPES } from "@/lib/data";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function BiensPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return ALL_PROPERTIES.filter((p) => {
      if (selectedType && p.type !== selectedType) return false;
      if (selectedTransaction && p.transaction !== selectedTransaction) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [search, selectedType, selectedTransaction]);

  const activeFilters = [selectedType, selectedTransaction, search].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Nos Biens
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Explorez notre portefeuille complet de biens immobiliers a Casablanca et au Maroc.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par ville, quartier, type..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground font-medium"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                  showFilters || activeFilters > 0
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 border-border/50 text-foreground hover:bg-muted"
                }`}
              >
                <SlidersHorizontal size={18} />
                <span>Filtres</span>
                {activeFilters > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-border/50"
              >
                <select
                  value={selectedTransaction}
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-medium appearance-none flex-1"
                >
                  <option value="">Toutes les transactions</option>
                  <option value="Vente">Vente</option>
                  <option value="Location">Location</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-medium appearance-none flex-1"
                >
                  <option value="">Tous les types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {(selectedType || selectedTransaction || search) && (
                  <button
                    onClick={() => {
                      setSelectedType("");
                      setSelectedTransaction("");
                      setSearch("");
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <X size={18} />
                    Effacer
                  </button>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground font-medium">
              {filtered.length} bien{filtered.length !== 1 ? "s" : ""} trouve{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-display font-bold text-foreground mb-2">
                Aucun bien trouve
              </p>
              <p className="text-muted-foreground">
                Essayez de modifier vos criteres de recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
