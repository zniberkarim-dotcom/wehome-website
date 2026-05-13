import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-foreground py-16 lg:py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="space-y-6">
            <Link href="/">
              <Logo height={36} className="brightness-0 invert" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              WeHome construit l'infrastructure immobilière transparente du Maroc — données de marché, biens vérifiés, accompagnement expert, réseau national.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/wehomeagency?igsh=ZDF5MTZ6ZzM3YXly" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
            <a href="https://www.instagram.com/wehomeagency?igsh=ZDF5MTZ6ZzM3YXly" target="_blank" rel="noopener noreferrer" className="text-white/40 text-sm font-medium hover:text-primary transition-colors">@wehomeagency</a>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Liens Rapides</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/acheter" className="hover:text-primary transition-colors">Acheter un bien</Link></li>
              <li><Link href="/louer" className="hover:text-primary transition-colors">Louer un bien</Link></li>
              <li><Link href="/publier" className="hover:text-primary transition-colors">Vendre votre bien</Link></li>
              <li><Link href="/estimer" className="hover:text-primary transition-colors">Estimer mon bien</Link></li>
              <li><Link href="/financement" className="hover:text-primary transition-colors">Calculateur de financement</Link></li>
              <li><Link href="/agents" className="hover:text-primary transition-colors">Trouver un agent</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/a-propos" className="hover:text-primary transition-colors">À Propos</Link></li>
              <li><Link href="/network" className="hover:text-primary transition-colors">Rejoindre le Network</Link></li>
              <li><Link href="/media" className="hover:text-primary transition-colors">Média & Contenu</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Informations</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/conditions" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Politique des cookies</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Contactez-nous</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Boulevard Mohammed V<br />Casablanca, Maroc</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-primary shrink-0" />
                <a href="https://wa.me/212653535156" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+212 6 53 53 51 56</a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-primary shrink-0" />
                <span>contact@wehome.ma</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} WeHome — La plateforme immobilière du Maroc. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
