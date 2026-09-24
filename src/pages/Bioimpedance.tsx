import { useState, type FormEvent } from "react";
import { Plus, Pencil, Activity, ChevronDown } from "lucide-react";
import { useData } from "../context/DataContext";
import { bioSections } from "../lib/fields";
import { localDate, dateLabel, numberLabel, bmi } from "../lib/metrics";
import {
  Modal,
  Field,
  Empty,
  FormFooter,
  DeleteButton,
  ErrorMessage,
} from "../components/ui";
import type { BioRecord } from "../types";
type Draft = Record<string, string>;
export default function Bioimpedance() {
  const { data, save, remove } = useData();
  const [draft, setDraft] = useState<Draft | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const sorted = [...data.bioimpedance].sort((a, b) =>
    (b.date + b.time).localeCompare(a.date + a.time),
  );
  function edit(record?: BioRecord) {
    setError("");
    setDraft(
      record
        ? Object.fromEntries(
            Object.entries(record)
              .filter(([, v]) => typeof v === "string" || typeof v === "number")
              .map(([k, v]) => [k, String(v)]),
          )
        : {
            id: crypto.randomUUID(),
            date: localDate(),
            time: new Date().toTimeString().slice(0, 5),
            gender: "unspecified",
          },
    );
  }
  const set = (key: string, value: string) =>
    setDraft((d) => ({ ...d!, [key]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(
      bioSections
        .flatMap((s) => s.fields)
        .filter((f) => draft[f.key] !== undefined && draft[f.key] !== "")
        .map((f) => [f.key, Number(draft[f.key])]),
    );
    const value = {
      ...fields,
      id: draft.id,
      date: draft.date,
      time: draft.time,
      gender: draft.gender,
      bmi: fields.bmi ?? bmi(fields.weight, fields.height),
    } as BioRecord;
    try {
      await save("bioimpedance", value);
      setDraft(null);
    } catch {
      setError("No se pudo guardar la evaluación. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Una mirada más completa</h2>
          <p className="muted">
            Tus evaluaciones de composición corporal, en un solo lugar.
          </p>
        </div>
        <button className="btn primary" onClick={() => edit()}>
          <Plus size={18} /> Nueva evaluación
        </button>
      </div>
      <div className="info-strip">
        <Activity size={20} />
        <p>
          Transcribe los resultados de tu evaluación. Compara mediciones tomadas
          en condiciones similares.
        </p>
      </div>
      {!sorted.length ? (
        <Empty
          title="Registra tu primera evaluación"
          description="Ten a mano el informe de tu nutricionista o báscula de bioimpedancia."
          onAction={() => edit()}
        />
      ) : (
        <div className="bio-list">
          {sorted.map((r) => (
            <article className="panel bio-card" key={r.id}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">EVALUACIÓN CORPORAL</span>
                  <h3>
                    {dateLabel(r.date)} {r.date.slice(0, 4)}{" "}
                    <span className="muted small">· {r.time}</span>
                  </h3>
                </div>
                <div className="flex">
                  <button
                    className="icon-btn"
                    aria-label={`Editar evaluación del ${r.date}`}
                    onClick={() => edit(r)}
                  >
                    <Pencil size={17} />
                  </button>
                  <DeleteButton onDelete={() => remove("bioimpedance", r.id)} />
                </div>
              </div>
              <div className="bio-summary">
                {[
                  { label: "Peso", value: r.weight, unit: "kg" },
                  { label: "Grasa corporal", value: r.bodyFat, unit: "%" },
                  {
                    label: "Músculo esquelético",
                    value: r.skeletalMuscle,
                    unit: "%",
                  },
                  { label: "IMC", value: r.bmi, unit: "kg/m²" },
                ].map((m) => (
                  <div key={m.label}>
                    <span className="muted">{m.label}</span>
                    <strong>
                      {numberLabel(m.value)} <small>{m.unit}</small>
                    </strong>
                  </div>
                ))}
              </div>
              <details>
                <summary>
                  Ver evaluación completa <ChevronDown size={15} />
                </summary>
                <div className="bio-details">
                  <p className="muted">
                    Género:{" "}
                    {{
                      male: "Masculino",
                      female: "Femenino",
                      other: "Otro",
                      unspecified: "Sin especificar",
                    }[r.gender] ?? r.gender}
                  </p>
                  {bioSections.map((section) => (
                    <section key={section.title}>
                      <h4>{section.title}</h4>
                      <dl>
                        {section.fields.map((f) => (
                          <div key={f.key}>
                            <dt>{f.label}</dt>
                            <dd>
                              {numberLabel(
                                r[f.key as keyof BioRecord] as
                                  number | undefined,
                              )}{" "}
                              {f.unit}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
      {draft && (
        <Modal
          title="Evaluación de bioimpedancia"
          onClose={() => {
            if (!busy) setDraft(null);
          }}
        >
          <form onSubmit={submit}>
            <div className="form-content">
              <p className="muted">
                Completa los campos de tu informe. Los campos marcados con * son
                obligatorios.
              </p>
              <div className="form-grid">
                <Field label="Fecha *">
                  <input
                    required
                    type="date"
                    max={localDate()}
                    value={draft.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </Field>
                <Field label="Hora *">
                  <input
                    required
                    type="time"
                    value={draft.time}
                    onChange={(e) => set("time", e.target.value)}
                  />
                </Field>
                <Field label="Género">
                  <select
                    value={draft.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="unspecified">Sin especificar</option>
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="other">Otro</option>
                  </select>
                </Field>
              </div>
              {bioSections.map((section, i) => (
                <section className="form-section" key={section.title}>
                  <h3>
                    <span className="index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="small muted">{section.description}</p>
                  )}
                  <div className="form-grid">
                    {section.fields.map((f) => (
                      <Field
                        key={f.key}
                        label={
                          f.label + " · " + f.unit + (f.required ? " *" : "")
                        }
                      >
                        <input
                          type="number"
                          required={f.required}
                          min={f.min ?? 0}
                          max={f.max}
                          step={f.step ?? ".01"}
                          value={draft[f.key] ?? ""}
                          placeholder={
                            f.key === "bmi" && draft.weight && draft.height
                              ? String(
                                  bmi(
                                    Number(draft.weight),
                                    Number(draft.height),
                                  ),
                                )
                              : "Sin medir"
                          }
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      </Field>
                    ))}
                  </div>
                  {i === 1 && (
                    <p className="small muted">
                      Si dejas el IMC vacío, se calculará a partir del peso y la
                      altura.
                    </p>
                  )}
                </section>
              ))}
              <ErrorMessage message={error} />
            </div>
            <FormFooter busy={busy} onClose={() => setDraft(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
