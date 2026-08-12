import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Camera,
  Box,
  Crown,
  Sparkles,
  Check,
  ArrowRight,
  Phone,
  Award,
  Clock,
  Shield,
  TrendingDown,
  Building2,
  MessageCircle,
  ChevronDown,
  Wand2,
  Plane,
  FileText,
  Eye,
  Home,
  Key,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

/* ────────────────────────────────────────────────────────────────────────────
   Service Pro — landing page de vente des packs (visuel, 3D, conciergerie)
   pour les particuliers qui publient un bien sur WeHome.
   Les demandes écrivent dans `leads` avec source: "Service Pro — Pack X"
   pour qu'on retrouve facilement la conversion côté CRM.
   ──────────────────────────────────────────────────────────────────────────── */

type PackKey =
  | "essentiel"
  | "signature"
  | "conciergerie"
  | "location-express"
  | "location-cle-en-main";

interface SalePack {
  key: PackKey;
  name: string;
  price: string;
  priceDetail?: string;
  tagline: string;
  highlight?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  features: string[];
  cta: string;
  featured?: boolean;
}

const SALE_PACKS: SalePack[] = [
  {
    key: "essentiel",
    name: "Essentiel",
    price: "2 990 MAD",
    tagline: "Le minimum pour ne plus vendre avec 3 photos floues.",
    icon: Camera,
    features: [
      "15 photos IA retouchées (luminosité, ciel, perspective)",
      "Home staging virtuel sur 5 pièces",
      "Plan 2D du bien",
      "Annonce rédigée par un pro de l'immobilier",
      "Diffusion sur WeHome + 2 portails",
      "Mise en ligne sous 48h",
    ],
    cta: "Choisir Essentiel",
  },
  {
    key: "signature",
    name: "Signature",
    price: "6 990 MAD",
    tagline: "Le pack que choisissent 7 vendeurs sur 10. Niveau agence, sans la commission.",
    highlight: "Le plus choisi",
    icon: Crown,
    featured: true,
    features: [
      "Tout l'Essentiel",
      "Visite 3D immersive (type Matterport)",
      "Vidéo drone si bien avec extérieur",
      "Estimation pro avec analyse comparative du quartier",
      "Diffusion étendue : 5 à 7 portails (Avito, Sarouty, Mubawab, etc.)",
      "Badge « Bien Vérifié WeHome » + mise en avant 30 jours",
      "Mise en ligne sous 72h",
    ],
    cta: "Choisir Signature",
  },
  {
    key: "conciergerie",
    name: "Conciergerie",
    price: "14 990 MAD",
    priceDetail: "+ 0,5 % à la signature",
    tagline: "Vous voulez vendre, pas devenir agent immobilier. On prend tout en main.",
    icon: Award,
    features: [
      "Tout Signature",
      "Gestion complète des visites par un agent WeHome",
      "Qualification et filtrage des acheteurs",
      "Négociation menée par notre équipe",
      "Accompagnement jusqu'à la signature notaire",
      "Garantie résultat : vendu en 90 jours ou remboursement partiel",
      "Suivi WhatsApp dédié 7j/7",
    ],
    cta: "Demander Conciergerie",
  },
];

const RENTAL_PACKS: SalePack[] = [
  {
    key: "location-express",
    name: "Location Express",
    price: "1 990 MAD",
    tagline: "Pour louer vite, au bon prix, avec un dossier propre.",
    icon: Home,
    features: [
      "10 photos IA retouchées",
      "Home staging virtuel sur 3 pièces",
      "Annonce rédigée + diffusion WeHome + 2 portails",
      "Mise en ligne sous 48h",
    ],
    cta: "Choisir Express",
  },
  {
    key: "location-cle-en-main",
    name: "Location Clé en Main",
    price: "3 990 MAD",
    priceDetail: "+ 50 % du 1er mois de loyer",
    tagline: "On s'occupe de tout, jusqu'à la signature du bail.",
    icon: Key,
    features: [
      "Tout Express",
      "Visite 3D + vidéo verticale (Reels)",
      "Gestion des visites et tri des candidats locataires",
      "Vérification dossier locataire (employeur, garant, revenus)",
      "Rédaction du bail conforme loi 67-12",
      "Diffusion étendue 5+ portails",
    ],
    cta: "Choisir Clé en Main",
  },
];

