import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  BarChart2,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PortalLayout } from "@/components/espace-agent/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchPortalProperties, fetchPortalLeads, fetchPerformanceStats } from "@/lib/agent-portal";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="bg-white border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <Icon size={18} className={color} />
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function PortalDashboardHome() {
  const { agent } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["portal-properties", agent?.id],
    queryFn: () => fetchPortalProperties(agent!.id),
    enabled: !!agent?.id,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["portal-leads", agent?.id],
    queryFn: () => fetchPortalLeads(agent!.id),
    enabled: !!agent?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["portal-stats", agent?.id],
    queryFn: () => fetchPerformanceStats(agent!.id),
    enabled: !!agent?.id,
  });

  const today = new Date().toLocaleDateString("fr-MA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeProps = properties.filter((p) => p.portal_statut === "actif");
  const pendingProps = properties.filter((p) => p.portal_statut === "en_attente_validation");
  const limit = agent?.listings_limit ?? 5;

  // Activity feed (last 5 events from leads + properties)
  const activities: Array<{
    id: string;
    icon: React.ElementType;
    text: string;
    time: string;
    color: string;
  }> = [];

  leads.slice(0, 3).forEach((l) => {
    activities.push({
      id: `lead-${l.id}`,
      icon: Users,
      text: `Nouveau lead sur ${l.property_reference ?? "un bien"}`,
      time: new Date(l.created_at).toLocaleDateString("fr-MA"),
      color: "text-blue-500",
    });
  });

  properties.slice(0, 2).forEach((p) => {
    activities.push({
      id: `prop-${p.id}`,
      icon:
        p.portal_statut === "actif"
          ? CheckCircle2
          : p.portal_statut === "en_attente_validation"
            ? Clock
            : Building2,
      text:
        p.portal_statut === "actif"
          ? `Bien "${p.titre ?? p.id}" publié sur wehome.ma`
          : `Bien "${p.titre ?? p.id}" en attente de validation`,
      time: p.created_at ? new Date(p.created_at).toLocaleDateString("fr-MA") : "—",
      color: p.portal_statut === "actif" ? "text-green-500" : "text-amber-500",
    });
  });

  activities.sort((a, b) => 0); // keep insertion order for now

  return (
    <PortalLayout title="Tableau de bord">
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Bonjour, {agent?.prenom ?? "Agent"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 capitalize">{today}</p>
          {agent?.nom_agence && (
            <p className="text-sm text-muted-foreground mt-0.5">{agent.nom_agence}</p>
          )}
        </motion.div>

        {/* Pending validation alert */}
        {pendingProps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {pendingProps.length} bien{pendingProps.length > 1 ? "s" : ""} en attente de
                validation WeHome
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Notre équipe examine vos listings sous 48h.
              </p>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Building2}
            label="Biens actifs"
            value={`${activeProps.length} / ${limit}`}
            sub="Votre quota du plan"
            color="text-primary"
            delay={0.05}
          />
          <KpiCard
            icon={Users}
            label="Leads ce mois"
            value={stats?.leadsThisMonth ?? 0}
            sub="Contacts acheteurs"
            color="text-blue-500"
            delay={0.1}
          />
          <KpiCard
            icon={Eye}
            label="Vues totales"
            value={stats?.totalViews ?? 0}
            sub="Toutes les annonces"
            color="text-purple-500"
            delay={0.15}
          />
          <KpiCard
            icon={BarChart2}
            label="Taux de contact"
            value={stats ? `${stats.conversionRate}%` : "—"}
            sub="Leads / Vues"
            color="text-green-500"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1 space-y-3"
          >
            <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wide">
              Actions rapides
            </h2>
            <Link href="/espace-agent/dashboard/biens">
              <div className="flex items-center gap-4 p-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-colors cursor-pointer shadow-md shadow-primary/20">
                <Plus size={22} className="shrink-0" />
                <div>
                  <p className="font-semibold">Publier un bien</p>
                  <p className="text-white/70 text-xs">Soumettre un nouveau listing</p>
                </div>
              </div>
            </Link>
            <Link href="/espace-agent/dashboard/leads">
              <div className="flex items-center gap-4 p-4 bg-white border border-border rounded-2xl hover:border-primary/30 transition-colors cursor-pointer">
                <Users size={22} className="text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Voir mes leads</p>
                  <p className="text-muted-foreground text-xs">
                    {leads.length} contact{leads.length !== 1 ? "s" : ""} total
                  </p>
                </div>
              </div>
            </Link>
            <Link href={agent?.slug ? `/agents/${agent.slug}` : "/agents"}>
              <div className="flex items-center gap-4 p-4 bg-white border border-border rounded-2xl hover:border-primary/30 transition-colors cursor-pointer">
                <Eye size={22} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Mon profil public</p>
                  <p className="text-muted-foreground text-xs">Voir comme un acheteur</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white border border-border rounded-2xl p-5"
          >
            <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wide mb-4">
              Activité récente
            </h2>
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <Building2 size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Publiez votre premier bien pour voir l'activité.
                </p>
                <Link
                  href="/espace-agent/dashboard/biens"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary font-semibold hover:underline"
                >
                  <Plus size={14} />
                  Ajouter un bien
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <a.icon size={16} className={`${a.color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent properties */}
        {properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wide">
                Derniers biens
              </h2>
              <Link
                href="/espace-agent/dashboard/biens"
                className="text-xs text-primary font-semibold hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            <div className="space-y-2">
              {properties.slice(0, 4).map((p) => {
                const statusColors: Record<string, string> = {
                  actif: "bg-green-100 text-green-700",
                  en_attente_validation: "bg-amber-100 text-amber-700",
                  rejeté: "bg-red-100 text-red-700",
                  archivé: "bg-gray-100 text-gray-600",
                };
                const statusLabels: Record<string, string> = {
                  actif: "Publié",
                  en_attente_validation: "En attente",
                  rejeté: "Rejeté",
                  archivé: "Archivé",
                };
                const st = p.portal_statut ?? "actif";
                return (
                  <Link key={p.id} href="/espace-agent/dashboard/biens">
                    <div className="flex items-center gap-4 bg-white border border-border rounded-xl p-3.5 hover:border-primary/30 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-muted shrink-0 overflow-hidden">
                        {p.photo_principale ? (
                          <img
                            src={p.photo_principale}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={18} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {p.titre ?? "Sans titre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.adresse ?? p.ville ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColors[st] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {statusLabels[st] ?? st}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
