"use client";

import { useCallback, useSyncExternalStore } from "react";

// Per-browser preferences, such as the Spoiler Warning choice, Spoiler Mode
// and the Guest's name.
// Storage can be unavailable (private mode, blocked cookies), so every access
// is guarded and the value falls back to null.
const EVENT = "local-storage";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

// Returns undefined until mounted (the server can't see localStorage).
export function useLocalStorage(key: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => undefined,
  );

  const set = useCallback(
    (next: string | null) => {
      try {
        if (next === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, next);
      } catch {
        // Not remembered; fine.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [value, set] as const;
}
