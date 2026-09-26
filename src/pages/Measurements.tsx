import { useState, type FormEvent } from "react";
import { Plus, Pencil, Ruler, Eye } from "lucide-react";
import { useData } from "../context/DataContext";
import {
  measurementSections,
  legacyMeasurementFields,
  allMeasurementFields,
  hasMeasurement,
  type MeasurementField,
} from "../lib/measurements";
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
  const [zone, setZone] = useState("Zona Media"),
    [selected, setSelected] = useState<MeasurementField["key"]>("waist"),
    [editing, setEditing] = useState<Measurement | null>(null),
    [viewing, setViewing] = useState<Measurement | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [legacyKeys, setLegacyKeys] = useState<string[]>([]);
  const sorted = [...data.measurements].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const sections = [
    ...measurementSections,
    ...(legacyMeasurementFields.some((f) => hasMeasurement(sorted, f))
      ? [
          {
            title: "Registros anteriores",
            fields: legacyMeasurementFields.filter((f) =>
              hasMeasurement(sorted, f),
            ),
          },
        ]
      : []),
  ];
  const currentSection = sections.find((s) => s.title === zone) ?? sections[1];
  const selectedField = allMeasurementFields.find((f) => f.key === selected)!;
  const points = sorted.flatMap((record) => {
    const value = record[selected];
    return typeof value === "number" ? [{ date: record.date, value }] : [];
  });
  const open = (record?: Measurement) => {
    setError("");
    setLegacyKeys(
      record
        ? legacyMeasurementFields
            .filter((f) => record[f.key] !== undefined)
            .map((f) => f.key)
        : [],
    );
    setEditing(
      record ? { ...record } : { id: crypto.randomUUID(), date: localDate() },
    );
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    if (!allMeasurementFields.some((f) => typeof editing[f.key] === "number")) {
      setError("Completa al menos una medida.");
      return;
    }
    setBusy(true);
    try {
      await save("measurements", editing);
      setEditing(null);
    } catch {
      setError(
        "No se pudo guardar. Revisa tu conexión y los permisos de guardado.",
      );
    } finally {
      setBusy(false);
    }
  }
  const fields = (items: MeasurementField[]) =>
    items.map((field) => (
      <Field key={field.key} label={field.label + " · cm"}>
        <input
          type="number"
          min=".1"
          max={field.max}
          step=".1"
          value={editing?.[field.key] ?? ""}
          placeholder="Sin medir"
          onChange={(e) =>
            setEditing({
              ...editing!,
              [field.key]:
                e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />
      </Field>
    ));
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Más allá de la báscula</h2>
          <p className="muted">
            Observa tus cambios por zona y por lado del cuerpo.
          </p>
        </div>
        <button className="btn primary" onClick={() => open()}>
          <Plus size={18} /> Añadir medidas
        </button>
      </div>
      <div className="zone-tabs" role="group" aria-label="Zonas corporales">
        {sections.map((section) => (
          <button
            key={section.title}
            className={currentSection.title === section.title ? "active" : ""}
            aria-pressed={currentSection.title === section.title}
            onClick={() => {
              setZone(section.title);
              if (!section.fields.some((f) => f.key === selected))
                setSelected(section.fields[0].key);
            }}
          >
            {section.title}
          </button>
        ))}
      </div>
      {currentSection.title === "Registros anteriores" && (
        <p className="legacy-note">
          Se conservan las medidas antiguas sin asignarlas a un lado o punto
          anatómico que no se registró.
        </p>
      )}
      <div className="measurement-stats detailed-measurements">
        {currentSection.fields.map((field) => {
          const latest = [...sorted]
            .reverse()
            .find((r) => typeof r[field.key] === "number");
          return (
            <button
              key={field.key}
              className={`panel measure-stat ${selected === field.key ? "selected" : ""}`}
              aria-pressed={selected === field.key}
              onClick={() => setSelected(field.key)}
            >
              <span>
                <Ruler size={16} />
                {field.label}
              </span>
              <strong>
                {numberLabel(latest?.[field.key])} <small>cm</small>
              </strong>
              <small className="muted">
                {latest ? dateLabel(latest.date) : "Sin registros"}
              </small>
            </button>
          );
        })}
      </div>
      <section className="panel chart-panel measurement-chart">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">EVOLUCIÓN CORPORAL</span>
            <h3>{selectedField.label}</h3>
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
            onAction={() => open()}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>{selectedField.label} · cm</th>
                  <th>Medidas registradas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((record) => (
                  <tr key={record.id}>
                    <td>
                      {dateLabel(record.date)} {record.date.slice(0, 4)}
                    </td>
                    <td>{numberLabel(record[selected])}</td>
                    <td>
                      {
                        allMeasurementFields.filter(
                          (f) => typeof record[f.key] === "number",
                        ).length
                      }
                    </td>
                    <td>
                      <div className="flex">
                        <button
                          className="icon-btn"
                          aria-label={`Ver medidas del ${record.date}`}
                          onClick={() => setViewing(record)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label={`Editar medidas del ${record.date}`}
                          onClick={() => open(record)}
                        >
                          <Pencil size={16} />
                        </button>
                        <DeleteButton
                          onDelete={() => remove("measurements", record.id)}
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
                Completa las medidas que tomaste, en centímetros. Usa el mismo
                punto de referencia en cada evaluación.
              </p>
              <Field label="Fecha">
                <input
                  required
                  type="date"
                  max={localDate()}
                  value={editing.date}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                />
              </Field>
              {measurementSections.map((section) => (
                <section className="form-section" key={section.title}>
                  <h3>{section.title}</h3>
                  <div className="form-grid">{fields(section.fields)}</div>
                </section>
              ))}
              {legacyKeys.length > 0 && (
                <section className="form-section">
                  <h3>Medidas anteriores sin lado definido</h3>
                  <p className="small muted">
                    Conservamos estos valores tal como se registraron.
                  </p>
                  <div className="form-grid">
                    {fields(
                      legacyMeasurementFields.filter((f) =>
                        legacyKeys.includes(f.key),
                      ),
                    )}
                  </div>
                </section>
              )}
              <ErrorMessage message={error} />
            </div>
            <FormFooter busy={busy} onClose={() => setEditing(null)} />
          </form>
        </Modal>
      )}
      {viewing && (
        <Modal
          title={`Medidas del ${dateLabel(viewing.date)} ${viewing.date.slice(0, 4)}`}
          onClose={() => setViewing(null)}
        >
          <div className="form-content measurement-detail">
            {[
              ...measurementSections,
              {
                title: "Registros anteriores",
                fields: legacyMeasurementFields,
              },
            ]
              .filter((section) =>
                section.fields.some((f) => typeof viewing[f.key] === "number"),
              )
              .map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <dl>
                    {section.fields
                      .filter((f) => typeof viewing[f.key] === "number")
                      .map((f) => (
                        <div key={f.key}>
                          <dt>{f.label}</dt>
                          <dd>{numberLabel(viewing[f.key])} cm</dd>
                        </div>
                      ))}
                  </dl>
                </section>
              ))}
          </div>
        </Modal>
      )}
    </>
  );
}