const PROCESS_STEPS = [
  {
    icon: MessageCircle,
    title: "Vous nous contactez",
    desc: "Formulaire ou WhatsApp. Réponse sous 2h en jour ouvré.",
  },
  {
    icon: Camera,
    title: "Shooting + visite 3D",
    desc: "Notre équipe passe chez vous. Photos, 3D, drone si besoin. 1h sur place.",
  },
  {
    icon: Wand2,
    title: "Magie IA + mise en ligne",
    desc: "Retouches, home staging virtuel, rédaction. En ligne sous 48-72h.",
  },
  {
    icon: Eye,
    title: "Visiteurs qualifiés",
    desc: "Vous recevez les contacts. Pour Conciergerie, on gère les visites pour vous.",
  },
];

const FAQ_ITEMS = [
  {
    q: "En quoi vous êtes différents d'une agence classique à 2,5 % ?",
    a: "Une agence à 2,5 % sur une vente à 2M MAD vous coûte 50 000 MAD. Notre pack Conciergerie sur la même vente revient à 14 990 + 10 000 = ~25 000 MAD au total. Vous économisez 25 000 MAD, et vous avez exactement le même niveau de service : photos pro, visites gérées, négociation, accompagnement notaire. La seule différence : on facture le travail, pas un pourcentage déguisé.",
  },
  {
    q: "Comment vos photos IA peuvent être de qualité équivalente à un photographe pro ?",
    a: "Nos retouches utilisent les outils utilisés par les agences haut de gamme aux États-Unis et en Europe : correction de luminosité, ciel remplacé, perspective redressée, encombrement enlevé. Pour le home staging virtuel, on ajoute du mobilier moderne dans des pièces vides ou mal meublées, ce qui peut augmenter le prix de vente perçu de 5 à 10 %. C'est légal et standard, à condition d'indiquer « visualisation » dans l'annonce, ce qu'on fait systématiquement.",
  },
  {
    q: "La visite 3D, c'est vraiment utile au Maroc ?",
    a: "Oui, et plus que jamais. 40 % des acheteurs au Maroc sont des MRE ou des étrangers qui ne peuvent pas se déplacer pour chaque visite. Une visite 3D filtre les curieux et ne fait venir que les vrais acheteurs intéressés. Résultat : vous faites 5 visites au lieu de 30, et chaque visite a une bien plus forte chance de conclure.",
  },
  {
    q: "Est-ce que je peux acheter juste les photos sans le reste ?",
    a: "Oui, le pack Essentiel à 2 990 MAD est conçu pour ça. C'est notre point d'entrée. Beaucoup de clients commencent par Essentiel, puis si le bien ne part pas en 30 jours, ils upgradent vers Signature ou Conciergerie sans payer deux fois (on déduit ce que vous avez déjà payé).",
  },
  {
    q: "Garantie résultat sur Conciergerie, ça veut dire quoi exactement ?",
    a: "Si votre bien n'est pas vendu sous 90 jours à partir de la mise en ligne, vous recevez un remboursement de 50 % du pack Conciergerie (soit 7 495 MAD). On garde la peau dans le jeu : si on échoue, on paye. Conditions complètes au moment de la signature du mandat.",
  },
  {
    q: "Et si je veux ajouter juste la visite 3D ou juste le drone ?",
    a: "Add-ons disponibles à la carte : visite 3D seule (2 490 MAD), shooting drone seul (990 MAD), estimation pro PDF seule (799 MAD), home staging virtuel sur une pièce supplémentaire (290 MAD/pièce). Contactez-nous via le formulaire en précisant ce que vous voulez.",
  },
];

const COMPARISON = [
  {
    feature: "Photos professionnelles retouchées",
    wehome: true,
    agence: true,
    avito: false,
  },
  {
    feature: "Home staging virtuel IA",
    wehome: true,
    agence: false,
    avito: false,
  },
  {
    feature: "Visite 3D immersive",
    wehome: true,
    agence: "Rare",
    avito: false,
  },
  {
    feature: "Estimation pro comparative",
    wehome: true,
    agence: true,
    avito: false,
  },
  {
    feature: "Diffusion multi-portails",
    wehome: true,
    agence: true,
    avito: false,
  },
  {
    feature: "Gestion des visites",
    wehome: "Pack Conciergerie",
    agence: true,
    avito: false,
  },
  {
    feature: "Coût total sur vente 2M MAD",
    wehome: "≈ 25 000 MAD",
    agence: "50 000 MAD",
    avito: "Gratuit",
    highlight: true,
  },
];

