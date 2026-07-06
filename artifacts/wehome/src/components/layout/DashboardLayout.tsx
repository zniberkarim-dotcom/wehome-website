import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Building2,
  Globe,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authSignOut } from "@/lib/auth";
import { Logo } from "./Logo";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/agent", icon: User, label: "Mon Profil" },
  { href: "/dashboard/proprietes", icon: Building2, label: "Mes Propriétés" },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, agent, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth/login");
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authSignOut();
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const initials = agent
    ? `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase()
    : (user.email?.charAt(0).toUpperCase() ?? "?");
  const displayName = agent ? `${agent.prenom} ${agent.nom}` : (user.email ?? "");

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      <div className="p-6 border-b border-border/60">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo height={32} />
        </Link>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
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
          <p className="text-xs text-muted-foreground">Agent WeHome</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            location === item.href ||
            (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-6 space-y-1 border-t border-border/60 pt-4">
        <a
          href="/"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
        >
          <Globe size={18} />
          Voir le site
        </a>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-card border-r border-border flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-4 px-4 py-4 bg-card border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <Logo height={28} />
          {title && <span className="text-sm font-semibold text-foreground ml-auto">{title}</span>}
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
