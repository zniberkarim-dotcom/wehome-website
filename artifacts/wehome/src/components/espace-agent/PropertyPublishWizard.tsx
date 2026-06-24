// src/components/espace-agent/PropertyPublishWizard.tsx
//
// "✨ Publier avec IA" — 3-step wizard for agents.
// Replaces the legacy flat modal with a magical experience:
//   Step 1 — minimal brief (type, location, specs, features, price)
//   Step 2 — AI generates premium title + description + suggested features
//   Step 3 — photos upload, mandat, publish
//
// Uses existing infrastructure (createPortalProperty, uploadPortalPropertyPhoto)
// so it lives alongside the legacy modal — agents can pick either flow.

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle, Upload,
  CheckCircle2, RefreshCw, Wand2, Edit3, Camera, Home as HomeIcon,
  MapPin, Building2, Sofa, Bath, Bed, Square, Banknote,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPortalProperty, uploadPortalPropertyPhoto,
} from "@/lib/agent-portal";
import { PROPERTY_TYPES } from "@/lib/data";
import { generatePropertyDescription, type GeneratedListing } from "@/lib/ai";

/* ────────────────────────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────────────────────── */

const POPULAR_CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"];

const QUICK_FEATURES = [
  "Parking", "Piscine", "Ascenseur", "Gardien", "Terrasse", "Climatisation",
  "Jardin", "Balcon", "Garage", "Vue mer", "Vue dégagée", "Cuisine équipée",
];

const MAX_PHOTOS = 15;

/* ────────────────────────────────────────────────────────────────────────────
 * State
 * ────────────────────────────────────────────────────────────────────────── */

interface WizardState {
  // Step 1 — brief
  type: string;
  transaction: "Vente" | "Location";
  ville: string;
  quartier: string;
  surface: string;
  chambres: number;
  salons: number;
  sdb: number;
  prix: string;
  meuble: boolean;
  features: string[];
  // Step 2 — generated content (editable)
  title: string;
  description: string;
  // Step 3 — publish
  mandat_signe: boolean;
}

const INITIAL: WizardState = {
  type: "Appartement",
  transaction: "Vente",
  ville: "Casablanca",
  quartier: "",
  surface: "",
  chambres: 0,
  salons: 0,
  sdb: 0,
  prix: "",
  meuble: false,
  features: [],
  title: "",
  description: "",
  mandat_signe: false,
};

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────────────────────── */

