import { getLocale, t } from "./i18n";
import type { User } from "firebase/auth";
export const OWNER_EMAIL = "swebb1732@gmail.com";
export const isSuperAdmin = (
  user: Pick<User, "email" | "emailVerified"> | null,
) => user?.email?.toLowerCase() === OWNER_EMAIL && user.emailVerified === true;
export type PlanId = "monthly" | "quarterly" | "yearly";
export const PLANS = [
  { id: "monthly" as const, months: 1, label: "1 mes" },
  { id: "quarterly" as const, months: 3, label: "3 meses" },
  { id: "yearly" as const, months: 12, label: "1 año" },
];
export type Billing = {
  phone: string;
  holder: string;
  monthly: number;
  quarterly: number;
  yearly: number;
};
export const DEFAULT_BILLING: Billing = {
  phone: "87273417",
  holder: "Sebastián Webb Vargas",
  monthly: 5000,
  quarterly: 14250,
  yearly: 54000,
};
type Time = { toMillis: () => number } | null;
export type Member = {
  id: string;
  email: string;
  active: boolean;
  subscriptionStatus: "trial" | "active";
  subscriptionEndsAt: Time;
  createdAt: Time;
  notes: string;
};
export type Payment = {
  id: string;
  memberId: string;
  email: string;
  plan: PlanId;
  months: number;
  amount: number;
  reference: string;
  previousEnd: Time;
  subscriptionEndsAt: Time;
  verifiedAt: Time;
  verifiedBy: string;
};
export const crc = (value: number) =>
  new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(value);
export const costaRicaDay = (now = Date.now()) =>
  new Date(now - 6 * 3600000).toISOString().slice(0, 10);
export function validDay(day: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}
export function endOfDay(day: string) {
  if (!validDay(day)) throw new Error("Selecciona una fecha válida.");
  return Date.parse(day + "T00:00:00-06:00") + 86400000;
}
export function addMonths(day: string, months: number) {
  if (!validDay(day) || ![1, 3, 12].includes(months))
    throw new Error("Periodo inválido.");
  const [y, m, d] = day.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, last)))
    .toISOString()
    .slice(0, 10);
}
export function membership(member: Member | null, now = Date.now()) {
  const end =
    member?.subscriptionStatus === "trial"
      ? member.createdAt
        ? member.createdAt.toMillis() + 30 * 86400000
        : 0
      : (member?.subscriptionEndsAt?.toMillis() ?? 0);
  const remaining = Math.max(0, Math.ceil((end - now) / 86400000));
  const days =
    member?.subscriptionStatus === "trial"
      ? Math.min(30, remaining)
      : remaining;
  const status = !member?.active
    ? "suspended"
    : end <= now
      ? "expired"
      : member.subscriptionStatus === "trial"
        ? "trial"
        : days <= 7
          ? "critical"
          : days <= 15
            ? "warning"
            : "active";
  return {
    end,
    days,
    status,
    allowed: Boolean(member?.active && end > now),
    endDay: end ? costaRicaDay(end - 1) : "",
  };
}
export const STATUS_LABELS: Record<string, string> = {
  suspended: "Cuenta suspendida",
  expired: "Vencida",
  trial: "Prueba gratuita",
  critical: "Por vencer",
  warning: "Próxima renovación",
  active: "Activa",
};
export function renewalEnd(member: Member, months: number, now = Date.now()) {
  const current = membership(member, now);
  return endOfDay(
    addMonths(current.end > now ? current.endDay : costaRicaDay(now), months),
  );
}
export function validateBilling(billing: Billing) {
  if (
    !/^[678]\d{7}$/.test(billing.phone) ||
    !billing.holder.trim() ||
    billing.holder.length > 120 ||
    PLANS.some(
      (p) =>
        !Number.isInteger(billing[p.id]) ||
        billing[p.id] < 1 ||
        billing[p.id] > 10000000,
    )
  )
    throw new Error(
      "Revisa el teléfono SINPE, el titular y los precios en colones enteros.",
    );
}
export function paymentLink(
  billing: Billing,
  member: Pick<Member, "id" | "email">,
  plan: PlanId,
) {
  const label = PLANS.find((p) => p.id === plan)!.label;
  return (
    "https://wa.me/506" +
    billing.phone +
    "?text=" +
    encodeURIComponent(
      t(
        "Hola, quiero enviar el comprobante SINPE de Forma.\nCuenta: {0}\nID: {1}\nPlan: {2}\nMonto: {3}",
        { 0: member.email, 1: member.id, 2: t(label), 3: crc(billing[plan]) },
      ),
    )
  );
}

export const subscriptionDate = (day: string) =>
  new Intl.DateTimeFormat(getLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date(day + "T12:00:00-06:00"));
