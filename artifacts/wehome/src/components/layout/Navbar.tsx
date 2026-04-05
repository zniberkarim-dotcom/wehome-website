import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappVendre = `https://wa.me/212653535156?text=${encodeURIComponent("Bonjour WeHome,\n\nJe souhaite vendre mon bien immobilier.\n\nPouvez-vous me contacter pour en discuter ?\n\nMerci !")}`;

  const navLinks = [
    { name: "Acheter", href: "/acheter" },
    { name: "Louer", href: "/louer" },
    { name: "Vendre", href: whatsappVendre, external: true },
    { name: "A Propos", href: "/a-propos" },
    { name: "Contact", href: "/contact" },
  ];

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
          <Link href="/" className="z-50 relative">
            <Logo height={36} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
            
            <a
              href={whatsappVendre}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full font-semibold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Publier votre bien
            </a>
          </nav>

          <button
            className="md:hidden p-2 text-foreground z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 w-full h-screen bg-background border-b border-border/50 shadow-2xl md:hidden pt-24 px-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
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
            ))}
            <a
              href={whatsappVendre}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 px-6 py-4 rounded-xl font-bold text-center bg-primary text-primary-foreground shadow-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publier votre bien
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
