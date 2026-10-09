import { useState, type FormEvent } from "react";
import { Utensils, Check, Save, Info } from "lucide-react";
import { useData } from "../context/DataContext";
import { useNutrition } from "../context/NutritionContext";
import { t, useLanguage } from "../lib/i18n";
import {
  activities,
  goals,
  defaultPreferences,
  resolveInputs,
  calculateNutrition,
  latestRecords,
  type NutritionPreferences,
} from "../lib/nutrition";
import { localDate, dateLabel, numberLabel } from "../lib/metrics";
import { allMeasurementFields } from "../lib/measurements";
import { fromKg, toKg } from "../lib/training";
import type { WeightUnit } from "../types";
import { Field, ErrorMessage } from "../components/ui";
import MacroTargets from "../components/nutrition/MacroTargets";
import FoodGuide from "../components/nutrition/FoodGuide";
export default function Nutrition() {
  useLanguage();
  const { loading, error, retry } = useNutrition();
  if (loading) return <div className="loading">{t("Cargando…")}</div>;
  return (
    <div className="nutrition-page">
      <header className="section-heading">
        <div>
          <span className="eyebrow">{t("NUTRICIÓN A TU MEDIDA")}</span>
          <h1>{t("Alimenta tu progreso")}</h1>
          <p className="muted">
            {t("Un objetivo claro. Una guía para cada día.")}
          </p>
        </div>
        <Utensils className="blue" size={32} />
      </header>
      {error && (
        <div className="notice">
          <ErrorMessage message={error} />
          <button className="text-button" onClick={retry}>
            {t("Reintentar")}
          </button>
        </div>
      )}
      <NutritionEditor />
      <FoodGuide />
    </div>
  );
}
function NutritionEditor() {
  useLanguage();
  const { data } = useData(),
    { saved, save, syncing, error: profileError } = useNutrition();
  const latest = latestRecords(data.bioimpedance, data.measurements);
  const [prefs, setPrefs] = useState<NutritionPreferences>(
    () => saved?.preferences ?? defaultPreferences(latest.bio),
  );
  const [unit, setUnit] = useState<WeightUnit>("kg"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const set = (patch: Partial<NutritionPreferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    setMessage("");
    setError("");
  };
  const inputs = resolveInputs(prefs, latest.bio),
    result = calculateNutrition(inputs, prefs);
  const values = prefs.source === "bio" ? latest.bio : prefs.manual;
  const setNumber = (key: "age" | "height" | "weight", value: string) =>
    set({
      manual: {
        age: prefs.manual?.age ?? 0,
        height: prefs.manual?.height ?? 0,
        weight: prefs.manual?.weight ?? 0,
        [key]:
          value === ""
            ? 0
            : key === "weight"
              ? Math.round(toKg(Number(value), unit) * 1000000) / 1000000
              : Number(value),
      },
    });
  const selectedGoal = goals.find((g) => g.id === prefs.goal)!;
  const selectedActivity = activities.find((a) => a.id === prefs.activity)!;
  const oldBio =
    latest.bio &&
    (Date.parse(localDate() + "T12:00:00") -
      Date.parse(latest.bio.date + "T12:00:00")) /
      86400000 >
      90;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await save(prefs);
      setMessage("Objetivo y metas guardados en tu perfil.");
    } catch {
      setError(
        "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={submit} className="nutrition-layout">
        <div className="nutrition-settings">
          <section className="panel nutrition-section">
            <h2>{t("Tu objetivo principal")}</h2>
            <div
              className="goal-grid"
              role="group"
              aria-label={t("Tu objetivo principal")}
            >
              {goals.map((goal) => (
                <button
                  type="button"
                  key={goal.id}
                  className={
                    "goal-card " + (prefs.goal === goal.id ? "selected" : "")
                  }
                  aria-pressed={prefs.goal === goal.id}
                  onClick={() => set({ goal: goal.id })}
                >
                  <span>{t(goal.label)}</span>
                  <small>
                    {goal.adjustment > 0 ? "+" : ""}
                    {numberLabel(goal.adjustment * 100, 0)}%{" "}
                    {t("sobre mantenimiento")}
                  </small>
                  {prefs.goal === goal.id && <Check size={17} />}
                </button>
              ))}
            </div>
          </section>
          <section className="panel nutrition-section">
            <h2>{t("Datos para el cálculo")}</h2>
            <Field label={t("Origen de los datos")}>
              <select
                value={prefs.source}
                onChange={(e) =>
                  set({
                    source: e.target.value as NutritionPreferences["source"],
                    manual:
                      prefs.manual ??
                      (latest.bio
                        ? {
                            age: latest.bio.age,
                            height: latest.bio.height,
                            weight: latest.bio.weight,
                          }
                        : null),
                  })
                }
              >
                <option value="bio">
                  {t("Última bioimpedancia · actualización automática")}
                </option>
                <option value="manual">{t("Datos manuales")}</option>
              </select>
            </Field>
            {prefs.source === "bio" && (
              <p className="small muted">
                {latest.bio
                  ? t(
                      "Evaluación del {0}. La edad es la registrada en esa fecha.",
                      {
                        0:
                          dateLabel(latest.bio.date) +
                          " " +
                          latest.bio.date.slice(0, 4),
                      },
                    )
                  : t(
                      "Aún no tienes bioimpedancia. Usa datos manuales para empezar.",
                    )}
              </p>
            )}
            {prefs.source === "bio" && oldBio && (
              <p className="notice">
                {t(
                  "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.",
                )}
              </p>
            )}
            <div className="form-grid">
              <Field label={t("Edad · años")}>
                <input
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  required
                  readOnly={prefs.source === "bio"}
                  value={values?.age || ""}
                  onChange={(e) => setNumber("age", e.target.value)}
                />
              </Field>
              <Field label={t("Altura · cm")}>
                <input
                  type="number"
                  min="100"
                  max="250"
                  step=".1"
                  required
                  readOnly={prefs.source === "bio"}
                  value={values?.height || ""}
                  onChange={(e) => setNumber("height", e.target.value)}
                />
              </Field>
              <Field label={t("Peso corporal") + " · " + unit}>
                <input
                  type="number"
                  min={fromKg(30, unit)}
                  max={fromKg(300, unit)}
                  step="any"
                  required
                  readOnly={prefs.source === "bio"}
                  value={
                    values?.weight
                      ? Number(fromKg(values.weight, unit).toFixed(3))
                      : ""
                  }
                  onChange={(e) => setNumber("weight", e.target.value)}
                />
              </Field>
              <Field label={t("Unidad del peso")}>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                >
                  <option value="kg">{t("Kilogramos (kg)")}</option>
                  <option value="lb">{t("Libras (lb)")}</option>
                </select>
              </Field>
              <Field label={t("Sexo utilizado en la fórmula")}>
                <select
                  value={prefs.sex}
                  required
                  onChange={(e) =>
                    set({ sex: e.target.value as NutritionPreferences["sex"] })
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
                "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.",
              )}
            </p>
            <Field label={t("Actividad habitual")}>
              <select
                value={prefs.activity}
                onChange={(e) =>
                  set({
                    activity: e.target
                      .value as NutritionPreferences["activity"],
                  })
                }
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {t(a.label)}
                  </option>
                ))}
              </select>
            </Field>
            <p className="small muted">
              {t(
                "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.",
              )}
            </p>
            <label className="nutrition-check">
              <input
                type="checkbox"
                checked={prefs.specialCase}
                onChange={(e) => set({ specialCase: e.target.checked })}
              />
              <span>
                {t(
                  "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos",
                )}
              </span>
            </label>
          </section>
        </div>
        <section className="panel nutrition-section nutrition-estimate">
          <span className="eyebrow">{t("TU PUNTO DE PARTIDA")}</span>
          <h2>{t("Metas diarias estimadas")}</h2>
          <p className="small muted">
            {t("Vista previa · guarda para aplicar a tu perfil")}
          </p>
          {result.targets ? (
            <>
              <MacroTargets targets={result.targets} />
              <dl className="nutrition-math">
                <div>
                  <dt>{t("Gasto en reposo")}</dt>
                  <dd>{numberLabel(result.targets.resting, 0)} kcal</dd>
                </div>
                <div>
                  <dt>{t("Mantenimiento estimado")}</dt>
                  <dd>{numberLabel(result.targets.maintenance, 0)} kcal</dd>
                </div>
                <div>
                  <dt>{t("Factor de actividad")}</dt>
                  <dd>× {numberLabel(selectedActivity.factor, 3)}</dd>
                </div>
                <div>
                  <dt>{t("Ajuste del objetivo")}</dt>
                  <dd>
                    {selectedGoal.adjustment > 0 ? "+" : ""}
                    {numberLabel(selectedGoal.adjustment * 100, 0)}%
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="notice" role="status">
              {t(result.issue)}
            </p>
          )}
          <p className="small muted">
            <Info size={14} />
            {t(
              "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.",
            )}
          </p>
          <button
            className="btn primary w-full"
            disabled={
              busy ||
              syncing ||
              Boolean(profileError) ||
              !inputs ||
              !values?.age ||
              !values?.height ||
              !values?.weight
            }
          >
            <Save size={17} />
            {t(busy ? "Guardando…" : "Guardar objetivo y metas")}
          </button>
          {syncing && (
            <p className="small muted" role="status">
              {t("Actualizando metas con tus últimos registros…")}
            </p>
          )}
          <ErrorMessage message={error} />
          {message && (
            <p className="success" role="status">
              {t(message)}
            </p>
          )}
          <details className="nutrition-method">
            <summary>{t("Cómo se calcula")}</summary>
            <p>
              {t(
                "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).",
              )}
            </p>
            <p>
              {t(
                "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.",
              )}
            </p>
            <p>
              {t(
                "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.",
              )}
            </p>
            <p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/2305711/"
                target="_blank"
                rel="noreferrer"
              >
                Mifflin–St Jeor
              </a>{" "}
              ·{" "}
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/"
                target="_blank"
                rel="noreferrer"
              >
                ISSN
              </a>{" "}
              ·{" "}
              <a
                href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-macronutrients.html"
                target="_blank"
                rel="noreferrer"
              >
                DRI
              </a>
            </p>
          </details>
        </section>
      </form>
      <section className="panel nutrition-section">
        <h2>{t("Tu contexto corporal")}</h2>
        <p className="muted">
          {t(
            "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.",
          )}
        </p>
        <div className="nutrition-context">
          <div>
            <span>{t("Grasa corporal")}</span>
            <strong>{numberLabel(latest.bio?.bodyFat)} %</strong>
          </div>
          <div>
            <span>{t("Músculo esquelético")}</span>
            <strong>{numberLabel(latest.bio?.skeletalMuscle)} %</strong>
          </div>
          <div>
            <span>{t("Masa corporal magra")}</span>
            <strong>{numberLabel(latest.bio?.leanMass)} kg</strong>
          </div>
        </div>
        <p className="small muted">
          {latest.bio
            ? t("Bioimpedancia del {0}", {
                0:
                  dateLabel(latest.bio.date) +
                  " " +
                  latest.bio.date.slice(0, 4),
              })
            : t("Sin bioimpedancia registrada")}
        </p>
        <details>
          <summary>
            {latest.measurement
              ? t("Medidas corporales del {0}", {
                  0:
                    dateLabel(latest.measurement.date) +
                    " " +
                    latest.measurement.date.slice(0, 4),
                })
              : t("Sin medidas corporales registradas")}
          </summary>
          <dl className="nutrition-measures">
            {allMeasurementFields
              .filter((f) => typeof latest.measurement?.[f.key] === "number")
              .map((f) => (
                <div key={f.key}>
                  <dt>{t(f.label)}</dt>
                  <dd>{numberLabel(latest.measurement![f.key])} cm</dd>
                </div>
              ))}
          </dl>
        </details>
      </section>
    </>
  );
}
