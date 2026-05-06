import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Search, User, LayoutList, Map } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { PropertyMap } from "@/components/biens/PropertyMap";
import {
  fetchProperties,
  fetchAgentById,
  parseFilterParams,
  buildSearchUrl,
  PROPERTY_TYPES,
  PAGE_SIZE_EXPORT as PAGE_SIZE,
  type FilterParams,
} from "@/lib/data";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SORT_OPTIONS = [
  { value: "recent",    label: "Plus récent" },
  { value: "prix_asc",  label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "surface",   label: "Surface" },
];

const PRICE_PRESETS = [
  { label: "Tout budget",     min: undefined,   max: undefined   },
  { label: "< 500 000 MAD",   min: undefined,   max: 500_000     },
  { label: "500 000 – 1M",    min: 500_000,     max: 1_000_000   },
  { label: "1M – 3M",         min: 1_000_000,   max: 3_000_000   },
  { label: "3M – 5M",         min: 3_000_000,   max: 5_000_000   },
  { label: "> 5M MAD",        min: 5_000_000,   max: undefined   },
];

const BEDROOM_OPTIONS = [
  { label: "Tout", value: undefined },
  { label: "1+",  value: 1 },
  { label: "2+",  value: 2 },
  { label: "3+",  value: 3 },
  { label: "4+",  value: 4 },
];

// ── Filter panel (desktop sidebar + mobile sheet) ─────────────────────────────

