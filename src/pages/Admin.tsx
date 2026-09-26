import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Users, CreditCard, Settings, History, Search } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { usePayments } from "../hooks/usePayments";
import {
  membership,
  STATUS_LABELS,
  crc,
  costaRicaDay,
  type Member,
} from "../lib/subscription";
import { subscriptionDate as dateLabel } from "../lib/subscription";
import { ErrorMessage, Field } from "../components/ui";
import PaymentHistory from "../components/PaymentHistory";
import {
  PaymentForm,
  MembershipForm,
  StatusForm,
  BillingSettings,
} from "../components/admin/BillingForms";
type Audit = {
  id: string;
  email: string;
  reason: string;
  changedAt?: { toMillis: () => number };
};
export default function Admin() {
  const { isAdmin, billing, now } = useSubscription();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]),
    [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [tab, setTab] = useState("members"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const [form, setForm] = useState<{
    kind: "payment" | "edit" | "status";
    member: Member;
  } | null>(null);
  const history = usePayments(undefined, !isAdmin);
  useEffect(() => {
    if (!db || !isAdmin) return;
    const fail = () => {
      setError(
        "No se pudo cargar la administración. Comprueba tu sesión y las reglas de Firestore.",
      );
      setLoading(false);
    };
    const off = onSnapshot(
      collection(db, "members"),
      (s) => {
        setMembers(s.docs.map((d) => ({ ...d.data(), id: d.id }) as Member));
        setLoading(false);
      },
      fail,
    );
    const offAudit = onSnapshot(
      query(
        collection(db, "subscriptionAudit"),
        orderBy("changedAt", "desc"),
        limit(50),
      ),
      (s) => setAudit(s.docs.map((d) => ({ ...d.data(), id: d.id }) as Audit)),
      fail,
    );
    return () => {
      off();
      offAudit();
    };
  }, [isAdmin]);
  if (!isAdmin)
    return (
      <ErrorMessage message="Este espacio requiere acceso de súper administrador." />
    );
  const customers = members.filter((m) => m.id !== user?.uid);
  const filtered = members
    .filter(
      (m) =>
        (m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.id.includes(search)) &&
        (filter === "all" || membership(m, now).status === filter),
    )
    .sort((a, b) => a.email.localeCompare(b.email));
  const month = costaRicaDay(now).slice(0, 7);
  const revenue = history.payments
    .filter(
      (p) =>
        p.verifiedAt && costaRicaDay(p.verifiedAt.toMillis()).startsWith(month),
    )
    .reduce((sum, p) => sum + p.amount, 0);
  const stats = [
    ["Usuarios", customers.length],
    ["Con acceso", customers.filter((m) => membership(m, now).allowed).length],
    [
      "Por renovar",
      customers.filter((m) =>
        ["expired", "critical", "warning"].includes(membership(m, now).status),
      ).length,
    ],
    ["Cobros visibles este mes", crc(revenue)],
  ];
  return (
    <div className="billing-page">
      <header className="section-header">
        <div>
          <span className="eyebrow">CONTROL DE FORMA</span>
          <h1>Administración</h1>
          <p className="muted">
            Gestiona cuentas, suscripciones y pagos desde un solo lugar.
          </p>
        </div>
      </header>
      <div className="stats-grid">
        {stats.map(([title, value]) => (
          <div className="panel stat-card" key={title}>
            <span className="muted small">{title}</span>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>
      <div
        className="admin-tabs"
        role="group"
        aria-label="Secciones de administración"
      >
        {[
          { id: "members", label: "Suscripciones", icon: Users },
          { id: "payments", label: "Pagos", icon: CreditCard },
          { id: "settings", label: "Configuración", icon: Settings },
          { id: "audit", label: "Actividad", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            className={"btn " + (tab === t.id ? "primary" : "secondary")}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={17} />
            {t.label}
          </button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {tab === "members" && (
        <>
          <div className="admin-filters">
            <Field label="Buscar cuenta">
              <div className="search-field">
                <Search size={17} />
                <input
                  placeholder="Correo o ID de usuario"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Estado">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="muted small">
            Las cuentas existentes aparecen cuando vuelven a iniciar sesión en
            esta versión. Cada cuenta tiene una única prueba de 30 días.
          </p>
          {loading ? (
            <p>Cargando cuentas…</p>
          ) : filtered.length ? (
            <div className="member-list">
              {filtered.map((m) => {
                const state = membership(m, now),
                  owner = m.id === user?.uid;
                return (
                  <article className="panel member-card" key={m.id}>
                    <div className="member-heading">
                      <div>
                        <h3>{m.email}</h3>
                        <p className="small muted">ID: {m.id}</p>
                      </div>
                      <span
                        className={
                          "status-chip " + (owner ? "active" : state.status)
                        }
                      >
                        {owner
                          ? "Súper administrador"
                          : STATUS_LABELS[state.status]}
                      </span>
                    </div>
                    <div className="member-details">
                      <span>
                        {owner
                          ? "Acceso personal incluido"
                          : state.endDay
                            ? "Vence: " + dateLabel(state.endDay)
                            : "Sin periodo activo"}
                      </span>
                      {!owner && state.allowed && (
                        <span>{state.days} días restantes</span>
                      )}
                    </div>
                    {m.notes && <p className="small muted">{m.notes}</p>}
                    {!owner && (
                      <div className="billing-actions">
                        <button
                          className="btn primary"
                          disabled={!m.active}
                          onClick={() =>
                            setForm({ kind: "payment", member: m })
                          }
                        >
                          Registrar SINPE
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => setForm({ kind: "edit", member: m })}
                        >
                          Editar suscripción
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => setForm({ kind: "status", member: m })}
                        >
                          {m.active ? "Suspender" : "Reactivar"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel billing-section">
              <p>No hay cuentas que coincidan.</p>
            </div>
          )}
        </>
      )}
      {tab === "payments" && (
        <section className="panel billing-section">
          <h3>Pagos confirmados</h3>
          <p className="muted small">
            Últimos 100 pagos. Los importes resumen solo este historial visible.
          </p>
          <ErrorMessage message={history.error} />
          {history.loading ? (
            <p>Cargando pagos…</p>
          ) : (
            <PaymentHistory payments={history.payments} admin />
          )}
        </section>
      )}
      {tab === "settings" && <BillingSettings billing={billing} />}
      {tab === "audit" && (
        <section className="panel billing-section">
          <h3>Actividad administrativa</h3>
          <p className="muted small">
            Últimos 50 ajustes de cuentas y suscripciones. Las transferencias
            aparecen en «Pagos».
          </p>
          {audit.length ? (
            audit.map((a) => (
              <article className="payment-row" key={a.id}>
                <div>
                  <strong>{a.email}</strong>
                  <p>{a.reason}</p>
                </div>
                <span className="small muted">
                  {a.changedAt
                    ? dateLabel(costaRicaDay(a.changedAt.toMillis()))
                    : "Guardando…"}
                </span>
              </article>
            ))
          ) : (
            <p className="muted">Todavía no hay ajustes.</p>
          )}
        </section>
      )}
      {form?.kind === "payment" && (
        <PaymentForm
          member={form.member}
          billing={billing}
          onClose={() => setForm(null)}
        />
      )}
      {form?.kind === "edit" && (
        <MembershipForm member={form.member} onClose={() => setForm(null)} />
      )}
      {form?.kind === "status" && (
        <StatusForm member={form.member} onClose={() => setForm(null)} />
      )}
    </div>
  );
}
