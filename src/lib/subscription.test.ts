import { describe, it, expect } from "vitest";
import {
  addMonths,
  costaRicaDay,
  endOfDay,
  membership,
  renewalEnd,
  isSuperAdmin,
  validateBilling,
  DEFAULT_BILLING,
  paymentLink,
  type Member,
} from "./subscription";
const stamp = (value: number) => ({ toMillis: () => value });
const member = (overrides: Partial<Member> = {}): Member => ({
  id: "one",
  email: "one@example.com",
  active: true,
  subscriptionStatus: "active",
  subscriptionEndsAt: stamp(endOfDay("2026-10-31")),
  createdAt: stamp(Date.parse("2026-09-01T12:00:00Z")),
  notes: "",
  ...overrides,
});
describe("Suscripciones de Forma", () => {
  it("define precios con descuentos reales de 5% y 10%", () => {
    expect(DEFAULT_BILLING.monthly).toBe(5000);
    expect(DEFAULT_BILLING.quarterly).toBe(15000 * 0.95);
    expect(DEFAULT_BILLING.yearly).toBe(60000 * 0.9);
  });
  it("ajusta meses y años bisiestos sin desbordar", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-02-29", 12)).toBe("2029-02-28");
    expect(addMonths("2026-11-30", 3)).toBe("2027-02-28");
    expect(() => addMonths("2026-02-30", 1)).toThrow();
  });
  it("mantiene la fecha de Costa Rica y el último día completo", () => {
    const end = endOfDay("2026-10-31");
    expect(costaRicaDay(end - 1)).toBe("2026-10-31");
    expect(membership(member(), end - 1).allowed).toBe(true);
    expect(membership(member(), end).status).toBe("expired");
  });
  it("renueva desde el vencimiento sin perder días", () => {
    expect(renewalEnd(member(), 3, Date.parse("2026-10-02T12:00:00Z"))).toBe(
      endOfDay("2027-01-31"),
    );
  });
  it("renueva cuentas vencidas desde hoy", () => {
    expect(renewalEnd(member(), 1, Date.parse("2026-11-15T12:00:00Z"))).toBe(
      endOfDay("2026-12-15"),
    );
  });
  it("la prueba dura exactamente 30 días y suspender no reinicia nada", () => {
    const trial = member({
      subscriptionStatus: "trial",
      subscriptionEndsAt: null,
      createdAt: stamp(1000),
    });
    expect(membership(trial, 0).days).toBe(30);
    expect(membership(trial, 1000 + 30 * 86400000 - 1).allowed).toBe(true);
    expect(membership(trial, 1000 + 30 * 86400000).status).toBe("expired");
    expect(membership({ ...trial, active: false }, 1000).status).toBe(
      "suspended",
    );
  });
  it("el correo del dueño sin verificar no es administrador", () => {
    expect(
      isSuperAdmin({ email: "swebb1732@gmail.com", emailVerified: false }),
    ).toBe(false);
    expect(
      isSuperAdmin({ email: "swebb1732@gmail.com", emailVerified: true }),
    ).toBe(true);
    expect(
      isSuperAdmin({ email: "other@gmail.com", emailVerified: true }),
    ).toBe(false);
  });
  it("valida ajustes y codifica el mensaje del comprobante", () => {
    expect(() =>
      validateBilling({ ...DEFAULT_BILLING, phone: "12345678" }),
    ).toThrow();
    expect(() => validateBilling({ ...DEFAULT_BILLING, yearly: 0 })).toThrow();
    expect(() => validateBilling(DEFAULT_BILLING)).not.toThrow();
    const link = paymentLink(DEFAULT_BILLING, member(), "quarterly");
    expect(link).toContain("https://wa.me/50687273417?text=");
    expect(decodeURIComponent(link)).toContain("one@example.com");
    expect(decodeURIComponent(link)).toContain("3 meses");
  });
});
