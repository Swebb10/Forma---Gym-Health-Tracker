import { afterEach, describe, expect, it } from "vitest";
import { catalogs } from "./locales";
import { getLanguage, getLocale, setLanguage, t } from "./i18n";
import { dayLabel, freshDay } from "./training";
import { numberLabel } from "./metrics";
import { crc, DEFAULT_BILLING, paymentLink } from "./subscription";
afterEach(() => setLanguage("es"));
describe("language catalogs", () => {
  it("all languages cover the same messages and interpolation arguments", () => {
    const keys = Object.keys(catalogs.en).sort();
    const args = (s: string) =>
      [...s.matchAll(/\{\d+\}/g)].map((m) => m[0]).sort();
    for (const catalog of Object.values(catalogs)) {
      expect(Object.keys(catalog).sort()).toEqual(keys);
      for (const [source, target] of Object.entries(catalog)) {
        expect(target.trim(), source).not.toBe("");
        expect(args(target), source).toEqual(args(source));
      }
    }
  });
  it("uses Spanish initially and preserves unknown user content", () => {
    expect(getLanguage()).toBe("es");
    expect(t("Mi nombre personal")).toBe("Mi nombre personal");
    setLanguage("de");
    expect(getLocale()).toBe("de-DE");
    expect(t("Mis rutinas")).toBe(catalogs.de["Mis rutinas"]);
    expect(numberLabel(12.5)).toBe("12,5");
  });
  it("localizes routine day labels without changing canonical values", () => {
    setLanguage("en");
    const day = { ...freshDay(), weekday: "Lunes" as const, name: "Personal" };
    expect(dayLabel(day)).toBe("Monday · Personal");
    expect(day.weekday).toBe("Lunes");
    expect(t("Día {0}", { 0: 3 })).toBe("Day 3");
  });
  it("localizes receipt text but preserves payment amount, currency and destination", () => {
    setLanguage("en");
    const url = new URL(
      paymentLink(
        DEFAULT_BILLING,
        { id: "abc", email: "test@example.com" },
        "monthly",
      ),
    );
    expect(url.pathname).toBe("/50687273417");
    expect(url.searchParams.get("text")).toContain(crc(5000));
    expect(url.searchParams.get("text")).toContain("Account: test@example.com");
  });
});
