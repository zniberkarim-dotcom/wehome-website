import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Sparkles,
  Wand2,
  Box,
  TrendingUp,
  ShieldCheck,
  Crown,
  Zap,
  Target,
  Award,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Phone,
  Sofa,
  LayoutDashboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchAgents } from "@/lib/data";

const whatsappRecrutement = `https://wa.me/212653535156?text=${encodeURIComponent(
  "Bonjour WeHome,\n\nJe suis agent immobilier et je souhaite en savoir plus sur votre réseau de partenaires.\n\nMerci !"
)}`;

export default function AgentsPage() {
  const { t } = useTranslation();
  const fallback = (key: string, def: string) => {
    const val = t(key);
    return val === key ? def : val;
  };

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* ─── HERO — recrutement ─────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85 text-white">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_20%,white_0%,transparent_50%),radial-gradient(circle_at_80%_80%,white_0%,transparent_50%)]" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-5">
                  <Crown size={14} className="text-amber-300" />
                  {fallback("agents.hero_badge", "Réseau d'agents WeHome")}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight">
                  {fallback("agents.hero_title_part1", "Devenez")}{" "}
                  <span className="bg-gradient-to-r from-amber-300 to-rose-200 bg-clip-text text-transparent">
                    {fallback("agents.hero_title_part2", "l'agent immobilier")}
                  </span>{" "}
                  {fallback("agents.hero_title_part3", "que les vendeurs cherchent.")}
                </h1>
                <p className="text-lg md:text-xl mt-6 opacity-95 leading-relaxed max-w-xl">
                  {fallback(
                    "agents.hero_subtitle",
                    "Rejoins le premier réseau immobilier marocain qui te donne des outils IA, des leads pré-qualifiés et une marque premium qui fait la différence."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link
                    href="/espace-agent/inscription"
                    className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold bg-white text-primary shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all"
                  >
                    {fallback("agents.hero_cta_primary", "Rejoindre le réseau")}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href={whatsappRecrutement}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all"
                  >
                    <Phone size={16} />
                    {fallback("agents.hero_cta_secondary", "Parler à un conseiller")}
                  </a>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-4 md:gap-6 mt-10 pt-8 border-t border-white/15 max-w-md">
                  <Stat value={fallback("agents.stat_1_value", "+50")} label={fallback("agents.stat_1_label", "Agents partenaires")} />
                  <Stat value={fallback("agents.stat_2_value", "500+")} label={fallback("agents.stat_2_label", "Leads / mois")} />
                  <Stat value={fallback("agents.stat_3_value", "2-3×")} label={fallback("agents.stat_3_label", "Vendus plus vite")} />
                </div>
              </motion.div>

              {/* Visual — floating cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block relative h-[440px]"
              >
                <FloatingCard
                  className="absolute top-0 right-0 w-64"
                  delay={0.4}
                  icon={<Wand2 size={18} />}
                  title={fallback("agents.float_card_1_title", "Photos retouchées IA")}
                  description={fallback("agents.float_card_1_desc", "Tes annonces 3× plus attractives")}
                />
                <FloatingCard
                  className="absolute top-32 left-0 w-64"
                  delay={0.6}
                  icon={<Target size={18} />}
                  title={fallback("agents.float_card_2_title", "Leads qualifiés")}
                  description={fallback("agents.float_card_2_desc", "Pré-filtrés par notre équipe")}
                  accent="amber"
                />
                <FloatingCard
                  className="absolute top-64 right-8 w-64"
                  delay={0.8}
                  icon={<LayoutDashboard size={18} />}
                  title={fallback("agents.float_card_3_title", "Dashboard pro")}
                  description={fallback("agents.float_card_3_desc", "Suivi des biens, leads, perfs")}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── BENEFITS ───────────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-14"
            >
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide mb-4">
                <Sparkles size={12} />
                {fallback("agents.benefits_badge", "Ce que tu obtiens")}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                {fallback("agents.benefits_title", "Tout ce dont tu as besoin pour vendre vite.")}
              </h2>
              <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
                {fallback(
                  "agents.benefits_subtitle",
                  "Ton métier c'est de vendre. Le nôtre c'est de te donner les meilleurs outils, leads et marque pour exploser ton volume."
                )}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <BenefitCard
                icon={<Wand2 size={22} />}
                title={fallback("agents.benefit_1_title", "Outils IA inclus")}
                description={fallback(
                  "agents.benefit_1_desc",
                  "Retouche photo IA, home staging virtuel, visite 3D — accès illimité à nos outils premium pour tes annonces."
                )}
                tags={[fallback("agents.benefit_1_tag1", "Photos IA"), fallback("agents.benefit_1_tag2", "Staging virtuel"), fallback("agents.benefit_1_tag3", "3D")]}
              />
              <BenefitCard
                icon={<Target size={22} />}
                title={fallback("agents.benefit_2_title", "Leads pré-qualifiés")}
                description={fallback(
                  "agents.benefit_2_desc",
                  "Tu reçois des contacts d'acheteurs et vendeurs déjà filtrés par notre équipe. Plus de temps à chasser, juste à closer."
                )}
                tags={[fallback("agents.benefit_2_tag1", "+500 leads/mois")]}
                accent="amber"
              />
              <BenefitCard
                icon={<Crown size={22} />}
                title={fallback("agents.benefit_3_title", "Marque premium")}
                description={fallback(
                  "agents.benefit_3_desc",
                  "Tes biens portent la marque WeHome — perçue comme moderne, sérieuse, haut de gamme. Le contraire d'Avito."
                )}
              />
              <BenefitCard
                icon={<LayoutDashboard size={22} />}
                title={fallback("agents.benefit_4_title", "Dashboard complet")}
                description={fallback(
                  "agents.benefit_4_desc",
                  "Espace agent dédié : gestion de tes biens, suivi des leads, statistiques de performance, alertes."
                )}
              />
              <BenefitCard
                icon={<Briefcase size={22} />}
                title={fallback("agents.benefit_5_title", "Formation continue")}
                description={fallback(
                  "agents.benefit_5_desc",
                  "Webinaires, scripts de vente, négociation, juridique — tu montes en compétence pendant que tu vends."
                )}
              />
              <BenefitCard
                icon={<ShieldCheck size={22} />}
                title={fallback("agents.benefit_6_title", "Support & juridique")}
                description={fallback(
                  "agents.benefit_6_desc",
                  "Une équipe back-office qui gère paperasse, notaires, vérifications. Tu te concentres sur le terrain."
                )}
              />
            </div>
          </div>
        </section>

        {/* ─── COMMENT ÇA MARCHE ──────────────────────────────────────── */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-foreground/[0.03] via-amber-50/30 to-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                {fallback("agents.how_title", "Rejoindre WeHome en 3 étapes")}
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                {fallback("agents.how_subtitle", "Process rapide, validation sous 48h.")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard
                number="1"
                title={fallback("agents.step_1_title", "Tu postules en ligne")}
                description={fallback(
                  "agents.step_1_desc",
                  "Remplis le formulaire d'inscription en 5 minutes — quelques infos sur ton expérience et tes spécialités."
                )}
              />
              <StepCard
                number="2"
                title={fallback("agents.step_2_title", "Entretien rapide")}
                description={fallback(
                  "agents.step_2_desc",
                  "Notre équipe te contacte sous 48h pour un entretien (téléphone ou visio) — qu'on apprenne à se connaître."
                )}
              />
              <StepCard
                number="3"
                title={fallback("agents.step_3_title", "Tu démarres")}
                description={fallback(
                  "agents.step_3_desc",
                  "Accès au dashboard, aux outils IA, à ta page agent publique. Tes premiers leads arrivent dans la semaine."
                )}
              />
            </div>

            <div className="text-center mt-12">
              <Link
                href="/espace-agent/inscription"
                className="group inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                {fallback("agents.how_cta", "Commencer ma candidature")}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PROFITS / TYPICAL EARNINGS ─────────────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-foreground text-background p-8 md:p-14 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide mb-4">
                    <TrendingUp size={12} className="text-amber-300" />
                    {fallback("agents.earnings_badge", "Ton potentiel")}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                    {fallback("agents.earnings_title", "Multiplie ton volume par 2 à 3 dès le premier trimestre.")}
                  </h2>
                  <p className="text-base md:text-lg opacity-80 mt-5 leading-relaxed">
                    {fallback(
                      "agents.earnings_desc",
                      "Nos agents partenaires concluent en moyenne 2 à 3× plus de ventes qu'avant — grâce aux leads pré-qualifiés et aux outils qui font perçevoir tes biens comme premium."
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    <Pill icon={<CheckCircle2 size={12} />} label={fallback("agents.earnings_pill_1", "Commission classique")} />
                    <Pill icon={<CheckCircle2 size={12} />} label={fallback("agents.earnings_pill_2", "Pas de frais cachés")} />
                    <Pill icon={<CheckCircle2 size={12} />} label={fallback("agents.earnings_pill_3", "Outils inclus")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <EarningCard
                    label={fallback("agents.earning_1_label", "Avant WeHome")}
                    value={fallback("agents.earning_1_value", "2-3 ventes/an")}
                    sub={fallback("agents.earning_1_sub", "Stress, prospection, leads pourris")}
                    muted
                  />
                  <EarningCard
                    label={fallback("agents.earning_2_label", "Avec WeHome")}
                    value={fallback("agents.earning_2_value", "6-9 ventes/an")}
                    sub={fallback("agents.earning_2_sub", "Volume, qualité, marque forte")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DIRECTORY — agents existants ───────────────────────────── */}
        <section className="py-20 md:py-24 bg-foreground/[0.02] border-y border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-1.5 bg-foreground/10 text-foreground rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide mb-4">
                <Award size={12} />
                {fallback("agents.directory_badge", "Notre équipe")}
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                {fallback("agents.directory_title", "Rencontre nos agents partenaires")}
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                {fallback("agents.directory_subtitle", "Des professionnels triés sur le volet, partout au Maroc.")}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={36} className="animate-spin text-primary" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-border max-w-2xl mx-auto">
                <Users size={40} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground">
                  {fallback("agents.no_agents", "Pas encore d'agents publiés")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {fallback("agents.no_agents_sub", "Sois le premier à rejoindre le réseau.")}
                </p>
                <Link
                  href="/espace-agent/inscription"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full font-bold bg-primary text-white hover:-translate-y-0.5 transition-all"
                >
                  {fallback("agents.no_agents_cta", "Rejoindre")}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={`/agents/${agent.slug ?? agent.id}`}>
                      <div className="group bg-white border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <div className="aspect-[4/3] w-full bg-secondary relative overflow-hidden">
                          {agent.photo_url ? (
                            <img
                              src={agent.photo_url}
                              alt={`${agent.prenom} ${agent.nom}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-5xl font-display font-bold"
                              style={{ background: "linear-gradient(135deg, #8B1A2E 0%, #C0392B 100%)" }}
                            >
                              {agent.prenom.charAt(0)}
                              {agent.nom.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                            {agent.prenom} {agent.nom}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{t("agents.wehome_agent")}</p>
                          {agent.specialites && agent.specialites.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {agent.specialites.slice(0, 3).map((s) => (
                                <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground/70">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-border/60">
                            <span className="text-sm font-semibold text-primary group-hover:underline">{t("agents.view_profile")}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── FINAL CTA ──────────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide mb-5 shadow-sm">
                <Zap size={12} />
                {fallback("agents.final_badge", "Places limitées")}
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
                {fallback("agents.final_title", "Prêt à passer au niveau supérieur ?")}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mt-5 leading-relaxed">
                {fallback(
                  "agents.final_subtitle",
                  "On sélectionne seulement les meilleurs agents pour chaque ville. Postule maintenant pour réserver ta place."
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
                <Link
                  href="/espace-agent/inscription"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  {fallback("agents.final_cta_primary", "Rejoindre le réseau WeHome")}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={whatsappRecrutement}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold border-2 border-foreground/15 text-foreground hover:border-foreground/40 hover:bg-foreground/5 transition-all"
                >
                  <Phone size={16} />
                  {fallback("agents.final_cta_secondary", "Discuter d'abord")}
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-display font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-70 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  title,
  description,
  accent = "white",
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "white" | "amber";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${className} bg-white rounded-2xl shadow-2xl p-4 border border-white/40`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
            accent === "amber"
              ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
              : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-foreground text-sm leading-tight">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</div>
        </div>
      </div>
    </motion.div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
  tags,
  accent = "primary",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string[];
  accent?: "primary" | "amber";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group bg-card border border-border rounded-3xl p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-foreground/20 transition-all"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
          accent === "amber"
            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-display font-bold text-foreground leading-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {tags.map((tag) => (
            <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="relative bg-white rounded-3xl p-6 shadow-sm border border-border"
    >
      <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-display font-bold text-lg flex items-center justify-center shadow-lg">
        {number}
      </div>
      <h3 className="text-lg font-display font-bold text-foreground mt-4 leading-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function EarningCard({
  label,
  value,
  sub,
  muted = false,
}: {
  label: string;
  value: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        muted
          ? "bg-white/5 border border-white/10 text-white/60"
          : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl"
      }`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-wider ${muted ? "opacity-70" : "opacity-90"}`}>
        {label}
      </div>
      <div className="text-2xl font-display font-bold mt-2 leading-tight">{value}</div>
      <div className={`text-xs mt-1.5 leading-snug ${muted ? "opacity-70" : "opacity-95"}`}>{sub}</div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white rounded-full px-3 py-1 text-[11px] font-semibold">
      <span className="text-amber-300">{icon}</span>
      {label}
    </span>
  );
}
