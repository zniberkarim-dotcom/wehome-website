import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, subtitle, lastUpdated, sections }: Props) {
  const { t, i18n } = useTranslation();
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const lang = i18n.language;
  // EN/ZH visitors see a "French version prevails" disclaimer at top of legal pages.
  const prevailingNotice =
    lang === "en"
      ? t("legal.prevailing_notice_en")
      : lang === "zh"
      ? t("legal.prevailing_notice_zh")
      : "";

  // Highlight the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-10 md:pt-40 md:pb-14 bg-secondary/40 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
              {t("legal.overline")}
            </p>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground/80 mt-5">
              {t("legal.last_updated")} <span className="font-semibold">{lastUpdated}</span>
            </p>
            {prevailingNotice && (
              <div className="mt-6 inline-flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 max-w-3xl">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm leading-relaxed">{prevailingNotice}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="flex-1 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
            {/* ToC */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                {t("legal.toc")}
              </p>
              <nav>
                <ol className="space-y-1">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`flex items-start gap-2 py-1.5 text-sm transition-colors ${
                          activeId === s.id
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="tabular-nums text-xs text-muted-foreground/60 shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span>{s.title}</span>
                        {activeId === s.id && (
                          <ChevronRight size={14} className="ml-auto mt-0.5 shrink-0" />
                        )}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* Sections */}
            <div className="space-y-10 max-w-3xl">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28"
                >
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    <span className="text-primary tabular-nums text-base mr-2">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    {s.title}
                  </h2>
                  <div className="prose-legal text-foreground/85 leading-relaxed space-y-4">
                    {s.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** Convenience: a paragraph with sensible defaults inside prose-legal. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm md:text-base">{children}</p>;
}

/** Convenience: list with bullets. */
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm md:text-base">{children}</ul>;
}

/** Subhead H3 inside a section. */
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base md:text-lg font-display font-bold text-foreground mt-6 mb-2">{children}</h3>;
}

/** Placeholder span — visually highlights fields the legal team must fill in. */
export function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-xs font-semibold border border-amber-200">
      [À compléter : {children}]
    </span>
  );
}
