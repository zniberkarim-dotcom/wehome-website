import { supabase } from "./supabase";

function generateSlug(prenom: string, nom: string): string {
  return `${prenom}-${nom}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function authSignUp(
  email: string,
  password: string,
  nom: string,
  prenom: string
) {
  const slug = generateSlug(prenom, nom);
  // Pass nom/prenom/slug as user metadata so the DB trigger can create the agent row.
  // This works regardless of whether email confirmation is enabled or disabled.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nom, prenom, slug },
    },
  });
  if (error) throw error;

  // If the session is immediately available (email confirmation disabled),
  // the trigger may not be set up yet — fall back to a direct insert.
  if (data.session && data.user) {
    const { error: agentError } = await supabase.from("agents").upsert(
      { user_id: data.user.id, email, nom, prenom, slug, actif: true },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
    // Silently ignore — trigger may have already created the row
    void agentError;
  }

  return data;
}

export async function authSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function authSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
