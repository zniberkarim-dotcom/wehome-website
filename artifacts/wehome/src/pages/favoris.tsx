import { Link } from "wouter";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Search, Trash2, Share2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProperty, type Property } from "@/lib/data";

export default function FavorisPage() {
  const { t } = useTranslation();
  const { favoriteIds, count, clearAll, removeFavorite } = useFavorites();

  // Fetch each saved property in parallel
  const queries = useQueries({
    queries: favoriteIds.map((id) => ({
      queryKey: ["property", id],
      queryFn: () => fetchProperty(id),
      staleTime: 60_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const properties = queries.map((q) => q.data).filter((p): p is Property => Boolean(p));
  // IDs that resolved to null (deleted/unpublished) — auto-prune
  const missingIds = favoriteIds.filter((id, i) => !queries[i].isLoading && !queries[i].data);
  if (missingIds.length > 0) {
    // Schedule cleanup outside render
    queueMicrotask(() => missingIds.forEach((id) => removeFavorite(id)));
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/favoris`;
    const text = t("favoris.share_text", { count });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: t("favoris.share_title"), text, url });
        return;
      } catch {
        /* user cancelled — fall through */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert(t("favoris.share_copied"));
    }
  };

  const handleClearAll = () => {
    if (count === 0) return;
    if (confirm(t("favoris.clear_confirm", { count }))) {
      clearAll();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-10 md:pt-36 md:pb-14 bg-secondary/40 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wide mb-3">
                <Heart size={14} className="fill-primary" />
                {t("favoris.badge")}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                {t("favoris.page_title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {count === 0 ? t("favoris.empty_inline") : t("favoris.count", { count })}
              </p>
            </div>

            {count > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm bg-card border border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <Share2 size={16} />
                  {t("favoris.share")}
                </button>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <Trash2 size={16} />
                  {t("favoris.clear_all")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="flex-1 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {count === 0 ? (
            <EmptyState />
          ) : isLoading && properties.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 size={28} className="animate-spin mr-3" />
              {t("favoris.loading")}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto text-center py-12 md:py-20">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <Heart size={36} />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground">
        {t("favoris.empty_title")}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">{t("favoris.empty_body")}</p>
      <Link
        href="/biens"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        <Search size={18} />
        {t("favoris.empty_cta")}
      </Link>
    </div>
  );
}
