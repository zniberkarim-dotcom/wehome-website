import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchAgents } from "@/lib/data";

export default function AgentsPage() {
  const { t } = useTranslation();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Users size={28} className="text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t("agents.page_title")}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{t("agents.page_subtitle")}</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={36} className="animate-spin text-primary" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-20">
              <Users size={40} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground">{t("agents.no_agents")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, i) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/agents/${agent.slug ?? agent.id}`}>
                    <div className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <div className="aspect-[4/3] w-full bg-secondary relative overflow-hidden">
                        {agent.photo_url ? (
                          <img src={agent.photo_url} alt={`${agent.prenom} ${agent.nom}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-5xl font-display font-bold"
                            style={{ background: "linear-gradient(135deg, #8B1A2E 0%, #C0392B 100%)" }}>
                            {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                          {agent.prenom} {agent.nom}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{t("agents.wehome_agent")}</p>
                        {agent.specialites && agent.specialites.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {agent.specialites.slice(0, 3).map((s) => (
                              <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground/70">{s}</span>
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
      </main>
      <Footer />
    </div>
  );
}
