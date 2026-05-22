import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setLanguage, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANG_META: Record<Lang, { label: string; native: string; flag: string }> = {
  fr: { label: "FR", native: "Français", flag: "🇫🇷" },
  en: { label: "EN", native: "English", flag: "🇬🇧" },
  zh: { label: "中文", native: "中文", flag: "🇨🇳" },
};

interface Props {
  /** True when the navbar is over a dark hero (white text) */
  onDark?: boolean;
}

export function LanguageSwitcher({ onDark = false }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language)
    ? (i18n.language as Lang)
    : "fr";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1.5 transition-colors duration-200",
          onDark
            ? "text-white/85 hover:text-white hover:bg-white/10"
            : "text-foreground/75 hover:text-primary hover:bg-primary/5"
        )}
        aria-label={`Language: ${LANG_META[current].native}`}
        style={onDark ? { textShadow: "0 1px 4px rgba(0,0,0,0.35)" } : undefined}
      >
        {/* Closed state: Globe + lang code only (flag emoji is omitted because
            Windows renders 🇫🇷 as the letters "FR", which would duplicate the label). */}
        <Globe size={14} />
        <span className="font-semibold">{LANG_META[current].label}</span>
        <ChevronDown
          size={13}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-border/60 shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              {SUPPORTED_LANGS.map((lang) => {
                const meta = LANG_META[lang];
                const active = lang === current;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="text-base leading-none">{meta.flag}</span>
                      <span>{meta.native}</span>
                    </span>
                    {active && <Check size={14} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
