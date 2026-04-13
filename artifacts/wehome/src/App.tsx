import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import HomePage from "@/pages/home";
import BiensPage from "@/pages/biens";
import BienPage from "@/pages/bien";
import NotFound from "@/pages/not-found";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/biens" component={BiensPage} />
      <Route path="/acheter" component={BiensPage} />
      <Route path="/louer" component={BiensPage} />
      <Route path="/bien/:id" component={BienPage} />
      <Route path="/vendre" component={HomePage} />
      <Route path="/a-propos" component={HomePage} />
      <Route path="/contact" component={HomePage} />
      <Route path="/publier" component={HomePage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <RealtimeSync />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
