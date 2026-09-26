import { crc, PLANS, costaRicaDay, type Payment } from "../lib/subscription";
import { subscriptionDate as dateLabel } from "../lib/subscription";
export default function PaymentHistory({
  payments,
  admin = false,
}: {
  payments: Payment[];
  admin?: boolean;
}) {
  return payments.length ? (
    <div className="payment-history">
      {payments.map((p) => (
        <article key={p.id} className="payment-row">
          <div>
            <strong>
              {PLANS.find((plan) => plan.id === p.plan)?.label ?? p.plan} ·{" "}
              {crc(p.amount)}
            </strong>
            <p className="muted small">
              {admin && <>{p.email} · </>}
              {p.verifiedAt
                ? dateLabel(costaRicaDay(p.verifiedAt.toMillis()))
                : "Confirmando…"}
            </p>
            <p className="small">Referencia SINPE: {p.reference}</p>
          </div>
          <span className="small muted">
            Hasta{" "}
            {p.subscriptionEndsAt
              ? dateLabel(costaRicaDay(p.subscriptionEndsAt.toMillis() - 1))
              : "—"}
          </span>
        </article>
      ))}
    </div>
  ) : (
    <p className="muted">Todavía no hay pagos confirmados.</p>
  );
}
