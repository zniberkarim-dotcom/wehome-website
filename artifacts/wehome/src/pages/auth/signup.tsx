import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { authSignUp } from "@/lib/auth";
import { Logo } from "@/components/layout/Logo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPwd) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await authSignUp(email, password, nom, prenom);
      // If a session is immediately available (email confirmation disabled), go straight to dashboard
      if (data.session) {
        navigate("/dashboard");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Logo height={40} className="mx-auto mb-6" />
          <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Vérifiez votre email</h2>
            <p className="text-muted-foreground text-sm">
              Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
              Cliquez sur le lien pour activer votre compte.
            </p>
            <Link href="/auth/login" className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/"><Logo height={40} className="mx-auto mb-6" /></Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Créer un compte Agent</h1>
          <p className="text-muted-foreground mt-1">Rejoignez le réseau WeHome</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Prénom</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Karim"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Nom</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Zniberi"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@wehome.ma"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wider">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type={showPwd ? "text" : "password"} required value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/40 border border-border/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary transition-colors">← Retour au site</Link>
        </p>
      </motion.div>
    </div>
  );
}
