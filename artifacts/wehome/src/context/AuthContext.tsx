import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Agent } from "@/lib/data";

export interface AuthState {
  user: User | null;
  session: Session | null;
  agent: Agent | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  agent: null,
  loading: true,
});

/** Parse the stored Supabase session from localStorage — no lock required. */
function getStoredSession(): { user: User | null; session: Session | null } {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const ref = url.replace("https://", "").split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return { user: null, session: null };
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expires_at && parsed.expires_at * 1000 < Date.now()) {
      return { user: null, session: null };
    }
    return { user: parsed.user ?? null, session: parsed };
  } catch {
    return { user: null, session: null };
  }
}

/** Fetch the agent row directly via REST API — bypasses the Supabase JS lock entirely. */
async function fetchAgentByUserIdDirect(
  userId: string,
  accessToken: string
): Promise<Agent | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/agents?user_id=eq.${userId}&select=*&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const rows: Agent[] = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: storedUser, session: storedSession } = getStoredSession();

  const [state, setState] = useState<AuthState>({
    user: storedUser,
    session: storedSession,
    agent: null,
    // Only show loading spinner if there's a user whose agent row we still need to fetch
    loading: storedUser !== null,
  });

  useEffect(() => {
    let cancelled = false;

    // Immediately fetch the agent for the stored user — no Supabase client lock involved
    if (storedUser && storedSession?.access_token) {
      fetchAgentByUserIdDirect(storedUser.id, storedSession.access_token).then(
        (agent) => {
          if (!cancelled) setState((s) => ({ ...s, agent, loading: false }));
        }
      ).catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      });
    } else if (!storedUser) {
      // No stored session — immediately mark as not loading
      setState((s) => ({ ...s, loading: false }));
    }

    // Hard fallback: if lock contention or network errors keep us stuck, unblock after 2s
    const loadingFallback = setTimeout(() => {
      if (!cancelled) setState((s) => (s.loading ? { ...s, loading: false } : s));
    }, 2000);

    // Still register onAuthStateChange to handle sign-in / sign-out / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      const agent =
        user && session?.access_token
          ? await fetchAgentByUserIdDirect(user.id, session.access_token).catch(() => null)
          : null;
      if (!cancelled)
        setState({ user, session, agent, loading: false });
    });

    return () => {
      cancelled = true;
      clearTimeout(loadingFallback);
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
