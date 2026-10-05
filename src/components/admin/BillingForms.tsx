import { t, useLanguage } from "../../lib/i18n";
import { useState, type FormEvent } from "react";
import { Timestamp } from "firebase/firestore";
import { ErrorMessage, Field, Modal } from "../ui";
import {
  crc,
  PLANS,
  membership,
  renewalEnd,
  costaRicaDay,
  endOfDay,
  type Billing,
  type Member,
  type PlanId,
} from "../../lib/subscription";
import { subscriptionDate as dateLabel } from "../../lib/subscription";
import {
  changeMember,
  newPaymentId,
  registerPayment,
  saveBilling,
} from "../../services/subscriptions";

const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message.includes("permission")
      ? "No tienes permiso. Revisa tu sesión y las reglas de Firestore."
      : error.message
    : "No se pudo guardar.";
function Footer({
  busy,
  onClose,
  label,
}: {
  busy: boolean;
  onClose: () => void;
  label: string;
}) {
  useLanguage();
  return (
    <div className="form-footer">
      <button
        type="button"
        className="btn secondary"
        disabled={busy}
        onClick={onClose}
      >
        {t("Cancelar")}
      </button>
      <button className="btn primary" disabled={busy}>
        {busy ? t("Guardando…") : label}
      </button>
    </div>
  );
}
export function PaymentForm({
  member,
  billing,
  onClose,
}: {
  member: Member;
  billing: Billing;
  onClose: () => void;
}) {
  useLanguage();
  const [plan, setPlan] = useState<PlanId>("monthly"),
    [reference, setReference] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const [paymentId] = useState(newPaymentId),
    [quote] = useState(billing);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const close = () => {
    if (!busy) onClose();
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !confirmed) return;
    setBusy(true);
    setError("");
    try {
      await registerPayment(member.id, plan, reference, paymentId, quote[plan]);
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={t("Registrar pago SINPE")} onClose={close}>
      <form onSubmit={submit}>
        <div className="form-content">
          <p>
            {t("Cuenta:")} <strong>{member.email}</strong>
          </p>
          <Field label={t("Plan pagado")}>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanId)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {t(p.label)} · {crc(quote[p.id])}
                </option>
              ))}
            </select>
          </Field>
          <div className="payment-preview">
            <span>{t("Monto a confirmar")}</span>
            <strong>{crc(quote[plan])}</strong>
            <span>
              {t("Nuevo vencimiento estimado:")}{" "}
              {dateLabel(
                costaRicaDay(
                  renewalEnd(member, PLANS.find((p) => p.id === plan)!.months) -
                    1,
                ),
              )}
            </span>
            <small>
              {t(
                "La fecha se recalcula al guardar para conservar cualquier renovación reciente.",
              )}
            </small>
          </div>
          <Field label={t("Referencia SINPE")}>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              minLength={4}
              maxLength={80}
              pattern="[A-Za-z0-9-]{4,80}"
              placeholder={t("Número de referencia de la transferencia")}
            />
          </Field>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              required
            />
            <span>
              {t(
                "Verifiqué en mi banco que recibí este monto y que la referencia corresponde a esta cuenta.",
              )}
            </span>
          </label>
          <ErrorMessage message={t(error)} />
        </div>
        <Footer
          busy={busy}
          onClose={close}
          label={t("Confirmar pago y renovar")}
        />
      </form>
    </Modal>
  );
}
export function MembershipForm({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  useLanguage();
  const [end, setEnd] = useState(membership(member).endDay),
    [notes, setNotes] = useState(member.notes),
    [reason, setReason] = useState("");
  const [changeDate, setChangeDate] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const close = () => {
    if (!busy) onClose();
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await changeMember(
        member,
        {
          notes,
          ...(changeDate
            ? {
                subscriptionStatus: "active" as const,
                subscriptionEndsAt: Timestamp.fromMillis(endOfDay(end)),
              }
            : {}),
        },
        reason,
      );
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={t("Editar suscripción")} onClose={close}>
      <form onSubmit={submit}>
        <div className="form-content">
          <p>{member.email}</p>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={changeDate}
              onChange={(e) => setChangeDate(e.target.checked)}
            />
            <span>{t("Ajustar manualmente el vencimiento")}</span>
          </label>
          {changeDate && (
            <>
              <Field label={t("Acceso hasta (inclusive)")}>
                <input
                  type="date"
                  value={end}
                  required
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Field>
              <p className="small muted">
                {t(
                  "Este ajuste reemplaza el periodo actual y no registra un pago. Para una transferencia, utiliza «Registrar SINPE».",
                )}
              </p>
            </>
          )}
          <Field label={t("Notas de la suscripción")}>
            <textarea
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <Field label={t("Motivo del cambio")}>
            <textarea
              required
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <ErrorMessage message={t(error)} />
        </div>
        <Footer busy={busy} onClose={close} label={t("Guardar cambios")} />
      </form>
    </Modal>
  );
}
export function StatusForm({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  useLanguage();
  const [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const close = () => {
    if (!busy) onClose();
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await changeMember(member, { active: !member.active }, reason);
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={member.active ? t("Suspender cuenta") : t("Reactivar cuenta")}
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="form-content">
          <p>{member.email}</p>
          <p className="muted">
            {member.active
              ? t(
                  "Se bloqueará el registro de actividad. Sus datos y pagos se conservarán.",
                )
              : t(
                  "Se recuperará el acceso si su periodo sigue vigente. La prueba gratuita no se reinicia.",
                )}
          </p>
          <Field label={t("Motivo")}>
            <textarea
              required
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <ErrorMessage message={t(error)} />
        </div>
        <Footer
          busy={busy}
          onClose={close}
          label={
            member.active ? t("Confirmar suspensión") : t("Reactivar cuenta")
          }
        />
      </form>
    </Modal>
  );
}
export function BillingSettings({ billing }: { billing: Billing }) {
  useLanguage();
  const [draft, setDraft] = useState(billing),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await saveBilling(draft);
      setMessage(
        "Configuración guardada. Los nuevos precios ya están disponibles.",
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel billing-section" onSubmit={submit}>
      <h3>{t("Precios y SINPE Móvil")}</h3>
      <p className="muted">
        {t(
          "Estos datos aparecen en «Mi suscripción». Los pagos anteriores conservan su importe original.",
        )}
      </p>
      <div className="form-grid">
        {PLANS.map((p) => (
          <Field key={p.id} label={t(p.label) + " · CRC"}>
            <input
              type="number"
              min={1}
              max={10000000}
              step={1}
              required
              value={draft[p.id]}
              onChange={(e) =>
                setDraft({ ...draft, [p.id]: Number(e.target.value) })
              }
            />
          </Field>
        ))}
        <Field label={t("Teléfono SINPE")}>
          <input
            inputMode="numeric"
            pattern="[678][0-9]{7}"
            maxLength={8}
            required
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
          />
        </Field>
        <Field label={t("Titular SINPE")}>
          <input
            maxLength={120}
            required
            value={draft.holder}
            onChange={(e) => setDraft({ ...draft, holder: e.target.value })}
          />
        </Field>
      </div>
      <ErrorMessage message={t(error)} />
      {message && (
        <p className="success" role="status">
          {t(message)}
        </p>
      )}
      <button className="btn primary" disabled={busy}>
        {busy ? t("Guardando…") : t("Guardar configuración")}
      </button>
    </form>
  );
}
