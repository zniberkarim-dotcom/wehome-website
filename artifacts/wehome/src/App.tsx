import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "@/context/AuthContext";
import "@/lib/i18n"; // initialise i18next (FR/EN/ZH) — must run before any t() call
import HomePage from "@/pages/home";
import BiensPage from "@/pages/biens";
import BienPage from "@/pages/bien";
import NetworkPage from "@/pages/network";
import NotFound from "@/pages/not-found";
// Auth
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
// Dashboard
import DashboardIndexPage from "@/pages/dashboard/index";
import DashboardProfilePage from "@/pages/dashboard/profile";
import DashboardPropertiesPage from "@/pages/dashboard/proprietes/index";
import DashboardPropertyEditPage from "@/pages/dashboard/proprietes/edit";
// Public agent pages
import AgentsPage from "@/pages/agents/index";
import AgentProfilePage from "@/pages/agents/slug";
import AProposPage from "@/pages/a-propos";
import EstimerPage from "@/pages/estimer";
import FinancementPage from "@/pages/financement";
import FavorisPage from "@/pages/favoris";
import PublierPage from "@/pages/publier";
import PartenairesPage from "@/pages/partenaires";
import ContactPage from "@/pages/contact";
// Legal
import MentionsLegalesPage from "@/pages/legal/mentions-legales";
import ConditionsPage from "@/pages/legal/conditions";
import ConfidentialitePage from "@/pages/legal/confidentialite";
import CookiesPage from "@/pages/legal/cookies";
// Espace Agent portal
import EspaceAgentPage from "@/pages/espace-agent/index";
import PortalLoginPage from "@/pages/espace-agent/login";
import PortalInscriptionPage from "@/pages/espace-agent/inscription";
import PortalDashboardHome from "@/pages/espace-agent/dashboard/index";
import PortalBiensPage from "@/pages/espace-agent/dashboard/biens";
import PortalLeadsPage from "@/pages/espace-agent/dashboard/leads";
import PortalPerformancePage from "@/pages/espace-agent/dashboard/performance";
import PortalProfilPage from "@/pages/espace-agent/dashboard/profil";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/** Listens to Supabase Realtime and refreshes property queries automatically */
function RealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("properties-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => {
          qc.invalidateQueries({ queryKey: ["properties"] });
          qc.invalidateQueries({ queryKey: ["featured-properties"] });
          qc.invalidateQueries({ queryKey: ["property"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return null;
}

function RedirectTo({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(to, { replace: true }); }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public site */}
      <Route path="/" component={HomePage} />
      <Route path="/biens" component={BiensPage} />
      <Route path="/acheter">{() => <RedirectTo to="/biens?transaction=Vente" />}</Route>
      <Route path="/louer">{() => <RedirectTo to="/biens?transaction=Location" />}</Route>
      <Route path="/bien/:id" component={BienPage} />
      <Route path="/network" component={NetworkPage} />
      <Route path="/a-propos" component={AProposPage} />
      <Route path="/estimer" component={EstimerPage} />
      <Route path="/financement" component={FinancementPage} />
      <Route path="/favoris" component={FavorisPage} />
      <Route path="/partenaires" component={PartenairesPage} />

      {/* Legal */}
      <Route path="/mentions-legales" component={MentionsLegalesPage} />
      <Route path="/conditions" component={ConditionsPage} />
      <Route path="/confidentialite" component={ConfidentialitePage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/contact" component={ContactPage} />

      {/* Espace Agent portal */}
      <Route path="/espace-agent" component={EspaceAgentPage} />
      <Route path="/espace-agent/login" component={PortalLoginPage} />
      <Route path="/espace-agent/inscription" component={PortalInscriptionPage} />
      <Route path="/espace-agent/dashboard" component={PortalDashboardHome} />
      <Route path="/espace-agent/dashboard/biens" component={PortalBiensPage} />
      <Route path="/espace-agent/dashboard/leads" component={PortalLeadsPage} />
      <Route path="/espace-agent/dashboard/performance" component={PortalPerformancePage} />
      <Route path="/espace-agent/dashboard/profil" component={PortalProfilPage} />
      <Route path="/publier" component={PublierPage} />
      <Route path="/vendre" component={PublierPage} />

      {/* Agent directory (public) */}
      <Route path="/agents" component={AgentsPage} />
      <Route path="/agents/:slug" component={AgentProfilePage} />

      {/* Auth */}
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/signup" component={SignupPage} />

      {/* Dashboard (protected — each page checks auth internally) */}
      <Route path="/dashboard" component={DashboardIndexPage} />
      <Route path="/dashboard/agent" component={DashboardProfilePage} />
      <Route path="/dashboard/proprietes" component={DashboardPropertiesPage} />
      <Route path="/dashboard/proprietes/:id" component={DashboardPropertyEditPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <RealtimeSync />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
