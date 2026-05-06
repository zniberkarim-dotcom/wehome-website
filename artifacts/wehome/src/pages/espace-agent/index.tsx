import { Link } from "wouter";
import { motion } from "framer-motion";
import { Building2, Users, BarChart2, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const VALUE_PROPS = [
  {
    icon: Building2,
    title: "Vos listings sur wehome.ma",
    body: "Exposition nationale immédiate. Vos biens apparaissent sur la plateforme WeHome devant des milliers d'acheteurs et investisseurs qualifiés.",
  },
  {
    icon: Users,
    title: "Leads qualifiés en temps réel",
    body: "Chaque contact acheteur vous est transmis directement. Nom, téléphone, message — sans intermédiaire, sans délai.",
  },
  {
    icon: BarChart2,
    title: "Dashboard de performance",
    body: "Vues, contacts, délais de vente — tout en un seul endroit. Mesurez l'efficacité de vos annonces et ajustez votre stratégie.",
  },
];

const FEATURES = [
  "Accès au réseau partagé WeHome MLS",
  "Biens publiés sous votre nom et votre agence",
  "Leads transmis en temps réel par email",
  "Dashboard de suivi personnel",
  "Profil public sur wehome.ma/agents/[slug]",
  "Support dédié de l'équipe WeHome",
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function EspaceAgentPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0f0709 0%, #1a0c0e 60%, #1f0d0f 100%)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #C0392B 0%, transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, #C0392B 0%, transparent 70%)" }} />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.18em] uppercase"
              style={{ borderColor: "rgba(192,57,43,0.35)", color: "rgba(192,57,43,0.8)", background: "rgba(192,57,43,0.06)" }}
            >
              <Star size={12} fill="currentColor" />
              WeHome Agent Network
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display font-bold text-white mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
            >
              Gérez vos biens.{" "}
              <span style={{ color: "#e05a4a" }}>Accédez à vos leads.</span>
              <br />Développez votre activité.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-white/55 text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Le portail agent WeHome vous donne accès à une plateforme professionnelle pour lister vos biens, suivre vos performances, et rejoindre le premier réseau immobilier partagé du Maroc.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/espace-agent/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border-2 font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}
              >
                Se connecter
              </Link>
              <Link
                href="/espace-agent/inscription"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg"
                style={{ background: "#C0392B", boxShadow: "0 8px 32px rgba(192,57,43,0.4)" }}
              >
                Devenir agent partenaire
                <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── 3 Value Props ─────────────────────────────────────────────── */}
        <section className="py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp className="text-center mb-16">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">Le réseau</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Tout ce dont un agent a besoin.<br />En un seul endroit.
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VALUE_PROPS.map((v, i) => (
                <FadeUp key={v.title} delay={i * 0.1}>
                  <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <v.icon size={26} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-3">{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features list ─────────────────────────────────────────────── */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <FadeUp>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">Ce qui est inclus</p>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Un accès professionnel à la plateforme WeHome.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Lors de l'activation de votre compte, vous bénéficiez immédiatement de toute l'infrastructure WeHome — données, visibilité, et outils de suivi.
                </p>
                <Link
                  href="/espace-agent/inscription"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  Rejoindre le réseau
                  <ArrowRight size={16} />
                </Link>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="space-y-3">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                      className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3.5"
                    >
                      <CheckCircle2 size={18} className="text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-24" style={{ background: "#0f0709" }}>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <FadeUp>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-5">
                Prêt à rejoindre le réseau ?
              </h2>
              <p className="text-white/50 mb-10 text-lg">
                Soumettez votre demande en 3 minutes. Notre équipe l'examine et vous active sous 48h.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/espace-agent/inscription"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white hover:-translate-y-0.5 transition-all"
                  style={{ background: "#C0392B", boxShadow: "0 8px 32px rgba(192,57,43,0.4)" }}
                >
                  Créer mon compte <ArrowRight size={17} />
                </Link>
                <Link
                  href="/espace-agent/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold border text-white hover:bg-white/10 transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                >
                  Déjà partenaire ? Se connecter
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
