import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-foreground py-16 lg:py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          <div className="space-y-6">
            <Link href="/">
              <Logo height={36} className="brightness-0 invert" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">{t("footer.tagline")}</p>
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
            <h4 className="font-display font-semibold text-lg text-white mb-6">{t("footer.quick_links")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/acheter" className="hover:text-primary transition-colors">{t("footer.buy_property")}</Link></li>
              <li><Link href="/louer" className="hover:text-primary transition-colors">{t("footer.rent_property")}</Link></li>
              <li><Link href="/publier" className="hover:text-primary transition-colors">{t("footer.sell_property")}</Link></li>
              <li><Link href="/estimer" className="hover:text-primary transition-colors">{t("footer.estimate_property")}</Link></li>
              <li><Link href="/financement" className="hover:text-primary transition-colors">{t("footer.financing_calc")}</Link></li>
              <li><Link href="/agents" className="hover:text-primary transition-colors">{t("footer.find_agent")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("footer.contact")}</Link></li>
              <li><Link href="/a-propos" className="hover:text-primary transition-colors">{t("footer.about")}</Link></li>
              <li><Link href="/network" className="hover:text-primary transition-colors">{t("footer.join_network")}</Link></li>
              <li><Link href="/media" className="hover:text-primary transition-colors">{t("footer.media")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">{t("footer.info")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/conditions" className="hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              <li><Link href="/confidentialite" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">{t("footer.cookies")}</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-primary transition-colors">{t("footer.legal_notice")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">{t("footer.contact_us")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>{t("footer.address_line1")}<br />{t("footer.address_line2")}</span>
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
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
