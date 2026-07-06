import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart2,
  UserCircle,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronRight,
  Loader2,
  Clock,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { portalSignOut } from "@/lib/agent-portal";
import { Logo } from "@/components/layout/Logo";

const NAV_ITEMS = [
  { href: "/espace-agent/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/espace-agent/dashboard/biens", icon: Building2, label: "Mes biens" },
  { href: "/espace-agent/dashboard/leads", icon: Users, label: "Mes leads" },
  { href: "/espace-agent/dashboard/performance", icon: BarChart2, label: "Performance" },
  { href: "/espace-agent/dashboard/profil", icon: UserCircle, label: "Mon profil" },
];

// ── Pending screen ────────────────────────────────────────────────────────────

function PendingScreen() {
  const { agent } = useAuth();
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock size={36} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">
          Accès en attente d'activation
        </h1>
        <p className="text-muted-foreground mb-2">
          Bonjour <strong>{agent?.prenom}</strong>, votre demande est en cours d'examen.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Notre équipe examine votre profil et vous contactera sous 48h pour activer votre accès.
          Vous recevrez un email à <strong>{agent?.email}</strong>.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          <Globe size={16} />
          Retour au site WeHome
        </a>
        <button
          onClick={() => portalSignOut().then(() => (window.location.href = "/espace-agent/login"))}
          className="block w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ── Suspended screen ──────────────────────────────────────────────────────────

function SuspendedScreen() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX size={36} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">Compte suspendu</h1>
        <p className="text-muted-foreground mb-8">
          Votre accès au portail a été suspendu. Contactez WeHome pour plus d'informations.
        </p>
        <a
          href={`https://wa.me/212653535156?text=${encodeURIComponent("Bonjour WeHome, mon accès agent partenaire a été suspendu. Pouvez-vous m'aider ?")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Contacter WeHome
        </a>
      </div>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PortalLayout({ children, title }: PortalLayoutProps) {
  const { user, agent, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    navigate("/espace-agent/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  // Check portal statut
  const statut = agent?.statut;
  if (statut === "pending") return <PendingScreen />;
  if (statut === "suspendu") return <SuspendedScreen />;

  const initials = agent
    ? `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "?");

  const displayName = agent ? `${agent.prenom} ${agent.nom}` : (user?.email ?? "");
  const agencyName = agent?.nom_agence ?? "Agent WeHome";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await portalSignOut();
      navigate("/espace-agent");
    } catch {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5 border-b border-border/60">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo height={30} />
        </Link>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary/70 mt-2">
          Espace Agent
        </p>
      </div>

      {/* Agent identity */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden"
          style={{ background: "#8B1A2E" }}
        >
          {agent?.photo_url ? (
            <img src={agent.photo_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{agencyName}</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            location === item.href ||
            (item.href !== "/espace-agent/dashboard" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-foreground/65 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon size={17} />
              {item.label}
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="px-3 pb-6 pt-4 border-t border-border/60 space-y-0.5">
        <a
          href="/"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/65 hover:bg-secondary hover:text-foreground transition-all"
        >
          <Globe size={17} />
          Voir le site public
        </a>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/65 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          {loggingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f5f3] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white border-r border-border flex-col h-screen sticky top-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-border z-50 flex flex-col shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-border sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <Logo height={26} />
          {title && (
            <span className="text-sm font-semibold text-foreground ml-auto mr-1">{title}</span>
          )}
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
