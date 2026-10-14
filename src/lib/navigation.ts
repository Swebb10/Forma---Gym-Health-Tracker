import type { Page } from "../types";
export type RouteOptions = {
  view?: string;
  session?: string;
  exercise?: string;
};
export type Navigate = (page: Page, options?: RouteOptions) => void;
const pages: Page[] = [
  "dashboard",
  "workouts",
  "routines",
  "measurements",
  "bioimpedance",
  "nutrition",
  "subscription",
  "admin",
];
export function readRoute(
  hash: string = location.hash,
): { page: Page } & RouteOptions {
  const [path, search = ""] = hash.replace(/^#/, "").split("?");
  const p = new URLSearchParams(search);
  return {
    page: pages.includes(path as Page) ? (path as Page) : ("dashboard" as Page),
    view: p.get("view") ?? undefined,
    session: p.get("session") ?? undefined,
    exercise: p.get("exercise") ?? undefined,
  };
}
export function routeHash(page: Page, options: RouteOptions = {}) {
  const q = new URLSearchParams(
    Object.entries(options).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  return page + (q.size ? "?" + q.toString() : "");
}
