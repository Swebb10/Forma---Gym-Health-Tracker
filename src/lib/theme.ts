import { useSyncExternalStore } from "react";

export const themes = [
  {
    id: "light",
    name: "Claro",
    description: "El azul de Forma sobre blanco.",
    dark: false,
    background: "#f5f7fb",
  },
  {
    id: "dark",
    name: "Oscuro",
    description: "El azul de siempre, al anochecer.",
    dark: true,
    background: "#10151e",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Cian eléctrico y amarillo neón.",
    dark: true,
    background: "#020b1b",
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Negro y verde esmeralda, inspirado en Spotify.",
    dark: true,
    background: "#090b09",
  },
  {
    id: "breeze",
    name: "Brisa",
    description: "Blanco fresco, turquesa y azul intenso.",
    dark: false,
    background: "#eef8f8",
  },
  {
    id: "glow",
    name: "Resplandor",
    description: "Negro con un degradado azul profundo.",
    dark: true,
    background: "#090d14",
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Negro de cine con rojo intenso.",
    dark: true,
    background: "#080809",
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
const storageKey = "forma-theme";
const valid = (value: unknown): value is ThemeId =>
  themes.some((theme) => theme.id === value);
function savedTheme(value: string | null): ThemeId | undefined {
  if (valid(value)) return value;
  // Migrate the replaced Ónix palette for returning users.
  return value === "onyx" ? "spotify" : undefined;
}
function systemTheme(): ThemeId {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function initialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(storageKey);
    const theme = savedTheme(saved);
    if (theme) {
      if (saved !== theme) localStorage.setItem(storageKey, theme);
      return theme;
    }
  } catch {
    /* A blocked storage must not prevent changing the appearance. */
  }
  return systemTheme();
}
let current = initialTheme();
const listeners = new Set<() => void>();
function applyTheme() {
  if (typeof document === "undefined") return;
  const selected = themes.find((theme) => theme.id === current)!;
  const root = document.documentElement;
  root.dataset.theme = current;
  root.classList.toggle("dark", selected.dark);
  root.style.colorScheme = selected.dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", selected.background);
}
export function setTheme(theme: ThemeId) {
  if (!valid(theme)) return;
  current = theme;
  applyTheme();
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    /* Keep the in-memory selection. */
  }
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useTheme() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "light" as ThemeId,
  );
}

// Apply before React renders, including sign-in and loading screens.
applyTheme();
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    current = savedTheme(event.newValue) ?? systemTheme();
    applyTheme();
    listeners.forEach((listener) => listener());
  });
}
