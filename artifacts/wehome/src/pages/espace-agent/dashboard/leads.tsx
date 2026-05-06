import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Phone, Mail, ChevronDown, X, MessageSquare, Building2, Filter } from "lucide-react";
import { PortalLayout } from "@/components/espace-agent/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchPortalLeads, updateLeadStatut, type PortalLead } from "@/lib/agent-portal";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUT_OPTIONS = [
  { value: "nouveau",           label: "Nouveau",           color: "bg-blue-100 text-blue-700" },
  { value: "contacté",          label: "Contacté",          color: "bg-purple-100 text-purple-700" },
  { value: "visite_planifiée",  label: "Visite planifiée",  color: "bg-amber-100 text-amber-700" },
  { value: "sans_suite",        label: "Sans suite",        color: "bg-gray-100 text-gray-500" },
];

function StatutBadge({ statut }: { statut: string | undefined }) {
  const s = STATUT_OPTIONS.find((o) => o.value === statut) ?? STATUT_OPTIONS[0];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

// ── Lead detail panel ─────────────────────────────────────────────────────────

function LeadDetail({ lead, onClose, onStatusChange }: {
  lead: PortalLead;
  onClose: () => void;
  onStatusChange: (id: string, statut: PortalLead["statut_lead"]) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      className="bg-white border border-border rounded-2xl p-6 sticky top-24"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg text-foreground">Détail du lead</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Contact */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Contact</p>
          <p className="font-semibold text-foreground">{lead.name}</p>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Phone size={14} />
              {lead.phone}
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate">
              <Mail size={14} className="shrink-0" />
              {lead.email}
            </a>
          )}
        </div>

        {/* Property */}
        {lead.property_reference && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Bien ref:</span>
            <span className="font-semibold text-foreground">{lead.property_reference}</span>
          </div>
        )}

        {/* Message */}
        {lead.notes && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Message</p>
            <p className="text-sm text-foreground bg-muted/40 rounded-xl p-3 leading-relaxed">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          Reçu le {new Date(lead.created_at).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Status change */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Statut</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(lead.id, opt.value as PortalLead["statut_lead"])}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  lead.statut_lead === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${lead.name}, je suis ${""} de WeHome. Vous m'avez contacté au sujet du bien ${lead.property_reference ?? ""}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#25D366" }}
          >
            WhatsApp
          </a>
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
          >
            <Phone size={14} />
            Appeler
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PortalLeadsPage() {
  const { agent } = useAuth();
  const qc = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<PortalLead | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["portal-leads", agent?.id],
    queryFn: () => fetchPortalLeads(agent!.id),
    enabled: !!agent?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: PortalLead["statut_lead"] }) =>
      updateLeadStatut(id, statut),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-leads"] }),
  });

  function handleStatusChange(id: string, statut: PortalLead["statut_lead"]) {
    updateMutation.mutate({ id, statut });
    setSelectedLead((prev) => prev?.id === id ? { ...prev, statut_lead: statut } : prev);
  }

  const filtered = filterStatut === "all"
    ? leads
    : leads.filter((l) => (l.statut_lead ?? "nouveau") === filterStatut);

  const newCount = leads.filter((l) => !l.statut_lead || l.statut_lead === "nouveau").length;

  return (
    <PortalLayout title="Mes leads">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Mes leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {leads.length} contact{leads.length !== 1 ? "s" : ""} total
              {newCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                  {newCount}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          {[{ value: "all", label: "Tous" }, ...STATUT_OPTIONS].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatut(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatut === opt.value
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={`grid gap-5 ${selectedLead ? "lg:grid-cols-[1fr_340px]" : "grid-cols-1"}`}>
          {/* Leads list */}
          <div className="min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white border border-border rounded-2xl p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-border rounded-3xl py-20 text-center">
                <Users size={40} className="text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-display font-bold text-foreground mb-2">
                  {leads.length === 0 ? "Aucun lead pour l'instant" : "Aucun lead dans cette catégorie"}
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {leads.length === 0
                    ? "Les contacts acheteurs apparaîtront ici dès que vos biens seront publiés."
                    : "Changez le filtre pour voir d'autres leads."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((lead) => {
                  const isNew = !lead.statut_lead || lead.statut_lead === "nouveau";
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedLead(isSelected ? null : lead)}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary shadow-sm"
                          : isNew
                          ? "border-blue-200 hover:border-blue-300"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${isNew ? "" : "opacity-60"}`}
                          style={{ background: "#C0392B" }}>
                          {lead.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                            <StatutBadge statut={lead.statut_lead} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {lead.property_reference && <span>📍 {lead.property_reference} · </span>}
                            {new Date(lead.created_at).toLocaleDateString("fr-MA")}
                          </p>
                          {lead.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              <MessageSquare size={10} className="inline mr-1" />
                              {lead.notes}
                            </p>
                          )}
                        </div>

                        {/* Contact quick */}
                        <div className="flex items-center gap-2 shrink-0">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors">
                              <Phone size={15} />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <Mail size={15} />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedLead && (
              <LeadDetail
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onStatusChange={handleStatusChange}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </PortalLayout>
  );
}
