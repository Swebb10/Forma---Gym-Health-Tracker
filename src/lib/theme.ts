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
    id: "onyx",
    name: "Ónix",
    description: "Negro profundo, menta y un toque dorado.",
    dark: true,
    background: "#080d0c",
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
    description: "Luz violeta y ámbar sobre azul noche.",
    dark: true,
    background: "#101024",
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
const storageKey = "forma-theme";
const valid = (value: unknown): value is ThemeId =>
  themes.some((theme) => theme.id === value);
function systemTheme(): ThemeId {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function initialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(storageKey);
    if (valid(saved)) return saved;
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
    current = valid(event.newValue) ? event.newValue : systemTheme();
    applyTheme();
    listeners.forEach((listener) => listener());
  });
}
