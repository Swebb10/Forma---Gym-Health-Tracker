import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  availableExercises,
  exerciseHistory,
  exerciseTotals,
  normalizedSets,
  seriesPoints,
  progressAdvice,
  trainingContext,
  type ExerciseSession,
} from "../../lib/setProgress";
import { noteSources } from "../../lib/noteCoach";
import { t, useLanguage } from "../../lib/i18n";
import { numberLabel, dateLabel } from "../../lib/metrics";
import { fromKg, toKg } from "../../lib/training";
import type { WeightUnit } from "../../types";
import { Field } from "../ui";
import SetComparison from "./SetComparison";
import NotesCoach from "./NotesCoach";
import "./trainingProgress.css";
const date = (d: string) => dateLabel(d) + " · " + d.slice(0, 4);
export default function WorkoutProgress({
  initialExercise = "",
}: {
  initialExercise?: string;
}) {
  useLanguage();
  const { data, loading, error } = useData();
  const options = availableExercises(data.workouts);
  const [selection, setSelection] = useState(initialExercise);
  const choice = options.find((o) => o.key === selection) ?? options[0];
  const history = choice ? exerciseHistory(data.workouts, choice.key) : [];
  return (
    <section className="panel training-progress">
      <header className="training-progress-heading">
        <div>
          <span className="eyebrow">{t("CADA SERIE CUENTA")}</span>
          <h2>{t("Tu progreso, serie por serie")}</h2>
          <p className="muted">
            {t(
              "El mismo peso máximo puede esconder una gran mejora en las demás series.",
            )}
          </p>
        </div>
        <TrendingUp size={28} className="blue" />
      </header>
      {loading ? (
        <p>{t("Cargando…")}</p>
      ) : error ? (
        <p className="error">{t(error)}</p>
      ) : !choice ? (
        <p className="notice">
          {t(
            "Registra un entrenamiento para comenzar la comparación por series.",
          )}
        </p>
      ) : (
        <>
          <Field label={t("Ejercicio para comparar")}>
            <select
              value={choice.key}
              onChange={(e) => setSelection(e.target.value)}
            >
              {options.map((o) => (
                <option value={o.key} key={o.key}>
                  {o.name} · {t(o.group)}
                  {o.occurrence > 0
                    ? ` · ${t("Bloque {0}", { 0: o.occurrence + 1 })}`
                    : ""}
                </option>
              ))}
            </select>
          </Field>
          <p className="small muted">
            {t(
              "El catálogo conecta los nombres del mismo ejercicio entre idiomas. Las variantes y los bloques repetidos se comparan por separado.",
            )}
          </p>
          <ExerciseHistory key={choice.key} history={history} />
        </>
      )}
    </section>
  );
}
function ExerciseHistory({ history }: { history: ExerciseSession[] }) {
  const { data } = useData();
  const [context, setContext] = useState("all"),
    [session, setSession] = useState("");
  const contexts = new Map(
    history.map((h) => [trainingContext(h.workout), h.workout.name]),
  );
  const filtered = history.filter(
    (h) => context === "all" || trainingContext(h.workout) === context,
  );
  const current = filtered.find((h) => h.key === session) ?? filtered[0];
  if (!current) return <p>{t("Sin entrenamientos en este período")}</p>;
  const label = (h: ExerciseSession, i: number) =>
    `${date(h.workout.date)} · ${h.workout.name} · #${i + 1}`;
  return (
    <>
      <div className="form-grid">
        <Field label={t("Contexto del entrenamiento")}>
          <select
            value={context}
            onChange={(e) => {
              setContext(e.target.value);
              setSession("");
            }}
          >
            <option value="all">{t("Todos los entrenamientos")}</option>
            {[...contexts].map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Sesión seleccionada")}>
          <select
            value={current.key}
            onChange={(e) => setSession(e.target.value)}
          >
            {filtered.map((h, i) => (
              <option key={h.key} value={h.key}>
                {label(h, i)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <SessionAnalysis key={current.key} current={current} history={filtered} />
      <NotesCoach sources={noteSources(data.workouts, current.workout)} />
    </>
  );
}
function SessionAnalysis({
  current,
  history,
}: {
  current: ExerciseSession;
  history: ExerciseSession[];
}) {
  const candidates = history.filter(
    (h) => h.key !== current.key && h.workout.date <= current.workout.date,
  );
  const automatic = candidates.find(
    (h) =>
      h.workout.date < current.workout.date &&
      trainingContext(h.workout) === trainingContext(current.workout),
  );
  const [previousKey, setPreviousKey] = useState<string | null>(null),
    [unit, setUnit] = useState<WeightUnit>("kg");
  const previous =
    previousKey === null
      ? automatic
      : candidates.find((h) => h.key === previousKey);
  const [series, setSeries] = useState(0);
  const [targetKg, setTargetKg] = useState(
      exerciseTotals(current.exercise).max,
    ),
    [targetReps, setTargetReps] = useState(
      normalizedSets(current.exercise)[0]?.reps ?? 8,
    );
  const validTarget =
    Number.isFinite(targetKg) &&
    targetKg >= 0 &&
    Number.isInteger(targetReps) &&
    targetReps > 0;
  const now = exerciseTotals(
      current.exercise,
      validTarget ? targetKg : undefined,
      validTarget ? targetReps : undefined,
    ),
    before = previous
      ? exerciseTotals(previous.exercise, targetKg, targetReps)
      : undefined;
  const seriesCount = Math.max(
    ...history.map((h) => normalizedSets(h.exercise).length),
    1,
  );
  const chosenSeries = Math.min(series, seriesCount - 1);
  const points = seriesPoints(history, chosenSeries, unit);
  return (
    <>
      <div className="form-grid">
        <Field label={t("Sesión de referencia")}>
          <select
            value={previous?.key ?? ""}
            onChange={(e) => setPreviousKey(e.target.value)}
          >
            <option value="">{t("Sin comparación")}</option>
            {candidates.map((h, i) => (
              <option key={h.key} value={h.key}>
                {date(h.workout.date)} · {h.workout.name} · #{i + 1}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Mostrar pesos en")}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </Field>
      </div>
      <p className="small muted">
        {t(
          "La referencia automática es una fecha anterior del mismo entrenamiento. Si hay varias sesiones en un día, elige cuál comparar; no suponemos su hora.",
        )}
      </p>
      <div className="series-kpis">
        <div>
          <span>{t("Peso máximo")}</span>
          <strong>
            {numberLabel(fromKg(now.max, unit), 2)} <small>{unit}</small>
          </strong>
          {before && (
            <small>
              {t("Antes: {0}", {
                0: `${numberLabel(fromKg(before.max, unit), 2)} ${unit}`,
              })}
            </small>
          )}
        </div>
        <div>
          <span>{t("Volumen del ejercicio")}</span>
          <strong>
            {numberLabel(fromKg(now.volume, unit), 0)}{" "}
            <small>
              {unit}·{t("rep")}
            </small>
          </strong>
          {before && (
            <small>
              {t("Antes: {0}", {
                0: numberLabel(fromKg(before.volume, unit), 0),
              })}
              {before.volume > 0 &&
                ` · ${now.volume >= before.volume ? "+" : ""}${numberLabel((now.volume / before.volume - 1) * 100, 1)}%`}
            </small>
          )}
        </div>
        <div>
          <span>{t("Repeticiones totales")}</span>
          <strong>{numberLabel(now.reps, 0)}</strong>
          {before && <small>{t("Antes: {0}", { 0: before.reps })}</small>}
        </div>
      </div>
      <div className="series-target">
        <div>
          <h3>{t("¿Cuántas series sostuviste?")}</h3>
          <p className="small muted">
            {t(
              "Cuenta las series que alcanzan al menos este peso y estas repeticiones.",
            )}
          </p>
        </div>
        <div className="form-grid">
          <Field label={t("Peso de referencia") + ` · ${unit}`}>
            <input
              type="number"
              min="0"
              step="any"
              value={Number(fromKg(targetKg, unit).toFixed(3))}
              onChange={(e) => setTargetKg(toKg(Number(e.target.value), unit))}
            />
          </Field>
          <Field label={t("Repeticiones de referencia")}>
            <input
              type="number"
              min="1"
              max="1000"
              step="1"
              value={targetReps || ""}
              onChange={(e) => setTargetReps(Number(e.target.value))}
            />
          </Field>
        </div>
        <p className="series-target-result" data-testid="series-benchmark">
          {validTarget
            ? t("{0} de {1} series", { 0: now.matched, 1: now.count })
            : t("Revisa el peso y las repeticiones de referencia.")}
          {before && validTarget && (
            <small>
              {t("Antes: {0}", {
                0: t("{0} de {1} series", {
                  0: before.matched,
                  1: before.count,
                }),
              })}
            </small>
          )}
        </p>
      </div>
      <SetComparison
        current={current.exercise}
        previous={previous?.exercise}
        unit={unit}
      />
      <p className="small muted">
        {t(
          "La serie 1 se compara con la serie 1. Conserva el orden y distingue calentamientos y variantes en tus registros. Una serie ausente no cuenta como cero.",
        )}
      </p>
      <p className="notice">
        {t(progressAdvice(current.exercise, previous?.exercise))}
      </p>
      <div className="series-chart-head">
        <h3>{t("Historial de una serie")}</h3>
        <div>
          <Field label={t("Serie del gráfico")}>
            <select
              value={chosenSeries}
              onChange={(e) => setSeries(Number(e.target.value))}
            >
              {Array.from({ length: seriesCount }, (_, i) => (
                <option key={i} value={i}>
                  {t("Serie {0}", { 0: i + 1 })}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <div className="series-chart-legend">
        <span>
          <i className="weight-line" />
          {t("Peso")} ({unit})
        </span>
        <span>
          <i className="reps-line" />
          {t("Repeticiones")}
        </span>
      </div>
      <p className="small muted">
        {t(
          "Peso en el eje izquierdo y repeticiones en el derecho. Cada línea tiene su propia escala.",
        )}
      </p>
      <div
        className="series-chart"
        role="img"
        aria-label={t("Historial de peso y repeticiones de la serie {0}", {
          0: chosenSeries + 1,
        })}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ top: 15, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 5"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="order"
              tickFormatter={(n) =>
                points[Number(n)] ? dateLabel(points[Number(n)].date) : ""
              }
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              minTickGap={25}
            />
            <YAxis
              yAxisId="weight"
              width={45}
              domain={[0, "auto"]}
              tickFormatter={(n) => numberLabel(Number(n))}
              tick={{ fill: "var(--blue)", fontSize: 11 }}
            />
            <YAxis
              yAxisId="reps"
              orientation="right"
              width={35}
              domain={[0, "auto"]}
              allowDecimals={false}
              tickFormatter={(n) => numberLabel(Number(n), 0)}
              tick={{ fill: "var(--series-reps)", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(n) =>
                points[Number(n)]
                  ? `${date(points[Number(n)].date)} · ${points[Number(n)].name}`
                  : ""
              }
              formatter={(v, name) => [
                `${numberLabel(Number(v), name === "weight" ? 2 : 0)} ${name === "weight" ? unit : t("rep")}`,
                name === "weight" ? t("Peso") : t("Repeticiones"),
              ]}
              contentStyle={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            />
            <Line
              yAxisId="weight"
              dataKey="weight"
              name="weight"
              type="linear"
              stroke="var(--blue)"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="reps"
              dataKey="reps"
              name="reps"
              type="linear"
              stroke="var(--series-reps)"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="series-history">
        <summary>{t("Ver datos del gráfico")}</summary>
        <ul>
          {points.map((p) => (
            <li key={p.key}>
              <span>
                {date(p.date)} · {p.name}
              </span>
              <strong>
                {p.weight === null || p.reps === null
                  ? t("Sin serie")
                  : `${numberLabel(p.weight, 2)} ${unit} × ${numberLabel(p.reps, 0)} ${t("rep")}`}
              </strong>
            </li>
          ))}
        </ul>
      </details>
      <p className="small muted">
        {t(
          "Volumen = peso × repeticiones. No mide por sí solo fuerza o crecimiento muscular; la técnica, el rango y el equipo también importan.",
        )}
      </p>
    </>
  );
}
