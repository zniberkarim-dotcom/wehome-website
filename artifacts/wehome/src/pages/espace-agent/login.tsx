import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { portalSignIn, portalResetPassword } from "@/lib/agent-portal";

export default function PortalLoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await portalSignIn(email, password);
      navigate("/espace-agent/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Identifiants incorrects.";
      setError(msg.includes("Invalid login") ? "Email ou mot de passe incorrect." : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    try {
      await portalResetPassword(resetEmail);
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur.";
      setError(msg);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/espace-agent">
            <Logo height={36} className="mx-auto" />
          </Link>
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary/70 mt-2">
            Espace Agent
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
          {!showReset ? (
            <>
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">Se connecter</h1>
              <p className="text-muted-foreground text-sm mb-7">
                Accédez à votre tableau de bord agent.
              </p>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@agence.ma"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setResetEmail(email);
                    setError(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
                  style={{ background: "#C0392B", boxShadow: "0 4px 16px rgba(192,57,43,0.3)" }}
                >
                  {loading && <Loader2 size={17} className="animate-spin" />}
                  Se connecter
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setError(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground mb-5 flex items-center gap-1"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-display font-bold text-foreground mb-1">
                Mot de passe oublié
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="font-semibold text-foreground mb-1">Email envoyé</p>
                  <p className="text-sm text-muted-foreground">Vérifiez votre boîte mail.</p>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="votre@email.ma"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "#C0392B" }}
                  >
                    {resetLoading && <Loader2 size={17} className="animate-spin" />}
                    Envoyer le lien
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Pas encore partenaire ?{" "}
          <Link
            href="/espace-agent/inscription"
            className="text-primary font-semibold hover:underline"
          >
            Rejoindre le réseau →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
