import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, Eye, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PortalLayout } from "@/components/espace-agent/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchPortalProperties, fetchPortalLeads, fetchPerformanceStats } from "@/lib/agent-portal";

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary font-bold">{payload[0].value}</p>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <Icon size={18} className="text-primary" />
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PortalPerformancePage() {
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

  // ── Build chart data ──────────────────────────────────────────────────────

  // Vues par bien (bar chart)
  const viewsData = properties
    .filter((p) => p.portal_statut === "actif")
    .slice(0, 8)
    .map((p) => ({
      name: (p.titre ?? `Bien ${p.id?.slice(0, 5)}`).slice(0, 20),
      vues: p.views_count ?? 0,
    }));

  // Leads par semaine (last 8 weeks)
  const leadsPerWeek: Record<string, number> = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = `S${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("fr-MA", { month: "short" })}`;
    leadsPerWeek[key] = 0;
  }
  leads.forEach((l) => {
    const d = new Date(l.created_at);
    const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (daysAgo <= 56) {
      const weekKey = Object.keys(leadsPerWeek)[7 - Math.floor(daysAgo / 7)];
      if (weekKey) leadsPerWeek[weekKey] = (leadsPerWeek[weekKey] ?? 0) + 1;
    }
  });
  const leadsData = Object.entries(leadsPerWeek).map(([week, count]) => ({ week, leads: count }));

  const hasData = properties.length > 0;
  const hasChartData = viewsData.some((d) => d.vues > 0) || leads.length > 0;

  // Per-property table
  const propStats = properties.map((p) => {
    const propLeads = leads.filter((l) => l.property_reference === p.reference);
    const views = p.views_count ?? 0;
    const daysOnline = p.created_at
      ? Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)
      : 0;
    return {
      id: p.id,
      titre: p.titre ?? "Sans titre",
      reference: (p as { reference?: string }).reference ?? "—",
      views,
      leadsCount: propLeads.length,
      taux: views > 0 ? `${Math.round((propLeads.length / views) * 100)}%` : "—",
      jours: daysOnline,
      statut: p.portal_statut ?? "actif",
    };
  });

  const STATUS_LABELS: Record<string, string> = {
    actif: "Publié",
    en_attente_validation: "En attente",
    rejeté: "Rejeté",
    archivé: "Archivé",
  };

  return (
    <PortalLayout title="Performance">
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Suivi de vos biens, vues et contacts.
          </p>
        </motion.div>

        {!hasData ? (
          <div className="bg-white border-2 border-dashed border-border rounded-3xl py-24 text-center">
            <BarChart2 size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-display font-bold text-foreground mb-2">
              Pas encore de données
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Publiez votre premier bien pour commencer à voir vos statistiques de performance.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={Building2}
                label="Biens actifs"
                value={stats?.biensActifs ?? 0}
                sub="Publiés sur wehome.ma"
                delay={0.05}
              />
              <KpiCard
                icon={Users}
                label="Total leads"
                value={stats?.totalLeads ?? 0}
                sub="Contacts reçus"
                delay={0.1}
              />
              <KpiCard
                icon={Eye}
                label="Vues totales"
                value={stats?.totalViews ?? 0}
                sub="Visites de vos annonces"
                delay={0.15}
              />
              <KpiCard
                icon={TrendingUp}
                label="Taux de contact"
                value={stats ? `${stats.conversionRate}%` : "—"}
                sub="Leads / Vues"
                delay={0.2}
              />
            </div>

            {hasChartData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vues par bien */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white border border-border rounded-2xl p-5"
                >
                  <h2 className="text-sm font-display font-bold text-foreground mb-5 uppercase tracking-wide">
                    Vues par bien
                  </h2>
                  {viewsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={viewsData}
                        margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          angle={-35}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="vues" radius={[6, 6, 0, 0]}>
                          {viewsData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "#C0392B" : "#e8b4b0"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Le suivi des vues sera disponible prochainement.
                    </div>
                  )}
                </motion.div>

                {/* Leads par semaine */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-border rounded-2xl p-5"
                >
                  <h2 className="text-sm font-display font-bold text-foreground mb-5 uppercase tracking-wide">
                    Leads par semaine
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={leadsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="leads"
                        stroke="#C0392B"
                        strokeWidth={2.5}
                        dot={{ fill: "#C0392B", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <TrendingUp size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">Graphiques en attente</p>
                <p className="text-xs text-muted-foreground">
                  Les données apparaîtront dès que vos biens seront actifs et reçoivent des visites.
                </p>
              </div>
            )}

            {/* Per-property table */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wide">
                  Détail par bien
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Bien
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Vues
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Leads
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Taux
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Jours
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {propStats.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground truncate max-w-[180px]">
                            {p.titre}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.reference}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground">
                          {p.views}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground">
                          {p.leadsCount}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.taux}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.jours}j</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {STATUS_LABELS[p.statut] ?? p.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
