import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const agentMenuRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { agent, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close agent dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target as Node)) {
        setAgentMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setAgentMenuOpen(false);
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  const whatsappVendre = `https://wa.me/212653535156?text=${encodeURIComponent("Bonjour WeHome,\n\nJe souhaite vendre mon bien immobilier.\n\nPouvez-vous me contacter pour en discuter ?\n\nMerci !")}`;

  const navLinks = [
    { name: "Acheter", href: "/acheter" },
    { name: "Louer", href: "/louer" },
    { name: "Vendre", href: whatsappVendre, external: true },
    { name: "Agents", href: "/agents" },
    { name: "Network", href: "/network" },
    { name: "Contact", href: "/contact" },
    { name: "À Propos", href: "/a-propos" },
  ];

  // Shared text styles for scrolled vs transparent nav
  const linkClass = cn(
    "text-sm font-medium transition-colors duration-200",
    isScrolled
      ? "text-foreground/80 hover:text-primary"
      : "text-[rgba(255,255,255,0.92)] hover:text-white"
  );
  const linkStyle = !isScrolled ? { textShadow: "0 1px 4px rgba(0,0,0,0.35)" } : undefined;

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-border/50 shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="z-50 relative">
            <Logo
              height={36}
              className={!isScrolled ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" : ""}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Nav links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    style={linkStyle}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link key={link.name} href={link.href} className={linkClass} style={linkStyle}>
                    {link.name}
                  </Link>
                )
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <Link
                href="/estimer"
                className={cn(
                  "px-5 py-2.5 rounded-full font-semibold text-sm border transition-all duration-200 hover:-translate-y-0.5",
                  isScrolled
                    ? "border-primary text-primary hover:bg-primary/5"
                    : "border-white/60 text-white hover:bg-white/10"
                )}
              >
                Estimer mon bien
              </Link>
              <a
                href={whatsappVendre}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full font-semibold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Publier votre bien
              </a>
            </div>

            {/* Agent zone — separator + auth */}
            <div
              className={cn(
                "flex items-center pl-4",
                isScrolled ? "border-l border-border/40" : "border-l border-white/20"
              )}
            >
              {loading ? null : agent ? (
                /* ── Logged-in state: dropdown ── */
                <div className="relative" ref={agentMenuRef}>
                  <button
                    onClick={() => setAgentMenuOpen((o) => !o)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 rounded-lg px-2.5 py-1.5",
                      isScrolled
                        ? "text-foreground/75 hover:text-primary hover:bg-primary/5"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                    )}
                    style={linkStyle}
                  >
                    {/* Avatar or initials */}
                    {agent.photo_url ? (
                      <img
                        src={agent.photo_url}
                        alt={agent.prenom}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: "#8B1A2E" }}
                      >
                        {agent.prenom?.[0]}{agent.nom?.[0]}
                      </span>
                    )}
                    <span>{agent.prenom}</span>
                    <ChevronDown
                      size={13}
                      className={cn("transition-transform duration-200", agentMenuOpen && "rotate-180")}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {agentMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-border/60 shadow-xl overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-border/40 bg-secondary/30">
                          <p className="text-xs text-muted-foreground font-medium">Connecté en tant que</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                            {agent.prenom} {agent.nom}
                          </p>
                        </div>
                        {/* Links */}
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setAgentMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-primary/70" />
                            Mon Dashboard
                          </Link>
                          <Link
                            href="/dashboard/proprietes"
                            onClick={() => setAgentMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <User size={15} className="text-primary/70" />
                            Mes propriétés
                          </Link>
                        </div>
                        <div className="border-t border-border/40 py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <LogOut size={15} />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Logged-out state: discrete link ── */
                <Link
                  href="/auth/login"
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
                    isScrolled
                      ? "text-foreground/55 hover:text-primary"
                      : "text-white/70 hover:text-white"
                  )}
                  style={linkStyle}
                >
                  <LogIn size={14} />
                  <span>Espace agent</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-foreground z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 w-full h-screen bg-background border-b border-border/50 shadow-2xl md:hidden pt-24 px-4 flex flex-col gap-4 overflow-y-auto"
          >
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-display font-semibold text-foreground py-4 border-b border-border/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-display font-semibold text-foreground py-4 border-b border-border/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}

            <Link
              href="/estimer"
              className="mt-4 px-6 py-4 rounded-xl font-bold text-center border-2 border-primary text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Estimer mon bien
            </Link>
            <a
              href={whatsappVendre}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl font-bold text-center bg-primary text-primary-foreground shadow-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publier votre bien
            </a>

            {/* Agent zone — mobile */}
            <div className="mt-2 border-t border-border/40 pt-4">
              {!loading && (
                agent ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                      {agent.photo_url ? (
                        <img src={agent.photo_url} alt={agent.prenom} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: "#8B1A2E" }}
                        >
                          {agent.prenom?.[0]}{agent.nom?.[0]}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{agent.prenom} {agent.nom}</p>
                        <p className="text-xs text-muted-foreground">Agent WeHome</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 py-3 text-base font-semibold text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Mon Dashboard
                    </Link>
                    <Link
                      href="/dashboard/proprietes"
                      className="flex items-center gap-2 py-3 text-base font-semibold text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      Mes propriétés
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 py-3 text-base font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 py-3 text-base font-semibold text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn size={18} />
                    Espace agent — Connexion
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