function FilterPanel({
  params,
  onUpdate,
}: {
  params: FilterParams;
  onUpdate: (next: FilterParams) => void;
}) {
  function set(partial: Partial<FilterParams>) {
    onUpdate({ ...params, ...partial, page: undefined });
  }

  const pricePresetIndex = PRICE_PRESETS.findIndex(
    (p) => p.min === params.prix_min && p.max === params.prix_max
  );

  const hasActiveFilters = [
    params.transaction, params.type, params.city,
    params.prix_min ?? params.prix_max, params.surface_min,
    params.chambres_min, params.is_furnished,
  ].some(Boolean);

  return (
    <div className="space-y-6">
      {/* Transaction */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Transaction
        </p>
        <div className="flex gap-2">
          {([
            { label: "Tout",    value: undefined          },
            { label: "Acheter", value: "Vente" as const   },
            { label: "Louer",   value: "Location" as const},
          ] as const).map((opt) => (
            <button
              key={opt.label}
              onClick={() => set({ transaction: opt.value })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                params.transaction === opt.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ville / Quartier */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Ville / Quartier
        </p>
        <input
          type="text"
          placeholder="Casablanca, Maarif…"
          value={params.city ?? ""}
          onChange={(e) => set({ city: e.target.value || undefined })}
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        />
      </div>

      {/* Type */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Type de bien
        </p>
        <Select
          value={params.type ?? "all"}
          onValueChange={(v) => set({ type: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="rounded-xl bg-muted/50 border-border/50">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Budget
        </p>
        <div className="space-y-1">
          {PRICE_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => set({ prix_min: preset.min, prix_max: preset.max })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                pricePresetIndex === i
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground/70"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surface min */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Surface minimum
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={params.surface_min ?? ""}
            onChange={(e) => set({ surface_min: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <span className="text-sm text-muted-foreground shrink-0">m²</span>
        </div>
      </div>

      {/* Chambres */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Chambres
        </p>
        <div className="flex gap-1.5">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => set({ chambres_min: opt.value })}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                params.chambres_min === opt.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meublé */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium cursor-pointer">Meublé uniquement</Label>
        <Switch
          checked={!!params.is_furnished}
          onCheckedChange={(checked) => set({ is_furnished: checked || undefined })}
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => onUpdate({ sort: params.sort })}
          className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-primary text-white"
                : "border border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BiensPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const params = parseFilterParams(search);
  const page = params.page ?? 1;

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["properties", search],
    queryFn: () => fetchProperties(params),
  });

  // Fetch agent name when filtering by agent_id
  const { data: filteredAgent } = useQuery({
    queryKey: ["agent-filter", params.agent_id],
    queryFn: () => fetchAgentById(params.agent_id!),
    enabled: !!params.agent_id,
  });

  const properties = result?.data ?? [];
  const total = result?.total ?? 0;

  function updateParams(next: FilterParams) {
    navigate(buildSearchUrl(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeFilterCount = [
    params.transaction, params.type, params.city,
    params.prix_min ?? params.prix_max, params.surface_min,
    params.chambres_min, params.is_furnished, params.agent_id,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* Sticky results header */}
        <div className="bg-white border-b border-border/50 sticky top-[64px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:border-primary transition-colors">
                    <SlidersHorizontal size={16} />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <p className="font-display font-bold text-lg mb-6">Filtres</p>
                  <FilterPanel
                    params={params}
                    onUpdate={(next) => { updateParams(next); setMobileOpen(false); }}
                  />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  {isLoading ? (
                    <span className="text-muted-foreground">Recherche…</span>
                  ) : (
                    <>
                      <span className="text-primary font-bold">{total}</span>{" "}
                      {total === 1 ? "bien trouvé" : "biens trouvés"}
                      {params.city && (
                        <span className="text-muted-foreground font-normal"> · {params.city}</span>
                      )}
                    </>
                  )}
                </p>
                {/* Agent filter badge */}
                {params.agent_id && filteredAgent && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    <User size={12} />
                    {filteredAgent.prenom} {filteredAgent.nom}
                    <button onClick={() => updateParams({ ...params, agent_id: undefined, page: undefined })}
                      className="ml-0.5 hover:text-destructive transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden h-9">
                <button
                  onClick={() => setViewMode("list")}
                  title="Vue liste"
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutList size={16} />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  title="Vue carte"
                  className={`w-9 h-9 flex items-center justify-center transition-colors border-l border-border ${
                    viewMode === "map"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Map size={16} />
                </button>
              </div>

              {/* Sort — hidden in map view on small screens */}
              {viewMode === "list" && (
                <Select value={params.sort ?? "recent"} onValueChange={(v) => updateParams({ ...params, sort: v as FilterParams["sort"], page: undefined })}>
                  <SelectTrigger className="w-[160px] h-9 text-sm rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-36 bg-card border border-border rounded-2xl p-5 shadow-sm">
                <p className="font-display font-bold text-base mb-5">Filtres</p>
                <FilterPanel params={params} onUpdate={updateParams} />
              </div>
            </aside>

            {/* Results: list or map */}
            <div className="flex-1 min-w-0">
              {viewMode === "map" ? (
                /* ── Map view ── */
                <motion.div
                  key="map-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="h-[calc(100vh-200px)] min-h-[500px] bg-muted/30 rounded-2xl border border-border animate-pulse" />
                  ) : (
                    <PropertyMap
                      properties={properties}
                      className="h-[calc(100vh-200px)] min-h-[500px]"
                    />
                  )}
                  {!isLoading && properties.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Search size={28} className="text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground mb-2">Aucun résultat</h2>
                      <p className="text-muted-foreground">Essayez d'élargir vos critères de recherche.</p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* ── List view ── */
                <>
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-3xl overflow-hidden border border-border animate-pulse">
                          <div className="aspect-[4/5] bg-muted" />
                          <div className="p-6 space-y-3">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isError ? (
                    <div className="text-center py-24">
                      <p className="text-muted-foreground">Erreur lors du chargement. Veuillez réessayer.</p>
                    </div>
                  ) : properties.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Search size={28} className="text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground mb-2">
                        {activeFilterCount > 0 ? "Aucun résultat" : "Aucun bien disponible"}
                      </h2>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        {activeFilterCount > 0
                          ? "Essayez d'élargir vos critères de recherche."
                          : "Revenez bientôt ou contactez-nous directement."}
                      </p>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => updateParams({ sort: params.sort })}
                          className="mt-6 px-6 py-2.5 rounded-full border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {properties.map((property, i) => (
                          <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                          >
                            <PropertyCard property={property} />
                          </motion.div>
                        ))}
                      </div>

                      <Pagination
                        page={page}
                        total={total}
                        pageSize={PAGE_SIZE}
                        onPage={(p) => updateParams({ ...params, page: p })}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
