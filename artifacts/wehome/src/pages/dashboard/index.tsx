import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, User, Plus, Eye, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchAgentProperties } from "@/lib/data";

export default function DashboardIndexPage() {
  const { agent } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["my-properties", agent?.id],
    queryFn: () => fetchAgentProperties(agent!.id),
    enabled: !!agent?.id,
  });

  const actifCount = properties.filter((p) => p.actif !== false).length;
  const inactifCount = properties.filter((p) => p.actif === false).length;

  const stats = [
    { label: "Biens actifs", value: actifCount, icon: Building2, color: "text-primary" },
    { label: "Total biens", value: properties.length, icon: Eye, color: "text-blue-500" },
    { label: "Inactifs", value: inactifCount, icon: TrendingUp, color: "text-muted-foreground" },
  ];

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Bonjour, {agent?.prenom ?? "Agent"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos biens et votre profil depuis cet espace.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/proprietes/new">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="bg-primary text-white rounded-2xl p-6 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={24} className="mb-3" />
              <p className="font-display font-bold text-lg">Ajouter un bien</p>
              <p className="text-white/80 text-sm mt-1">Publier une nouvelle propriété</p>
            </motion.div>
          </Link>
          <Link href="/dashboard/agent">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <User size={24} className="mb-3 text-primary" />
              <p className="font-display font-bold text-lg text-foreground">Mon profil</p>
              <p className="text-muted-foreground text-sm mt-1">Modifier mes informations</p>
            </motion.div>
          </Link>
        </div>

        {properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground">Derniers biens</h2>
              <Link
                href="/dashboard/proprietes"
                className="text-sm text-primary font-semibold hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {properties.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/dashboard/proprietes/${p.id}`}>
                  <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {p.photo_principale ? (
                        <img
                          src={p.photo_principale}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {p.titre ?? "Sans titre"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{p.adresse ?? "—"}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.actif !== false ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {p.actif !== false ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
