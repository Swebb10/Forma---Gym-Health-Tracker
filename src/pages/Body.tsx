import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";
import { useProfile } from "../context/ProfileContext";
import { useNutrition } from "../context/NutritionContext";
import { useSubscription } from "../context/SubscriptionContext";
import { t, useLanguage } from "../lib/i18n";
import { defaultPreferences } from "../lib/nutrition";
import { localDate, dateLabel, numberLabel } from "../lib/metrics";
import { fromKg, toKg } from "../lib/training";
import type { Navigate } from "../lib/navigation";
import type { BodyProfile, WeightRecord, WeightUnit } from "../types";
import { Field, ErrorMessage, DeleteButton } from "../components/ui";
import BodyExplorer from "../components/nutrition/BodyExplorer";
import Measurements from "./Measurements";
import Bioimpedance from "./Bioimpedance";

export default function Body({
  view,
  onNavigate,
}: {
  view?: string;
  onNavigate: Navigate;
}) {
  useLanguage();
  const { loading, error } = useProfile(),
    { loading: nutritionLoading } = useNutrition();
  const tab = view === "measures" || view === "bio" ? view : "overview";
  return (
    <div className="body-page">
      <header className="section-heading">
        <div>
          <h1>{t("Mi cuerpo")}</h1>
          <p className="muted">
            {t("Un solo lugar para tu peso, medidas y evaluaciones.")}
          </p>
        </div>
      </header>
      <div
        className="workout-view-switch"
        role="group"
        aria-label={t("Mi cuerpo")}
      >
        {(
          [
            ["overview", "Perfil y evolución"],
            ["measures", "Medidas corporales"],
            ["bio", "Bioimpedancia"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className="btn secondary"
            aria-pressed={tab === key}
            onClick={() => onNavigate("measurements", { view: key })}
          >
            {t(label)}
          </button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {loading || nutritionLoading ? (
        <p>{t("Cargando…")}</p>
      ) : tab === "measures" ? (
        <Measurements />
      ) : tab === "bio" ? (
        <Bioimpedance />
      ) : (
        <>
          <SharedProfile />
          <WeightLog />
          <BodyOverview />
        </>
      )}
    </div>
  );
}
function SharedProfile() {
  const { profile, saveProfile } = useProfile(),
    { body } = useNutrition(),
    { canWrite } = useSubscription();
  const [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [value, setValue] = useState<BodyProfile>({
    age: 0,
    height: 0,
    sex: "",
    date: localDate(),
  });
  const edit = () => {
    setValue({
      age: body.age ?? 0,
      height: body.height ?? 0,
      sex: body.sex,
      date: localDate(),
    });
    setEditing(true);
    setError("");
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveProfile({ bodyProfile: value });
      setEditing(false);
    } catch {
      setError("No se pudo guardar el perfil corporal.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel nutrition-section">
      <h2>{t("Datos personales para el cálculo")}</h2>
      <p className="muted">
        {t(
          "Resumen y Nutrición utilizan estos mismos datos y el último peso registrado.",
        )}
      </p>
      {editing ? (
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label={t("Edad · años")}>
              <input
                required
                type="number"
                min="1"
                max="120"
                step="1"
                value={value.age || ""}
                onChange={(e) =>
                  setValue({ ...value, age: Number(e.target.value) })
                }
              />
            </Field>
            <Field label={t("Altura · cm")}>
              <input
                required
                type="number"
                min="100"
                max="250"
                step="any"
                value={value.height || ""}
                onChange={(e) =>
                  setValue({ ...value, height: Number(e.target.value) })
                }
              />
            </Field>
            <Field label={t("Sexo utilizado en la fórmula")}>
              <select
                required
                value={value.sex}
                onChange={(e) =>
                  setValue({
                    ...value,
                    sex: e.target.value as BodyProfile["sex"],
                  })
                }
              >
                <option value="">{t("Seleccionar")}</option>
                <option value="female">{t("Femenino")}</option>
                <option value="male">{t("Masculino")}</option>
              </select>
            </Field>
          </div>
          <p className="small muted">
            {t(
              "La edad corresponde a la fecha de actualización; no se incrementa automáticamente.",
            )}
          </p>
          <div className="body-actions">
            <button disabled={busy || !canWrite} className="btn primary">
              {t(busy ? "Guardando…" : "Guardar datos personales")}
            </button>
            <button
              type="button"
              disabled={busy}
              className="text-button"
              onClick={() => setEditing(false)}
            >
              {t("Cancelar")}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="nutrition-context">
            <div>
              <span>{t("Edad · años")}</span>
              <strong>{numberLabel(body.age, 0)}</strong>
            </div>
            <div>
              <span>{t("Altura · cm")}</span>
              <strong>{numberLabel(body.height)}</strong>
            </div>
            <div>
              <span>{t("Sexo utilizado en la fórmula")}</span>
              <strong>
                {t(
                  body.sex === "male"
                    ? "Masculino"
                    : body.sex === "female"
                      ? "Femenino"
                      : "Sin datos",
                )}
              </strong>
            </div>
          </div>
          <p className="small muted">
            {body.profileDate
              ? `${t("Datos del")} ${dateLabel(body.profileDate)} · ${body.profileDate.slice(0, 4)}`
              : t(
                  body.age || body.height
                    ? "Datos anteriores de Nutrición, pendientes de confirmar."
                    : "Completa edad, altura, peso y sexo para calcular tus metas.",
                )}
          </p>
          <button className="btn secondary" disabled={!canWrite} onClick={edit}>
            {t(
              profile.bodyProfile
                ? "Actualizar datos personales"
                : "Confirmar datos personales",
            )}
          </button>
        </>
      )}
      <ErrorMessage message={error} />
    </section>
  );
}
function WeightLog() {
  const { data, save, remove } = useData(),
    { body } = useNutrition(),
    { unit, setUnit } = useProfile(),
    { canWrite } = useSubscription();
  const [value, setValue] = useState<WeightRecord | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const start = () => {
    const now = new Date();
    setValue({
      id: crypto.randomUUID(),
      date: localDate(now),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      weight: 0,
    });
    setError("");
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value) return;
    setBusy(true);
    try {
      await save("weights", value);
      setValue(null);
      setError("");
    } catch {
      setError(
        "No se pudo guardar el peso. Revisa la conexión y las reglas de Firestore.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel nutrition-section">
      <div className="section-heading">
        <div>
          <h2>{t("Peso corporal")}</h2>
          <strong className="body-current-weight">
            {body.weight === undefined
              ? "—"
              : numberLabel(fromKg(body.weight, unit), 2)}{" "}
            {unit}
          </strong>
          <p className="small muted">
            {body.weightDate
              ? `${t("Datos del")} ${dateLabel(body.weightDate)} · ${body.weightDate.slice(0, 4)}`
              : t("Sin fecha de peso confirmada")}
          </p>
        </div>
        <Field label={t("Unidad del peso")}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </Field>
      </div>
      {body.legacyWeight && (
        <p className="notice">
          {t(
            "Conservamos tu peso manual anterior. Registra un peso con fecha para actualizarlo en toda la app.",
          )}
        </p>
      )}
      {value ? (
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label={t("Fecha")}>
              <input
                required
                type="date"
                max={localDate()}
                value={value.date}
                onChange={(e) => setValue({ ...value, date: e.target.value })}
              />
            </Field>
            <Field label={t("Hora")}>
              <input
                required
                type="time"
                value={value.time}
                onChange={(e) => setValue({ ...value, time: e.target.value })}
              />
            </Field>
            <Field label={`${t("Peso corporal")} · ${unit}`}>
              <input
                required
                type="number"
                step="any"
                min={fromKg(1, unit)}
                max={fromKg(500, unit)}
                value={
                  value.weight
                    ? Number(fromKg(value.weight, unit).toFixed(4))
                    : ""
                }
                onChange={(e) =>
                  setValue({
                    ...value,
                    weight: toKg(Number(e.target.value), unit),
                  })
                }
              />
            </Field>
          </div>
          <div className="body-actions">
            <button className="btn primary" disabled={busy || !canWrite}>
              {t(busy ? "Guardando…" : "Guardar peso")}
            </button>
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => setValue(null)}
            >
              {t("Cancelar")}
            </button>
          </div>
        </form>
      ) : (
        <button className="btn secondary" disabled={!canWrite} onClick={start}>
          {t("Registrar peso")}
        </button>
      )}
      <ErrorMessage message={error} />
      <details className="weight-history">
        <summary>
          {t("Historial de peso")} · {body.history.length}
        </summary>
        <p className="small muted">
          {t(
            "Incluye los pesos de bioimpedancia. Esos registros se editan en su evaluación original.",
          )}
        </p>
        <div className="weight-records">
          {[...body.history].reverse().map((w) => (
            <div className="weight-record" key={w.id}>
              <span>
                {dateLabel(w.date)} · {w.date.slice(0, 4)} · {w.time}
                <small className="block muted">
                  {t(w.source === "bio" ? "Bioimpedancia" : "Registro de peso")}
                </small>
              </span>
              <strong>
                {numberLabel(fromKg(w.weight, unit), 2)} {unit}
              </strong>
              {w.source === "weight" && (
                <div className="body-actions">
                  <button
                    className="text-button"
                    disabled={!canWrite || busy}
                    onClick={() => {
                      setValue(
                        data.weights!.find((r) => `weight:${r.id}` === w.id)!,
                      );
                      setError("");
                    }}
                  >
                    {t("Editar")}
                  </button>
                  <DeleteButton
                    onDelete={async () => {
                      await remove("weights", w.id.slice(7));
                      if (value?.id === w.id.slice(7)) setValue(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
function BodyOverview() {
  const {
      saved,
      current,
      body,
      save,
      syncing,
      error: loadError,
    } = useNutrition(),
    { canWrite } = useSubscription();
  const base = saved?.preferences ?? {
    ...defaultPreferences(),
    source: "bio" as const,
  };
  const [patch, setPatch] = useState<Partial<typeof base>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const prefs = { ...base, ...patch };
  return (
    <>
      <BodyExplorer
        prefs={prefs}
        inputs={body.inputs}
        targets={current?.targets ?? null}
        onChange={(p) => setPatch((v) => ({ ...v, ...p }))}
      />
      <div className="body-actions">
        <button
          className="btn primary"
          disabled={
            !canWrite ||
            busy ||
            syncing ||
            !!loadError ||
            !Object.keys(patch).length
          }
          onClick={async () => {
            setBusy(true);
            try {
              await save(prefs);
              setPatch({});
              setError("");
            } catch {
              setError("No se pudo guardar el contexto corporal.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {t(busy ? "Guardando…" : "Guardar contexto corporal")}
        </button>
        <a className="text-button" href="#nutrition">
          {t("Ir a Nutrición")}
        </a>
      </div>
      <ErrorMessage message={error || loadError} />
    </>
  );
}
