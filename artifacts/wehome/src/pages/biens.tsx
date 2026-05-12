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

const ROOM_COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;
const SDB_COUNT_OPTIONS = [1, 2, 3, 4] as const;
const ETAT_OPTIONS = ["Neuf", "Bon état", "À rénover"] as const;
const FEATURE_OPTIONS = [
  "Cuisine équipée",
  "Climatisation",
  "Chauffage",
  "Ascenseur",
  "Concierge",
  "Gardien",
  "Sécurité 24/7",
  "Balcon",
  "Terrasse",
  "Jardin",
  "Piscine",
  "Parking",
  "Garage",
  "Vue mer",
  "Vue dégagée",
] as const;

// ── Filter panel (desktop sidebar + mobile sheet) ─────────────────────────────

/** Toggle a value inside an array filter; returns undefined when the array becomes empty
 *  so the URL stays clean. */
function toggleInArray<T>(arr: T[] | undefined, value: T): T[] | undefined {
  const current = arr ?? [];
  const next = current.includes(value)
    ? current.filter((x) => x !== value)
    : [...current, value];
  return next.length ? next : undefined;
}

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

  const hasActiveFilters = [
    params.transaction,
    params.types?.length,
    params.city,
    params.prix_min ?? params.prix_max,
    params.surface_min ?? params.surface_max,
    params.chambres?.length,
    params.sdb?.length,
    params.etat?.length,
    params.is_furnished,
    params.features?.length,
  ].some(Boolean);

  return (
    <div className="space-y-6">
      {/* Transaction */}
      <FilterGroup label="Transaction">
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
      </FilterGroup>

      {/* Ville / Quartier */}
      <FilterGroup label="Ville / Quartier">
        <input
          type="text"
          placeholder="Casablanca, Maarif…"
          value={params.city ?? ""}
          onChange={(e) => set({ city: e.target.value || undefined })}
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        />
      </FilterGroup>

      {/* Type de bien — multi-select */}
      <FilterGroup
        label="Type de bien"
        hint={params.types?.length ? `${params.types.length} sélectionné${params.types.length > 1 ? "s" : ""}` : "Plusieurs choix possibles"}
      >
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((t) => {
            const active = params.types?.includes(t) ?? false;
            return (
              <button
                key={t}
                onClick={() => set({ types: toggleInArray(params.types, t) })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Budget — typed min/max */}
      <FilterGroup label="Budget (MAD)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={params.prix_min ?? ""}
            onChange={(e) => set({ prix_min: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm tabular-nums transition-all"
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={params.prix_max ?? ""}
            onChange={(e) => set({ prix_max: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm tabular-nums transition-all"
          />
        </div>
      </FilterGroup>

      {/* Surface min / max — typed */}
      <FilterGroup label="Surface (m²)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={params.surface_min ?? ""}
            onChange={(e) => set({ surface_min: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm tabular-nums transition-all"
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={params.surface_max ?? ""}
            onChange={(e) => set({ surface_max: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm tabular-nums transition-all"
          />
        </div>
      </FilterGroup>

      {/* Chambres — multi-select */}
      <FilterGroup label="Chambres" hint="Plusieurs choix possibles">
        <div className="grid grid-cols-5 gap-1.5">
          {ROOM_COUNT_OPTIONS.map((n) => {
            const active = params.chambres?.includes(n) ?? false;
            return (
              <button
                key={n}
                onClick={() => set({ chambres: toggleInArray(params.chambres, n) })}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-foreground/80 border-border hover:bg-muted/80"
                }`}
              >
                {n === 5 ? "5+" : n}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Salles de bains — multi-select */}
      <FilterGroup label="Salles de bains" hint="Plusieurs choix possibles">
        <div className="grid grid-cols-4 gap-1.5">
          {SDB_COUNT_OPTIONS.map((n) => {
            const active = params.sdb?.includes(n) ?? false;
            return (
              <button
                key={n}
                onClick={() => set({ sdb: toggleInArray(params.sdb, n) })}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-foreground/80 border-border hover:bg-muted/80"
                }`}
              >
                {n === 4 ? "4+" : n}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* État du bien — multi-select */}
      <FilterGroup label="État du bien">
        <div className="flex flex-wrap gap-1.5">
          {ETAT_OPTIONS.map((s) => {
            const active = params.etat?.includes(s) ?? false;
            return (
              <button
                key={s}
                onClick={() => set({ etat: toggleInArray(params.etat, s) })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Équipements — multi-select */}
      <FilterGroup
        label="Équipements"
        hint={params.features?.length ? `${params.features.length} sélectionné${params.features.length > 1 ? "s" : ""}` : "Plusieurs choix possibles"}
      >
        <div className="flex flex-wrap gap-1.5">
          {FEATURE_OPTIONS.map((f) => {
            const active = params.features?.includes(f) ?? false;
            return (
              <button
                key={f}
                onClick={() => set({ features: toggleInArray(params.features, f) })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </FilterGroup>

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

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
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
    params.transaction,
    params.types?.length,
    params.city,
    params.prix_min ?? params.prix_max,
    params.surface_min ?? params.surface_max,
    params.chambres?.length,
    params.sdb?.length,
    params.etat?.length,
    params.is_furnished,
    params.features?.length,
    params.agent_id,
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
