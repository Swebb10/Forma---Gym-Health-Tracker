import { useState } from "react";
import {
  Check,
  ShieldCheck,
  ArrowUpRight,
  Copy,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { usePayments } from "../hooks/usePayments";
import {
  crc,
  membership,
  STATUS_LABELS,
  PLANS,
  paymentLink,
  type PlanId,
} from "../lib/subscription";
import { subscriptionDate as dateLabel } from "../lib/subscription";
import { ErrorMessage } from "../components/ui";
import PaymentHistory from "../components/PaymentHistory";
export default function Subscription() {
  const { demo } = useAuth();
  const { member, billing, isAdmin, now } = useSubscription();
  const [plan, setPlan] = useState<PlanId>("monthly"),
    [copied, setCopied] = useState("");
  const history = usePayments(member?.id ?? "", demo);
  const state = membership(member, now);
  return (
    <div className="billing-page">
      <header className="section-header">
        <div>
          <span className="eyebrow">A TU RITMO</span>
          <h1>Mi suscripción</h1>
          <p className="muted">
            Un espacio para seguir construyendo tu mejor versión.
          </p>
        </div>
      </header>
      {demo && (
        <p className="notice">
          Estás en una demostración. Los pagos están deshabilitados.
        </p>
      )}
      <section className="panel subscription-summary">
        <div className="subscription-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <span
            className={"status-chip " + (isAdmin ? "active" : state.status)}
          >
            {isAdmin ? "Súper administrador" : STATUS_LABELS[state.status]}
          </span>
          <h2>
            {isAdmin
              ? "Tu acceso personal está incluido"
              : state.status === "suspended"
                ? "Tu cuenta está suspendida"
                : state.status === "expired"
                  ? "Retoma tu progreso"
                  : state.status === "trial"
                    ? "Conoce todo lo que puedes lograr"
                    : "Tu progreso continúa"}
          </h2>
          <p className="muted">
            {isAdmin
              ? "Puedes usar todas las funciones sin contratar un plan."
              : state.status === "suspended"
                ? "Contacta al administrador para reactivar tu cuenta antes de pagar."
                : state.endDay
                  ? "Acceso hasta el " + dateLabel(state.endDay) + "."
                  : "Selecciona un plan para continuar."}
          </p>
          {state.status === "trial" && !isAdmin && (
            <p className="small muted">
              30 días de prueba desde tu primer acceso a esta versión.
            </p>
          )}
        </div>
        {!isAdmin && state.allowed && (
          <div className="remaining-days">
            <strong>{state.days}</strong>
            <span>días restantes</span>
          </div>
        )}
      </section>
      <div>
        <h2>Elige tu próximo paso</h2>
        <p className="muted">
          Todas las funciones en cada plan. Pago único por periodo, sin cobro
          automático.
        </p>
      </div>
      <div
        className="plan-grid"
        role="group"
        aria-label="Planes de suscripción"
      >
        {PLANS.map((p) => {
          const saving = billing.monthly * p.months - billing[p.id];
          return (
            <button
              key={p.id}
              className={"plan-card " + (plan === p.id ? "selected" : "")}
              aria-pressed={plan === p.id}
              onClick={() => setPlan(p.id)}
            >
              <div className="plan-top">
                <span>{p.label}</span>
                <span className="plan-check">
                  {plan === p.id && <Check size={15} />}
                </span>
              </div>
              <strong className="plan-price">{crc(billing[p.id])}</strong>
              <span className="muted small">
                {crc(billing[p.id] / p.months)} / mes
              </span>
              <span className="plan-saving">
                {saving > 0
                  ? "Ahorras " +
                    crc(saving) +
                    " (" +
                    Math.round((saving / (billing.monthly * p.months)) * 100) +
                    "%)"
                  : "La flexibilidad de ir mes a mes"}
              </span>
            </button>
          );
        })}
      </div>
      <section className="panel sinpe-panel">
        <div>
          <span className="eyebrow">PAGO SEGURO, SIN COMPLICACIONES</span>
          <h2>Paga con SINPE Móvil</h2>
          <p className="muted">
            Tu suscripción se activa cuando el administrador verifica la
            transferencia.
          </p>
          <ol className="payment-steps">
            <li>Transfiere el monto exacto al número indicado.</li>
            <li>
              Envía el comprobante por WhatsApp, con tu correo y el plan
              elegido.
            </li>
            <li>Recibe la confirmación y continúa entrenando.</li>
          </ol>
          <p className="small muted">
            Si renuevas antes de vencer, conservas los días que te quedan.
          </p>
        </div>
        <div className="sinpe-details">
          <CreditCard size={24} />
          <span className="small muted">SINPE MÓVIL</span>
          <strong className="sinpe-phone">
            {billing.phone.slice(0, 4)} {billing.phone.slice(4)}
          </strong>
          <span>{billing.holder}</span>
          <button
            className="text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(billing.phone);
                setCopied("Número copiado.");
              } catch {
                setCopied("No se pudo copiar. Puedes seleccionar el número.");
              }
            }}
          >
            <Copy size={14} /> Copiar número
          </button>
          <p className="small" role="status">
            {copied}
          </p>
          <div className="sinpe-total">
            <span>Total · {PLANS.find((p) => p.id === plan)?.label}</span>
            <strong>{crc(billing[plan])}</strong>
          </div>
          {demo || isAdmin || !member?.active ? (
            <button className="btn primary" disabled>
              {demo
                ? "Pago deshabilitado en demo"
                : isAdmin
                  ? "Tu cuenta no necesita pagar"
                  : "Cuenta suspendida"}
            </button>
          ) : (
            <a
              className="btn primary"
              target="_blank"
              rel="noopener noreferrer"
              href={paymentLink(billing, member, plan)}
            >
              Enviar comprobante <ArrowUpRight size={17} />
            </a>
          )}
          <span className="small muted">
            Abrir WhatsApp no confirma el pago.
          </span>
        </div>
      </section>
      <section className="panel billing-section">
        <h3>Historial de pagos</h3>
        <ErrorMessage message={history.error} />
        {history.loading ? (
          <p className="muted">Cargando pagos…</p>
        ) : (
          <PaymentHistory payments={history.payments} />
        )}
      </section>
    </div>
  );
}
