import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitLead } from "@/lib/data";

const whatsappContact = `https://wa.me/212653535156?text=${encodeURIComponent(
  "Bonjour WeHome,\n\nJ'aimerais avoir plus d'informations.\n\nMerci !"
)}`;

const SUBJECTS = [
  "Question générale",
  "Acheter un bien",
  "Louer un bien",
  "Vendre / publier mon bien",
  "Devenir agent partenaire",
  "Presse / partenariat",
  "Autre",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Question générale");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Merci de compléter tous les champs obligatoires.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Adresse email invalide.");
      return;
    }
    setLoading(true);
    try {
      await submitLead({
        name: name.trim(),
        phone: phone.trim() || "(non renseigné)",
        email: email.trim(),
        message: `[${subject}]\n\n${message.trim()}`,
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erreur : ${err.message}`
          : "Impossible d'envoyer votre message. Réessayez ou contactez-nous sur WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-br from-primary via-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white_0%,transparent_50%),radial-gradient(circle_at_80%_70%,white_0%,transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Parlons de votre projet
          </h1>
          <p className="text-lg md:text-xl mt-5 opacity-95 leading-relaxed max-w-2xl mx-auto">
            Une question, un projet, une opportunité ? Notre équipe vous répond sous 24 h ouvrées.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Message envoyé !
                  </h2>
                  <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
                    Merci pour votre message. Nous vous répondons sous 24 h ouvrées à l'adresse
                    indiquée.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setMessage("");
                      setSubject("Question générale");
                    }}
                    className="mt-6 px-6 py-2.5 rounded-full font-semibold text-sm border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Écrivez-nous
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tous les champs marqués d'un <span className="text-destructive">*</span> sont
                      obligatoires.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nom complet" required>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Karim Zniber"
                        className={inputCx}
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@email.com"
                        className={inputCx}
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Téléphone (optionnel)">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+212 6 53 53 51 56"
                        className={inputCx}
                      />
                    </Field>
                    <Field label="Sujet" required>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value as (typeof SUBJECTS)[number])}
                        className={inputCx}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Votre message" required>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre projet ou votre question…"
                      rows={6}
                      className={`${inputCx} resize-none`}
                    />
                  </Field>

                  {error && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-3 flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Coordonnées */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="font-display font-bold text-foreground text-lg">Nos coordonnées</h3>

                <InfoRow
                  icon={<Phone size={18} />}
                  title="Téléphone / WhatsApp"
                  body={
                    <a
                      href="tel:+212653535156"
                      className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      +212 6 53 53 51 56
                    </a>
                  }
                />
                <InfoRow
                  icon={<Mail size={18} />}
                  title="Email"
                  body={
                    <a
                      href="mailto:contact@wehome.ma"
                      className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      contact@wehome.ma
                    </a>
                  }
                />
                <InfoRow
                  icon={<MapPin size={18} />}
                  title="Adresse"
                  body={
                    <span className="text-sm text-foreground/80">
                      Boulevard Mohammed V<br />
                      Casablanca, Maroc
                    </span>
                  }
                />
                <InfoRow
                  icon={<Clock size={18} />}
                  title="Horaires"
                  body={
                    <span className="text-sm text-foreground/80">
                      Lundi – Samedi
                      <br />
                      9h – 19h
                    </span>
                  }
                />
              </div>

              <a
                href={whatsappContact}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[#25D366] text-white font-bold shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle size={20} />
                Discutons sur WhatsApp
              </a>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────────── */

const inputCx =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-foreground/75 mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="mt-0.5">{body}</div>
      </div>
    </div>
  );
}
