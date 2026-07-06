import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchAgentProperties, updateAgentProperty, deleteAgentProperty } from "@/lib/data";
import type { AgentProperty } from "@/lib/data";

export default function DashboardPropertiesPage() {
  const { agent } = useAuth();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["my-properties", agent?.id],
    queryFn: () => fetchAgentProperties(agent!.id),
    enabled: !!agent?.id,
  });

  const handleToggle = async (p: AgentProperty) => {
    if (!agent) return;
    setTogglingId(p.id);
    try {
      await updateAgentProperty(p.id, agent.id, { actif: !p.actif });
      qc.invalidateQueries({ queryKey: ["my-properties", agent.id] });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (p: AgentProperty) => {
    if (!agent || !confirm(`Supprimer "${p.titre ?? "ce bien"}" ?`)) return;
    setDeletingId(p.id);
    try {
      await deleteAgentProperty(p.id, agent.id);
      qc.invalidateQueries({ queryKey: ["my-properties", agent.id] });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Mes Propriétés">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Mes Propriétés</h1>
            <p className="text-muted-foreground mt-1">
              {properties.length} bien{properties.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          <Link href="/dashboard/proprietes/new">
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
              <Plus size={18} />
              Ajouter
            </button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card border border-dashed border-border rounded-2xl"
          >
            <Building2 size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-bold text-foreground mb-2">Aucun bien encore</p>
            <p className="text-muted-foreground text-sm mb-6">
              Commencez par ajouter votre premier bien.
            </p>
            <Link href="/dashboard/proprietes/new">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm">
                <Plus size={18} />
                Ajouter un bien
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bien
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Prix
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {properties.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary shrink-0">
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
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                              {p.titre ?? "Sans titre"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {p.adresse ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm font-semibold text-foreground">
                          {p.prix ? `${Number(p.prix).toLocaleString("fr-FR")} MAD` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground/70 font-medium">
                          {p.type ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggle(p)}
                          disabled={togglingId === p.id}
                          className="flex items-center gap-1.5"
                        >
                          {togglingId === p.id ? (
                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                          ) : p.actif !== false ? (
                            <ToggleRight size={20} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={20} className="text-muted-foreground" />
                          )}
                          <span
                            className={`text-xs font-semibold ${p.actif !== false ? "text-green-700" : "text-muted-foreground"}`}
                          >
                            {p.actif !== false ? "Actif" : "Inactif"}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/bien/${p.id}`}
                            target="_blank"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye size={16} />
                          </a>
                          <Link href={`/dashboard/proprietes/${p.id}`}>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
