import { useState, type FormEvent } from "react";
import { Plus, Pencil, Ruler } from "lucide-react";
import { useData } from "../context/DataContext";
import { measurementFields } from "../lib/fields";
import { localDate, dateLabel, numberLabel } from "../lib/metrics";
import { ProgressChart } from "../components/ProgressChart";
import {
  Modal,
  Field,
  Empty,
  FormFooter,
  DeleteButton,
  ErrorMessage,
} from "../components/ui";
import type { Measurement } from "../types";
export default function Measurements() {
  const { data, save, remove } = useData();
  const [selected, setSelected] = useState("waist"),
    [editing, setEditing] = useState<Measurement | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const sorted = [...data.measurements].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const points = sorted.flatMap((r) => {
    const value = r[selected as keyof Measurement];
    return typeof value === "number" ? [{ date: r.date, value }] : [];
  });
  const create = () => {
    setError("");
    setEditing({ id: crypto.randomUUID(), date: localDate() });
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (
      !measurementFields.some(
        (f) => typeof editing[f.key as keyof Measurement] === "number",
      )
    ) {
      setError("Completa al menos una medida.");
      return;
    }
    setBusy(true);
    try {
      await save("measurements", editing);
      setEditing(null);
    } catch {
      setError("No se pudo guardar. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Más allá de la báscula</h2>
          <p className="muted">Observa los cambios, centímetro a centímetro.</p>
        </div>
        <button className="btn primary" onClick={create}>
          <Plus size={18} /> Añadir medidas
        </button>
      </div>
      <div className="measurement-stats">
        {measurementFields.map((f) => {
          const latest = [...sorted]
            .reverse()
            .find((r) => typeof r[f.key as keyof Measurement] === "number");
          return (
            <button
              key={f.key}
              className={`panel measure-stat ${selected === f.key ? "selected" : ""}`}
              onClick={() => setSelected(f.key)}
            >
              <span>
                <Ruler size={16} />
                {f.label}
              </span>
              <strong>
                {numberLabel(
                  latest?.[f.key as keyof Measurement] as number | undefined,
                )}{" "}
                <small>cm</small>
              </strong>
            </button>
          );
        })}
      </div>
      <section className="panel chart-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">EVOLUCIÓN CORPORAL</span>
            <h3>{measurementFields.find((f) => f.key === selected)?.label}</h3>
          </div>
          <span className="tag">Centímetros</span>
        </div>
        <ProgressChart data={points} unit="cm" />
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h3>Historial de medidas</h3>
          <span className="muted">{sorted.length} registros</span>
        </div>
        {!sorted.length ? (
          <Empty
            title="Tu punto de partida"
            description="Registra al menos una medida para empezar."
            onAction={create}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  {measurementFields.map((f) => (
                    <th key={f.key}>{f.label} · cm</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((r) => (
                  <tr key={r.id}>
                    <td>
                      {dateLabel(r.date)} {r.date.slice(0, 4)}
                    </td>
                    {measurementFields.map((f) => (
                      <td key={f.key}>
                        {numberLabel(
                          r[f.key as keyof Measurement] as number | undefined,
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="flex">
                        <button
                          className="icon-btn"
                          aria-label={`Editar medidas del ${r.date}`}
                          onClick={() => {
                            setError("");
                            setEditing({ ...r });
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <DeleteButton
                          onDelete={() => remove("measurements", r.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {editing && (
        <Modal
          title="Medidas corporales"
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form onSubmit={submit}>
            <div className="form-content">
              <p className="muted">
                Registra las medidas en centímetros, siguiendo siempre el mismo
                método.
              </p>
              <Field label="Fecha">
                <input
                  type="date"
                  required
                  max={localDate()}
                  value={editing.date}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                />
              </Field>
              <div className="form-grid">
                {measurementFields.map((f) => (
                  <Field key={f.key} label={f.label + " · cm"}>
                    <input
                      type="number"
                      min=".1"
                      max={f.max}
                      step=".1"
                      value={
                        (editing[f.key as keyof Measurement] as number) ?? ""
                      }
                      placeholder="Sin medir"
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [f.key]:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
              <ErrorMessage message={error} />
            </div>
            <FormFooter busy={busy} onClose={() => setEditing(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
