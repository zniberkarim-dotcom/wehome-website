// Re-export from the singleton AuthContext so every component shares
// the same auth state without creating duplicate Supabase listeners.
export { useAuth } from "@/context/AuthContext";
export type { AuthState } from "@/context/AuthContext";
