import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  MapPin,
  Banknote,
  Square,
  Bed,
  Bath,
  Sofa,
  Camera,
  X,
  Loader2,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  AlertCircle,
  Wand2,
  Box,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  PROPERTY_TYPES,
  uploadParticulierPhoto,
  submitParticulierProperty,
  type ParticulierSubmission,
} from "@/lib/data";

/** DB values paired with i18n keys — toggle state continues to use the FR backend value. */
const FEATURES_LIST: { value: string; labelKey: string }[] = [
  { value: "Parking",        labelKey: "publier.feature_parking" },
  { value: "Piscine",        labelKey: "publier.feature_pool" },
  { value: "Ascenseur",      labelKey: "publier.feature_elevator" },
  { value: "Gardien",        labelKey: "publier.feature_doorman" },
  { value: "Terrasse",       labelKey: "publier.feature_terrace" },
  { value: "Jardin",         labelKey: "publier.feature_garden" },
  { value: "Climatisation",  labelKey: "publier.feature_ac" },
  { value: "Balcon",         labelKey: "publier.feature_balcony" },
  { value: "Garage",         labelKey: "publier.feature_garage" },
  { value: "Cave",           labelKey: "publier.feature_cellar" },
];

const whatsappVendre = `https://wa.me/212653535156?text=${encodeURIComponent(
  "Bonjour WeHome,\n\nJe préfère parler à un conseiller pour publier mon bien.\n\nMerci !"
)}`;

const MAX_PHOTOS = 12;

