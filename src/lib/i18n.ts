import { useSyncExternalStore } from "react";
import { catalogs } from "./locales";
export const languages = [
  { code: "es", name: "Español", locale: "es-CR" },
  { code: "en", name: "English", locale: "en-US" },
  { code: "de", name: "Deutsch", locale: "de-DE" },
  { code: "ru", name: "Русский", locale: "ru-RU" },
  { code: "pt", name: "Português", locale: "pt-BR" },
  { code: "fr", name: "Français", locale: "fr-FR" },
] as const;
export type Language = (typeof languages)[number]["code"];
const key = "forma-language";
const valid = (value: unknown): value is Language =>
  languages.some((l) => l.code === value);
let current: Language = "es";
try {
  const saved = localStorage.getItem(key);
  if (valid(saved)) current = saved;
} catch {
  /* Storage can be unavailable in private browsing. */
}
const listeners = new Set<() => void>();
export const getLanguage = () => current;
export const getLocale = () =>
  languages.find((l) => l.code === current)!.locale;
export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function updateDocument() {
  if (typeof document !== "undefined") {
    document.documentElement.lang = current;
    document.documentElement.dir = "ltr";
  }
}
export function setLanguage(language: Language) {
  if (!valid(language)) return;
  current = language;
  try {
    localStorage.setItem(key, language);
  } catch {}
  updateDocument();
  listeners.forEach((listener) => listener());
}
if (typeof window !== "undefined") {
  updateDocument();
  window.addEventListener("storage", (event) => {
    if (event.key === key) {
      current = valid(event.newValue) ? event.newValue : "es";
      updateDocument();
      listeners.forEach((l) => l());
    }
  });
}
export function useLanguage() {
  return useSyncExternalStore(
    subscribeLanguage,
    getLanguage,
    () => "es" as Language,
  );
}
export function t(
  source: string,
  values: Record<string, string | number> = {},
): string {
  const catalog = current === "es" ? undefined : catalogs[current];
  const translated =
    catalog && Object.prototype.hasOwnProperty.call(catalog, source)
      ? catalog[source]
      : source;
  return translated.replace(/\{(\d+)\}/g, (match, id) =>
    String(values[id] ?? match),
  );
}
