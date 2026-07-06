import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, Mail, Loader2, Building2, ArrowLeft, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchAgentBySlug, fetchAgentProperties, mapSupabaseProperty } from "@/lib/data";
import { PropertyCard } from "@/components/home/PropertyCard";

export default function AgentProfilePage() {
  const { t } = useTranslation();
  const params = useParams<{ slug: string }>();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agent", params.slug],
    queryFn: () => fetchAgentBySlug(params.slug),
    enabled: !!params.slug,
  });

  const { data: agentProps = [], isLoading: propsLoading } = useQuery({
    queryKey: ["agent-properties", agent?.id],
    queryFn: () => fetchAgentProperties(agent!.id),
    enabled: !!agent?.id,
  });

  // Map to Property shape for PropertyCard — filter only active ones
  const properties = agentProps
    .filter((p) => p.actif !== false)
    .map((p, i) => mapSupabaseProperty(p as any, i));

  const whatsappUrl = agent?.telephone
    ? `https://wa.me/${agent.telephone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${agent.prenom}, je vous contacte via WeHome.`)}`
    : null;

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              {t("agents.agent_not_found")}
            </h1>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={18} />
              {t("agents.all_agents")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            {t("agents.all_agents")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 mb-10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary shrink-0">
                {agent.photo_url ? (
                  <img
                    src={agent.photo_url}
                    alt={`${agent.prenom} ${agent.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-display font-bold"
                    style={{ background: "#8B1A2E" }}
                  >
                    {agent.prenom.charAt(0)}
                    {agent.nom.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold text-foreground">
                  {agent.prenom} {agent.nom}
                </h1>
                <p className="text-primary font-semibold mt-1">{t("agents.wehome_agent")}</p>
                {agent.specialites && agent.specialites.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {agent.specialites.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {agent.bio && (
                  <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
                    {agent.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-5">
                  {agent.telephone && (
                    <a
                      href={`tel:${agent.telephone}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Phone size={16} />
                      {agent.telephone}
                    </a>
                  )}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-foreground text-foreground font-semibold text-sm hover:bg-foreground hover:text-background transition-colors"
                    >
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={`mailto:${agent.email}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors"
                  >
                    <Mail size={16} />
                    {t("agents.email")}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {t("agents.properties_of", { name: agent.prenom })}
                <span className="text-lg font-medium text-muted-foreground ml-3">
                  ({properties.length})
                </span>
              </h2>
              {properties.length > 0 && (
                <Link
                  href={`/biens?agent=${agent.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {t("agents.see_all")} <ExternalLink size={14} />
                </Link>
              )}
            </div>
            {propsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                <Building2 size={36} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">{t("agents.no_properties_yet")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property, i) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