export default function PublierPage() {
  const { t } = useTranslation();
  // ── Form state ─────────────────────────────────────────────────────────────
  const [type, setType] = useState<string>("Appartement");
  const [transaction, setTransaction] = useState<"Vente" | "Location">("Vente");
  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [prix, setPrix] = useState("");
  const [surface, setSurface] = useState("");
  const [chambres, setChambres] = useState<number>(0);
  const [salons, setSalons] = useState<number>(0);
  const [sdb, setSdb] = useState<number>(0);
  const [meuble, setMeuble] = useState(false);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const [photos, setPhotos] = useState<{ url: string; uploading?: boolean }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vendeurPrenom, setVendeurPrenom] = useState("");
  const [vendeurNom, setVendeurNom] = useState("");
  const [vendeurEmail, setVendeurEmail] = useState("");
  const [vendeurTelephone, setVendeurTelephone] = useState("");
  const [vendeurMessage, setVendeurMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleFeature = (key: string) => {
    setFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const remaining = MAX_PHOTOS - photos.length;
    const list = Array.from(files).slice(0, remaining);

    for (const file of list) {
      // Insert placeholder
      setPhotos((prev) => [...prev, { url: "", uploading: true }]);
      try {
        const url = await uploadParticulierPhoto(file);
        setPhotos((prev) => {
          // Replace first uploading placeholder with the resolved URL
          const idx = prev.findIndex((p) => p.uploading && !p.url);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { url, uploading: false };
          return next;
        });
      } catch (err) {
        setPhotos((prev) => {
          const idx = prev.findIndex((p) => p.uploading && !p.url);
          if (idx === -1) return prev;
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        });
        setUploadError(
          err instanceof Error
            ? `${t("publier.err_upload_prefix")} ${err.message}`
            : t("publier.err_upload_generic")
        );
      }
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid = (): string | null => {
    if (!ville.trim()) return t("publier.err_city");
    if (!prix || Number(prix) <= 0) return t("publier.err_price");
    if (!surface || Number(surface) <= 0) return t("publier.err_surface");
    if (!description.trim() || description.trim().length < 30)
      return t("publier.err_description");
    if (!vendeurPrenom.trim() || !vendeurNom.trim())
      return t("publier.err_name");
    if (!/^\S+@\S+\.\S+$/.test(vendeurEmail))
      return t("publier.err_email");
    if (!/^[+\d][\d\s-]{6,}$/.test(vendeurTelephone))
      return t("publier.err_phone");
    if (photos.some((p) => p.uploading))
      return t("publier.err_uploading");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = isValid();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    const payload: ParticulierSubmission = {
      type,
      transaction,
      ville: ville.trim(),
      quartier: quartier.trim() || undefined,
      prix: Number(prix),
      surface: Number(surface),
      chambres: chambres > 0 ? chambres : undefined,
      salles_de_bains: sdb > 0 ? sdb : undefined,
      salons: salons > 0 ? salons : undefined,
      meuble: meuble || undefined,
      description: description.trim(),
      features: features.length ? features : undefined,
      photos: photos.filter((p) => !!p.url).map((p) => p.url),
      vendeur_nom: vendeurNom.trim(),
      vendeur_prenom: vendeurPrenom.trim(),
      vendeur_email: vendeurEmail.trim(),
      vendeur_telephone: vendeurTelephone.trim(),
      vendeur_message: vendeurMessage.trim() || undefined,
    };

    try {
      await submitParticulierProperty(payload);
      setSuccess(true);
      // Scroll up so the user sees the confirmation
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `${t("publier.err_submit_prefix")} ${err.message}`
          : t("publier.err_submit_generic")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-br from-primary via-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white_0%,transparent_50%),radial-gradient(circle_at_80%_70%,white_0%,transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-5">
            <Sparkles size={14} />
            {t("publier.hero_badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            {t("publier.hero_title")}
          </h1>
          <p className="text-lg md:text-xl mt-5 opacity-95 leading-relaxed max-w-2xl mx-auto">
            {t("publier.hero_subtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <Pill icon={<ShieldCheck size={14} />} label={t("publier.pill_validation")} />
            <Pill icon={<Clock size={14} />} label={t("publier.pill_24h")} />
            <Pill icon={<CheckCircle2 size={14} />} label={t("publier.pill_free")} />
          </div>
        </div>
      </section>

      {/* ─── Service Pro upsell banner ─────────────────────────────────── */}
      <section className="py-8 md:py-10 bg-gradient-to-br from-amber-50 via-orange-50/40 to-rose-50/30 border-b border-amber-100/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-200/50 overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-amber-200/40 to-rose-200/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-gradient-to-tr from-primary/10 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 p-6 md:p-8 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 shadow-sm">
                  <Sparkles size={12} />
                  {t("publier.upsell_badge", "Service Pro WeHome")}
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                  {t("publier.upsell_title_part1", "Tu veux que ton annonce")}{" "}
                  <span className="text-primary">{t("publier.upsell_title_part2", "performe vraiment")}</span>{" "}?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                  {t("publier.upsell_subtitle", "Photos retouchées par IA, home staging virtuel, immersion 3D et conseils pro — vends ou loue 2 à 3× plus vite.")}{" "}
                  <strong className="text-foreground">{t("publier.upsell_price", "À partir de 1 990 MAD.")}</strong>
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <FeatureChip icon={<Wand2 size={12} />} label={t("publier.upsell_feat_ai", "Photos IA")} />
                  <FeatureChip icon={<Sofa size={12} />} label={t("publier.upsell_feat_staging", "Home staging virtuel")} />
                  <FeatureChip icon={<Box size={12} />} label={t("publier.upsell_feat_3d", "Visite 3D")} />
                  <FeatureChip icon={<TrendingUp size={12} />} label={t("publier.upsell_feat_diffusion", "Diffusion premium")} />
                </div>
              </div>

              <Link
                href="/services-pro"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold bg-foreground text-background shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                {t("publier.upsell_cta", "Découvrir les packs")}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {success ? (
              <SuccessState key="success" onPublishAnother={() => location.reload()} />
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm space-y-10"
              >
                {/* ── Section 1: votre bien ──────────────────────────── */}
                <FormSection
                  number={1}
                  title={t("publier.section1_title")}
                  subtitle={t("publier.section1_subtitle")}
                >
                  {/* Transaction */}
                  <Field label={t("publier.you_want")}>
                    <div className="flex gap-2">
                      {([
                        { label: t("publier.sell"),     value: "Vente" as const },
                        { label: t("publier.rent_out"), value: "Location" as const },
                      ]).map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setTransaction(opt.value)}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                            transaction === opt.value
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label={t("publier.type")} icon={<HomeIcon size={16} />}>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-muted/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t("publier.city")} required icon={<MapPin size={16} />}>
                      <Input
                        value={ville}
                        onChange={(v) => setVille(v)}
                        placeholder={t("publier.city_placeholder")}
                      />
                    </Field>
                    <Field label={t("publier.neighborhood_optional")}>
                      <Input
                        value={quartier}
                        onChange={(v) => setQuartier(v)}
                        placeholder={t("publier.neighborhood_placeholder")}
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={transaction === "Location" ? t("publier.price_rent") : t("publier.price_sale")} required icon={<Banknote size={16} />}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={prix}
                        onChange={setPrix}
                        placeholder={transaction === "Location" ? t("publier.price_placeholder_rent") : t("publier.price_placeholder_sale")}
                      />
                    </Field>
                    <Field label={t("publier.surface")} required icon={<Square size={16} />}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={surface}
                        onChange={setSurface}
                        placeholder={t("publier.surface_placeholder")}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label={t("publier.bedrooms")} icon={<Bed size={16} />}>
                      <NumberStepper value={chambres} onChange={setChambres} />
                    </Field>
                    <Field label={t("publier.salons")} icon={<Sofa size={16} />}>
                      <NumberStepper value={salons} onChange={setSalons} />
                    </Field>
                    <Field label={t("publier.bathrooms")} icon={<Bath size={16} />}>
                      <NumberStepper value={sdb} onChange={setSdb} />
                    </Field>
                  </div>

                  {transaction === "Location" && (
                    <div className="flex items-center gap-3">
                      <input
                        id="meuble"
                        type="checkbox"
                        checked={meuble}
                        onChange={(e) => setMeuble(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <label htmlFor="meuble" className="text-sm font-medium">
                        {t("publier.furnished_property")}
                      </label>
                    </div>
                  )}

                  <Field label={t("publier.features_optional")}>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES_LIST.map((f) => {
                        const active = features.includes(f.value);
                        return (
                          <button
                            type="button"
                            key={f.value}
                            onClick={() => toggleFeature(f.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                              active
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {t(f.labelKey)}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label={t("publier.description")} required>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("publier.description_placeholder")}
                      rows={5}
                      className="w-full px-3 py-3 rounded-xl bg-muted/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("publier.description_counter", { count: description.trim().length })}
                    </p>
                  </Field>
                </FormSection>

                {/* ── Section 2: photos ─────────────────────────────── */}
                <FormSection
                  number={2}
                  title={t("publier.section2_title")}
                  subtitle={t("publier.section2_subtitle")}
                >
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photos.map((p, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group"
                        >
                          {p.uploading || !p.url ? (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              <Loader2 size={24} className="animate-spin" />
                            </div>
                          ) : (
                            <>
                              <img
                                src={p.url}
                                alt={`Photo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {i === 0 && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow">
                                  {t("publier.photo_principale")}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label={t("publier.photo_delete")}
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      {photos.length < MAX_PHOTOS && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary flex flex-col items-center justify-center gap-2 transition-colors"
                        >
                          <Upload size={20} />
                          <span className="text-xs font-semibold">{t("publier.photo_add")}</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
                      <Camera size={12} />
                      {t("publier.photo_hint", { current: photos.filter((p) => !!p.url).length, max: MAX_PHOTOS })}
                    </p>

                    {uploadError && (
                      <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        {uploadError}
                      </p>
                    )}
                  </div>
                </FormSection>

                {/* ── Section 3: vous ───────────────────────────────── */}
                <FormSection
                  number={3}
                  title={t("publier.section3_title")}
                  subtitle={t("publier.section3_subtitle")}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t("publier.first_name")} required>
                      <Input value={vendeurPrenom} onChange={setVendeurPrenom} placeholder={t("publier.first_name_placeholder")} />
                    </Field>
                    <Field label={t("publier.last_name")} required>
                      <Input value={vendeurNom} onChange={setVendeurNom} placeholder={t("publier.last_name_placeholder")} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t("publier.email")} required>
                      <Input
                        type="email"
                        value={vendeurEmail}
                        onChange={setVendeurEmail}
                        placeholder={t("publier.email_placeholder")}
                      />
                    </Field>
                    <Field label={t("publier.phone")} required icon={<Phone size={16} />}>
                      <Input
                        type="tel"
                        value={vendeurTelephone}
                        onChange={setVendeurTelephone}
                        placeholder={t("publier.phone_placeholder")}
                      />
                    </Field>
                  </div>

                  <Field label={t("publier.message_optional")}>
                    <textarea
                      value={vendeurMessage}
                      onChange={(e) => setVendeurMessage(e.target.value)}
                      placeholder={t("publier.message_placeholder")}
                      rows={3}
                      className="w-full px-3 py-3 rounded-xl bg-muted/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none"
                    />
                  </Field>
                </FormSection>

                {/* Submit */}
                {submitError && (
                  <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-4 flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {submitError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground max-w-md">
                    {t("publier.consent")}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("publier.submitting")}
                      </>
                    ) : (
                      <>
                        {t("publier.submit")}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                {/* WhatsApp fallback */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    {t("publier.whatsapp_prefix")}{" "}
                    <a
                      href={whatsappVendre}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      {t("publier.whatsapp_link")}
                    </a>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold">
      {icon}
      {label}
    </span>
  );
}

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-foreground/5 text-foreground/75 rounded-full px-2.5 py-1 text-[11px] font-semibold">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

function FormSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="space-y-5 pl-0 sm:pl-11">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground/85 mb-1.5">
        {icon && <span className="text-primary/70">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full px-3 py-3 rounded-xl bg-muted/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
    />
  );
}

function NumberStepper({
  value,
  onChange,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-stretch rounded-xl border border-border overflow-hidden bg-muted/40">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={0}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(0, n)));
        }}
        className="flex-1 bg-transparent text-center text-sm font-bold tabular-nums focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
      >
        +
      </button>
    </div>
  );
}

function SuccessState({ onPublishAnother }: { onPublishAnother: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-card border border-border rounded-3xl p-10 md:p-14 text-center shadow-sm"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
        {t("publier.success_title")}
      </h2>
      <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
        {t("publier.success_body_part1")} <strong>{t("publier.success_body_part2")}</strong> {t("publier.success_body_part3")}
      </p>
      <p className="text-sm text-muted-foreground mt-3">
        {t("publier.success_question")}{" "}
        <a
          href={whatsappVendre}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline"
        >
          {t("publier.success_whatsapp")}
        </a>
      </p>

      {/* ─── Service Pro upsell — post-publication ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative mt-10 rounded-3xl overflow-hidden border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50/40 text-left"
      >
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-amber-300/30 to-rose-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
              <Zap size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm text-amber-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-2">
                {t("publier.success_upsell_badge", "Prochaine étape")}
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                {t("publier.success_upsell_title", "Booste ton annonce avec Service Pro")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
                {t(
                  "publier.success_upsell_subtitle",
                  "Tu viens de publier — fais-toi vendre ou louer 2 à 3× plus vite avec nos packs Pro : photos retouchées par IA, home staging virtuel, visite 3D, et diffusion premium sur tous les portails."
                )}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <FeatureChip icon={<Wand2 size={12} />} label={t("publier.upsell_feat_ai", "Photos IA")} />
                <FeatureChip icon={<Sofa size={12} />} label={t("publier.upsell_feat_staging", "Home staging virtuel")} />
                <FeatureChip icon={<Box size={12} />} label={t("publier.upsell_feat_3d", "Visite 3D")} />
                <FeatureChip icon={<TrendingUp size={12} />} label={t("publier.upsell_feat_diffusion", "Diffusion premium")} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <Link
                  href="/services-pro"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold bg-foreground text-background shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {t("publier.success_upsell_cta", "Découvrir les packs Pro")}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-xs text-muted-foreground sm:self-center">
                  {t("publier.success_upsell_price_hint", "À partir de 1 990 MAD — sans engagement")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <Link
          href="/biens"
          className="px-6 py-3 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {t("publier.success_see_biens")}
          <ArrowRight size={18} />
        </Link>
        <button
          onClick={onPublishAnother}
          className="px-6 py-3 rounded-full font-bold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          {t("publier.success_publish_another")}
        </button>
      </div>
    </motion.div>
  );
}
