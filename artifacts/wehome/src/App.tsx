import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "@/context/AuthContext";
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
      <Route path="/vendre" component={HomePage} />
      <Route path="/a-propos" component={HomePage} />
      <Route path="/contact" component={HomePage} />
      <Route path="/publier" component={HomePage} />

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