export function PropertyPublishWizard({
  agentId, onClose, onSuccess,
}: {
  agentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<WizardState>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  // AI generation state (step 2)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHasGenerated, setAiHasGenerated] = useState(false);
  const [aiSuggestedFeatures, setAiSuggestedFeatures] = useState<string[]>([]);

  // Photos (step 3)
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();

  /* ── Mutations ───────────────────────────────────────────────────────── */

  const publishMutation = useMutation({
    mutationFn: async () => {
      // Upload photos sequentially (preserve order)
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const url = await uploadPortalPropertyPhoto(file, agentId);
        uploadedUrls.push(url);
      }
      await createPortalProperty(agentId, {
        titre: form.title,
        type: form.type,
        transaction: form.transaction,
        adresse: form.quartier,
        ville: form.ville,
        prix: form.prix,
        surface_construite: form.surface || "0",
        chambres: form.chambres,
        salles_de_bains: form.sdb,
        salons: form.salons,
        description: form.description,
        meuble: form.meuble,
        features: form.features,
        photos: uploadedUrls,
        photo_principale: uploadedUrls[0],
        mandat_signe: form.mandat_signe,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-properties"] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Erreur lors de la publication.");
    },
  });

  /* ── Step navigation ─────────────────────────────────────────────────── */

  const validateStep1 = (): string | null => {
    if (!form.type) return "Sélectionnez le type de bien.";
    if (!form.ville.trim()) return "Indiquez la ville.";
    if (!form.quartier.trim()) return "Indiquez le quartier ou l'adresse.";
    if (!form.prix || Number(form.prix) <= 0) return "Indiquez un prix valide.";
    return null;
  };

  const validateStep3 = (): string | null => {
    if (!form.title.trim()) return "Le titre est requis (revenez à l'étape 2).";
    if (photoFiles.length === 0) return "Ajoutez au moins une photo.";
    if (!form.mandat_signe) return "Vous devez confirmer le mandat signé.";
    return null;
  };

  const next = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2 && !form.title.trim()) {
      setError("Cliquez sur \"Générer\" ou écrivez le titre manuellement avant de continuer.");
      return;
    }
    setDirection(1);
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const back = () => {
    setError(null);
    setDirection(-1);
    setStep((s) => (s === 3 ? 2 : 1));
  };

  /* ── AI generation ───────────────────────────────────────────────────── */

  const runAiGeneration = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const result: GeneratedListing = await generatePropertyDescription({
        type: form.type,
        transaction: form.transaction,
        ville: form.ville,
        quartier: form.quartier,
        surface: form.surface ? Number(form.surface) : undefined,
        chambres: form.chambres > 0 ? form.chambres : undefined,
        salons: form.salons > 0 ? form.salons : undefined,
        sdb: form.sdb > 0 ? form.sdb : undefined,
        prix: form.prix ? Number(form.prix) : undefined,
        features: form.features,
        meuble: form.meuble,
      });
      setForm((f) => ({ ...f, title: result.title, description: result.description }));
      setAiSuggestedFeatures(result.suggested_features.filter((s) => !form.features.includes(s)));
      setAiHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur IA. Vous pouvez écrire le titre et la description à la main.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Photos (step 3) ─────────────────────────────────────────────────── */

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photoFiles.length;
    const arr = Array.from(files).slice(0, remaining);
    setPhotoFiles((prev) => [...prev, ...arr]);
    setPhotoPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (i: number) => {
    setPhotoFiles((prev) => prev.filter((_, j) => j !== i));
    setPhotoPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */

  const handlePublish = () => {
    setError(null);
    const err = validateStep3();
    if (err) { setError(err); return; }
    publishMutation.mutate();
  };

  /* ── Derived ─────────────────────────────────────────────────────────── */

  const briefSummary = useMemo(() => {
    const parts = [
      form.type,
      form.transaction === "Vente" ? "à vendre" : "à louer",
      form.surface ? `${form.surface}m²` : null,
      form.chambres > 0 ? `${form.chambres} ch.` : null,
      form.quartier ? `— ${form.quartier}` : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [form]);

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky header with progress ── */}
        <div className="px-7 pt-6 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                <Wand2 size={17} />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground leading-tight">Publier avec IA</h2>
                <p className="text-[11px] text-muted-foreground">Étape {step} / 3 · {step === 1 ? "Brief" : step === 2 ? "Magie IA" : "Photos & publish"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-1 flex-1 rounded-full overflow-hidden bg-border/50">
                <motion.div
                  initial={false}
                  animate={{ width: step > s ? "100%" : step === s ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`h-full rounded-full ${step > s ? "bg-primary" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Animated content ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="s1"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 30 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Step1Brief form={form} setForm={setForm} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="s2"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 30 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Step2AiGenerate
                  form={form}
                  setForm={setForm}
                  briefSummary={briefSummary}
                  aiLoading={aiLoading}
                  aiHasGenerated={aiHasGenerated}
                  aiSuggestedFeatures={aiSuggestedFeatures}
                  onGenerate={runAiGeneration}
                  onAddSuggestedFeature={(f) => {
                    setForm((s) => ({ ...s, features: [...s.features, f] }));
                    setAiSuggestedFeatures((prev) => prev.filter((x) => x !== f));
                  }}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="s3"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 30 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Step3PhotosPublish
                  form={form}
                  setForm={setForm}
                  photoPreviews={photoPreviews}
                  onPhotos={handlePhotoFiles}
                  onRemovePhoto={removePhoto}
                  fileRef={fileRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mx-7 mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 shrink-0">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* ── Sticky footer ── */}
        <div className="px-7 py-4 border-t border-border/40 flex items-center justify-between gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={step === 1 ? onClose : back}
            disabled={publishMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {step === 1 ? "Annuler" : <><ChevronLeft size={15} /> Précédent</>}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-foreground hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all"
            >
              Continuer <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:-translate-y-0.5 shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {publishMutation.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Publication…</>
              ) : (
                <><CheckCircle2 size={15} /> Publier mon bien</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Step 1 — Brief
 * ────────────────────────────────────────────────────────────────────────── */

function Step1Brief({
  form, setForm,
}: { form: WizardState; setForm: (fn: (s: WizardState) => WizardState) => void }) {
  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const toggleFeature = (f: string) =>
    setForm((s) => ({
      ...s,
      features: s.features.includes(f) ? s.features.filter((x) => x !== f) : [...s.features, f],
    }));

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h3 className="text-xl font-display font-bold text-foreground leading-tight">Décrivez le bien en 1 minute</h3>
        <p className="text-sm text-muted-foreground mt-1">Quelques infos essentielles — l'IA s'occupe du reste à l'étape suivante.</p>
      </div>

      {/* Type + transaction */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Type" icon={<HomeIcon size={13} />} required>
          <Select value={form.type} onChange={(v) => set("type", v)}>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Transaction" required>
          <div className="grid grid-cols-2 gap-2">
            {(["Vente", "Location"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => set("transaction", opt)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  form.transaction === opt
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted/60 text-foreground/70 hover:bg-muted"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* City + neighborhood */}
      <Field label="Ville" icon={<Building2 size={13} />} required>
        <div className="flex flex-wrap gap-2 mb-2">
          {POPULAR_CITIES.map((c) => {
            const active = form.ville.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => set("ville", active ? "" : c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white border-border text-foreground/70 hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <Input value={form.ville} onChange={(e) => set("ville", e.target.value)} placeholder="Casablanca" />
      </Field>

      <Field label="Quartier / Adresse" icon={<MapPin size={13} />} required>
        <Input value={form.quartier} onChange={(e) => set("quartier", e.target.value)} placeholder="Maarif, Ain Diab, CFC…" />
      </Field>

      {/* Surface + price */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Surface (m²)" icon={<Square size={13} />}>
          <Input type="number" inputMode="numeric" value={form.surface} onChange={(e) => set("surface", e.target.value)} placeholder="85" />
        </Field>
        <Field label={`Prix${form.transaction === "Location" ? " (MAD/mois)" : " (MAD)"}`} icon={<Banknote size={13} />} required>
          <Input type="number" inputMode="numeric" value={form.prix} onChange={(e) => set("prix", e.target.value)} placeholder={form.transaction === "Location" ? "8 500" : "1 200 000"} />
        </Field>
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Chambres" icon={<Bed size={13} />}>
          <Stepper value={form.chambres} onChange={(n) => set("chambres", n)} />
        </Field>
        <Field label="Salons" icon={<Sofa size={13} />}>
          <Stepper value={form.salons} onChange={(n) => set("salons", n)} />
        </Field>
        <Field label="Sdb" icon={<Bath size={13} />}>
          <Stepper value={form.sdb} onChange={(n) => set("sdb", n)} />
        </Field>
      </div>

      {/* Features */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2 block">
          Caractéristiques
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_FEATURES.map((f) => {
            const active = form.features.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white border-border text-foreground/70 hover:border-primary/40"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meublé */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
        <span className="text-sm font-semibold text-foreground">Bien meublé</span>
        <button
          type="button"
          onClick={() => set("meuble", !form.meuble)}
          className={`w-11 h-6 rounded-full transition-colors ${form.meuble ? "bg-primary" : "bg-border"}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.meuble ? "translate-x-5" : ""}`} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Step 2 — AI generate
 * ────────────────────────────────────────────────────────────────────────── */

function Step2AiGenerate({
  form, setForm, briefSummary, aiLoading, aiHasGenerated, aiSuggestedFeatures,
  onGenerate, onAddSuggestedFeature,
}: {
  form: WizardState;
  setForm: (fn: (s: WizardState) => WizardState) => void;
  briefSummary: string;
  aiLoading: boolean;
  aiHasGenerated: boolean;
  aiSuggestedFeatures: string[];
  onGenerate: () => void;
  onAddSuggestedFeature: (f: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Brief recap card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50/30 border border-amber-200/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Votre brief</p>
        <p className="text-sm font-semibold text-foreground leading-snug">{briefSummary || "Brief incomplet"}</p>
        {form.features.length > 0 && (
          <p className="text-xs text-foreground/70 mt-2">
            <span className="font-semibold">Caractéristiques :</span> {form.features.join(" · ")}
          </p>
        )}
      </div>

      {/* Generate button — primary CTA when no content yet */}
      {!aiHasGenerated && !aiLoading && (
        <div className="text-center py-6">
          <button
            type="button"
            onClick={onGenerate}
            className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-white bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            Générer le titre et la description
          </button>
          <p className="text-[11px] text-muted-foreground mt-3">
            L'IA rédige une annonce premium en 5 secondes à partir de votre brief.
          </p>
        </div>
      )}

      {/* Loading */}
      {aiLoading && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-3">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <p className="text-sm font-semibold text-foreground">L'IA rédige votre annonce…</p>
          <p className="text-[11px] text-muted-foreground mt-1">Ça prend généralement 3 à 6 secondes.</p>
        </div>
      )}

      {/* Editable title + description after generation */}
      {aiHasGenerated && !aiLoading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Annonce générée — éditable</p>
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-foreground/70 hover:text-foreground bg-muted/60 hover:bg-muted transition-colors"
            >
              <RefreshCw size={11} /> Régénérer
            </button>
          </div>

          <Field label="Titre" icon={<Edit3 size={13} />}>
            <Input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="Titre accrocheur de l'annonce"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={9}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all resize-none leading-relaxed"
              placeholder="Description de l'annonce…"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{form.description.trim().length} caractères</p>
          </Field>

          {/* Suggested features */}
          {aiSuggestedFeatures.length > 0 && (
            <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <Sparkles size={11} />
                L'IA suggère ces caractéristiques en plus
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestedFeatures.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onAddSuggestedFeature(f)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    + {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Step 3 — Photos + Publish
 * ────────────────────────────────────────────────────────────────────────── */

function Step3PhotosPublish({
  form, setForm, photoPreviews, onPhotos, onRemovePhoto, fileRef,
}: {
  form: WizardState;
  setForm: (fn: (s: WizardState) => WizardState) => void;
  photoPreviews: string[];
  onPhotos: (files: FileList | null) => void;
  onRemovePhoto: (i: number) => void;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-5">
      {/* Preview card */}
      <div className="rounded-2xl bg-foreground/[0.03] border border-border/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Aperçu de votre annonce</p>
        <p className="text-base font-display font-bold text-foreground leading-snug">{form.title || "(titre non défini)"}</p>
        <p className="text-xs text-muted-foreground mt-1">{form.quartier}, {form.ville} · {form.type}</p>
        {form.description && (
          <p className="text-xs text-foreground/75 mt-2 line-clamp-3 leading-relaxed">{form.description}</p>
        )}
      </div>

      {/* Photos */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2 block">
          Photos <span className="text-destructive">*</span>
          <span className="ml-1 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
            La 1ère photo sera la principale
          </span>
        </label>

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => onPhotos(e.target.files)} />

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {photoPreviews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold uppercase tracking-wider">
                  Principale
                </span>
              )}
              <button type="button" onClick={() => onRemovePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </div>
          ))}
          {photoPreviews.length < MAX_PHOTOS && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors">
              <Upload size={18} />
              <span className="text-[10px] font-semibold">Ajouter</span>
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
          <Camera size={11} /> {photoPreviews.length} / {MAX_PHOTOS} photos
        </p>
      </div>

      {/* Mandat — required */}
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50">
        <div className="mt-0.5">
          <input type="checkbox" checked={form.mandat_signe}
            onChange={(e) => setForm((s) => ({ ...s, mandat_signe: e.target.checked }))}
            className="sr-only" />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.mandat_signe ? "bg-primary border-primary" : "border-amber-400"}`}>
            {form.mandat_signe && <CheckCircle2 size={11} className="text-white" />}
          </div>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>Mandat signé :</strong> Je confirme avoir un mandat de {form.transaction === "Location" ? "location" : "vente"} signé avec le propriétaire pour ce bien.
        </p>
      </label>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Shared sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function Field({
  label, required, icon, children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
        {icon && <span className="text-primary/70">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all ${props.className ?? ""}`}
    />
  );
}

function Select({
  value, onChange, children,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
    >
      {children}
    </select>
  );
}

function Stepper({ value, onChange, max = 12 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="flex items-stretch rounded-xl border border-border overflow-hidden bg-muted/50">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-3 text-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors"
      >−</button>
      <input
        type="number"
        value={value}
        min={0}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(0, n)));
        }}
        className="flex-1 bg-transparent text-center text-sm font-bold tabular-nums focus:outline-none w-12"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 text-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors"
      >+</button>
    </div>
  );
}
