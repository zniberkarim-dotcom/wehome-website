import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import zh from "../locales/zh.json";

export const SUPPORTED_LANGS = ["fr", "en", "zh"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
const STORAGE_KEY = "wehome-lang";

/** Resolve initial language: ?lang= → localStorage → navigator → "fr". */
function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";

  // 1. URL query param has highest priority
  const qp = new URLSearchParams(window.location.search).get("lang");
  if (qp && (SUPPORTED_LANGS as readonly string[]).includes(qp)) return qp as Lang;

  // 2. Saved preference
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) return saved as Lang;

  // 3. Browser language (zh-CN, zh-TW, etc. → zh)
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("en")) return "en";
  return "fr";
}

const initialLang = detectInitialLang();

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: initialLang,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

/** Apply <html lang> and persist preference on every language change. */
function applyLangSideEffects(lang: string) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", lang);
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
}
applyLangSideEffects(initialLang);
i18n.on("languageChanged", applyLangSideEffects);

/** Programmatically switch language (also updates URL ?lang=…). */
export function setLanguage(lang: Lang) {
  void i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  }
}

export default i18n;
