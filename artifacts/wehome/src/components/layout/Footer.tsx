import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-foreground-foreground py-16 lg:py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-display font-bold text-3xl tracking-tight text-white">
                We
              </span>
              <span className="font-display font-bold text-3xl tracking-tight text-primary">
                Home
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              We are not just a real estate agency. We are a hybrid ecosystem combining Real Estate, Marketing, Lead Generation, and Media.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
            <p className="text-white/40 text-sm font-medium">@wehomeagency</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/buy" className="hover:text-primary transition-colors">Buy a Property</Link></li>
              <li><Link href="/rent" className="hover:text-primary transition-colors">Rent a Property</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">Sell your Property</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/media" className="hover:text-primary transition-colors">Media & Content</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Agent Directory</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>1234 Rue de la Montagne<br />Montreal, QC H3G 1Z1</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+1 (514) 555-0198</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-primary shrink-0" />
                <span>hello@wehome.agency</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} WeHome Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
