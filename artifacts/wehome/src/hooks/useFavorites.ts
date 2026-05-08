import { useCallback, useEffect, useSyncExternalStore } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * useFavorites — small store backed by localStorage with cross-tab sync.
 *
 * Stored as a JSON array of property IDs (strings).
 * Designed so we can later layer Supabase sync on top: when the user is
 * authenticated, push the localStorage set to a `favorites` table and merge
 * the remote set back. For now we keep it client-side only — works for
 * anonymous users and survives sessions.
 *
 * API:
 *   const { favoriteIds, count, isFavorite, toggleFavorite, clearAll } =
 *     useFavorites();
 * ────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "wehome_favorites_v1";
const EVENT_NAME = "wehome:favorites-changed";

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota or unavailable — silently ignore */
  }
  // Notify listeners in the same tab (storage event only fires cross-tab)
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

// Module-level snapshot cache so useSyncExternalStore stays stable
let cachedSnapshot: string[] = readStorage();
let cachedKey = JSON.stringify(cachedSnapshot);

function getSnapshot(): string[] {
  const fresh = readStorage();
  const key = JSON.stringify(fresh);
  if (key !== cachedKey) {
    cachedSnapshot = fresh;
    cachedKey = key;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): string[] {
  return [];
}

export function useFavorites() {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep cache fresh on mount in case localStorage was written before component subscribed
  useEffect(() => {
    cachedSnapshot = readStorage();
    cachedKey = JSON.stringify(cachedSnapshot);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((id: string) => {
    const current = readStorage();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current];
    writeStorage(next);
  }, []);

  const addFavorite = useCallback((id: string) => {
    const current = readStorage();
    if (current.includes(id)) return;
    writeStorage([id, ...current]);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const current = readStorage();
    if (!current.includes(id)) return;
    writeStorage(current.filter((x) => x !== id));
  }, []);

  const clearAll = useCallback(() => writeStorage([]), []);

  return {
    favoriteIds,
    count: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearAll,
  };
}