export default function ServicesProPage() {
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<PackKey>("signature");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    propertyType: "Appartement",
    transaction: "Vente",
    surface: "",
    message: "",
  });

  const setField =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  function packLabel(key: PackKey): string {
    const all = [...SALE_PACKS, ...RENTAL_PACKS];
    return all.find((p) => p.key === key)?.name ?? key;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({
        title: "Champs requis",
        description: "Merci d'indiquer au moins votre nom et votre téléphone.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        notes: [
          `Pack souhaité : ${packLabel(selectedPack)}`,
          `Transaction : ${form.transaction}`,
          `Type de bien : ${form.propertyType}`,
          form.city ? `Ville : ${form.city}` : null,
          form.surface ? `Surface : ${form.surface} m²` : null,
          form.message ? `Message : ${form.message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: `Service Pro — ${packLabel(selectedPack)}`,
        status: "New",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({
        title: "Demande envoyée",
        description: "Notre équipe vous contacte sous 2h (jour ouvré). À très vite !",
      });
      setForm({
        name: "",
        phone: "",
        email: "",
        city: "",
        propertyType: "Appartement",
        transaction: "Vente",
        surface: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Contactez-nous au +212 6 53 53 51 56.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function choosePack(key: PackKey) {
    setSelectedPack(key);
    const formEl = document.getElementById("service-pro-form");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles size={16} />
              Services Pro pour Particuliers
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Vendez comme un particulier,
              <br />
              <span className="text-primary">avec les armes d'une agence pro.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Photos IA retouchées, home staging virtuel, visite 3D immersive, conseil pro. Tout ce
              qui fait qu'un bien se vend en 30 jours au lieu de 6 mois — pour une fraction de la
              commission d'une agence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() =>
                  document.getElementById("packs")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Voir les packs
                <ArrowRight size={20} />
              </button>
              <a
                href="https://wa.me/212653535156?text=Bonjour%20WeHome%2C%20je%20veux%20en%20savoir%20plus%20sur%20vos%20Services%20Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300"
              >
                <Phone size={20} />
                Parler à un conseiller
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  - 50 %
                </div>
                <div className="text-sm text-muted-foreground">vs commission agence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  48 h
                </div>
                <div className="text-sm text-muted-foreground">de mise en ligne</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  90 j
                </div>
                <div className="text-sm text-muted-foreground">garantie résultat</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  7+
                </div>
                <div className="text-sm text-muted-foreground">portails de diffusion</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PACKS VENTE */}
      <section id="packs" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Pour vendre votre bien
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trois niveaux d'accompagnement. Vous choisissez selon votre temps et votre budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SALE_PACKS.map((pack, i) => {
              const Icon = pack.icon;
              return (
                <motion.div
                  key={pack.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-3xl p-8 border ${
                    pack.featured
                      ? "bg-card border-primary shadow-2xl shadow-primary/20 scale-105 md:scale-100 md:-translate-y-4"
                      : "bg-card border-border"
                  }`}
                >
                  {pack.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                      {pack.highlight}
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      pack.featured
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    {pack.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">{pack.tagline}</p>

                  <div className="mb-8">
                    <div className="text-4xl font-display font-bold text-foreground">
                      {pack.price}
                    </div>
                    {pack.priceDetail && (
                      <div className="text-sm text-muted-foreground mt-1">{pack.priceDetail}</div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pack.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check size={18} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => choosePack(pack.key)}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                      pack.featured
                        ? "bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
                    }`}
                  >
                    {pack.cta}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARAISON */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Pourquoi pas une agence ? Pourquoi pas Avito ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comparons honnêtement, sur une vente type à 2 millions de dirhams.
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
            <div className="grid grid-cols-4 gap-0 bg-secondary/50 border-b border-border">
              <div className="p-4 md:p-6 font-semibold text-sm md:text-base text-foreground">
                Critère
              </div>
              <div className="p-4 md:p-6 text-center font-bold text-sm md:text-base text-primary bg-primary/5">
                WeHome Pro
              </div>
              <div className="p-4 md:p-6 text-center font-semibold text-sm md:text-base text-muted-foreground">
                Agence classique
              </div>
              <div className="p-4 md:p-6 text-center font-semibold text-sm md:text-base text-muted-foreground">
                Avito seul
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-0 border-b border-border last:border-b-0 ${
                  row.highlight ? "bg-primary/5 font-bold" : ""
                }`}
              >
                <div className="p-4 md:p-6 text-sm md:text-base text-foreground">{row.feature}</div>
                <div className="p-4 md:p-6 text-center bg-primary/5">
                  <CellValue value={row.wehome} positive />
                </div>
                <div className="p-4 md:p-6 text-center">
                  <CellValue value={row.agence} />
                </div>
                <div className="p-4 md:p-6 text-center">
                  <CellValue value={row.avito} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-accent/10 border border-accent/30 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <TrendingDown className="text-accent shrink-0" size={32} />
            <div>
              <div className="font-display font-bold text-lg text-foreground">
                Sur une vente à 2M MAD, vous économisez environ 25 000 MAD vs agence classique.
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Pour le même niveau de service. Et 100 % plus de visibilité qu'Avito seul.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Comment ça se passe ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              De votre demande à votre première visite : 4 étapes, 72 heures maximum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-lg">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 mt-2">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PACKS LOCATION */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Key size={16} />
              Vous louez plutôt que vous vendez ?
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Packs spécial location
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Même logique : on rend votre annonce irrésistible, et si vous voulez, on gère tout
              jusqu'à la signature du bail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {RENTAL_PACKS.map((pack, i) => {
              const Icon = pack.icon;
              return (
                <motion.div
                  key={pack.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card rounded-3xl p-8 border border-border"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    {pack.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">{pack.tagline}</p>
                  <div className="mb-8">
                    <div className="text-3xl font-display font-bold text-foreground">
                      {pack.price}
                    </div>
                    {pack.priceDetail && (
                      <div className="text-sm text-muted-foreground mt-1">{pack.priceDetail}</div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pack.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check size={18} className="text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => choosePack(pack.key)}
                    className="w-full py-3 px-6 rounded-xl font-bold text-base bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 flex items-center justify-center gap-2 transition-all"
                  >
                    {pack.cta}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="service-pro-form" className="py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                Réservez votre pack
              </h2>
              <p className="text-muted-foreground">
                Notre équipe vous rappelle sous 2h (jour ouvré) pour caler le shooting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Pack sélectionné — pills */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Pack souhaité
                </label>
                <div className="flex flex-wrap gap-2">
                  {[...SALE_PACKS, ...RENTAL_PACKS].map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      onClick={() => setSelectedPack(p.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedPack === p.key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nom complet" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField("name")}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Karim El Idrissi"
                  />
                </Field>
                <Field label="Téléphone (WhatsApp de préférence)" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+212 6 XX XX XX XX"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="karim@example.com"
                  />
                </Field>
                <Field label="Ville du bien">
                  <input
                    type="text"
                    value={form.city}
                    onChange={setField("city")}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Casablanca, Rabat, Marrakech…"
                  />
                </Field>
                <Field label="Transaction">
                  <select
                    value={form.transaction}
                    onChange={setField("transaction")}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Vente</option>
                    <option>Location</option>
                  </select>
                </Field>
                <Field label="Type de bien">
                  <select
                    value={form.propertyType}
                    onChange={setField("propertyType")}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Appartement</option>
                    <option>Villa</option>
                    <option>Riad</option>
                    <option>Maison</option>
                    <option>Terrain</option>
                    <option>Local commercial</option>
                    <option>Bureau</option>
                  </select>
                </Field>
                <Field label="Surface approximative (m²)">
                  <input
                    type="text"
                    value={form.surface}
                    onChange={setField("surface")}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="120"
                  />
                </Field>
              </div>

              <Field label="Message (optionnel)">
                <textarea
                  value={form.message}
                  onChange={setField("message")}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Délai souhaité, contraintes particulières, questions…"
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:translate-y-0"
              >
                {submitting ? "Envoi en cours…" : "Envoyer ma demande"}
                {!submitting && <ArrowRight size={20} />}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                En envoyant ce formulaire, vous acceptez d'être contacté par WeHome au sujet de
                votre demande. Aucun engagement financier à ce stade.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="font-display font-semibold text-base md:text-lg text-foreground pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-muted-foreground transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-[3rem] p-10 md:p-16 border border-border shadow-2xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Vendez vite. Vendez bien. Vendez sans commission.
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Notre équipe vous rappelle sous 2h. Aucun engagement avant le shooting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() =>
                    document
                      .getElementById("service-pro-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  Réserver maintenant
                  <ArrowRight size={20} />
                </button>
                <a
                  href="https://wa.me/212653535156?text=Bonjour%20WeHome%2C%20je%20veux%20en%20savoir%20plus%20sur%20vos%20Services%20Pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300"
                >
                  <Phone size={20} />
                  WhatsApp direct
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ──────────────── Helpers ──────────────── */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-2">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function CellValue({ value, positive }: { value: boolean | string; positive?: boolean }) {
  if (value === true) {
    return (
      <Check size={20} className={`mx-auto ${positive ? "text-primary" : "text-foreground"}`} />
    );
  }
  if (value === false) {
    return <span className="text-muted-foreground text-xl">—</span>;
  }
  return (
    <span
      className={`text-sm md:text-base ${positive ? "text-primary font-semibold" : "text-foreground"}`}
    >
      {value}
    </span>
  );
}
