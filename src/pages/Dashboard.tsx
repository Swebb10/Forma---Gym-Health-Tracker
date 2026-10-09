import NutritionSummary from "../components/nutrition/NutritionSummary";
import { t, useLanguage, getLocale } from "../lib/i18n";
import { nextRoutineDay, dayLabel } from "../lib/training";
import { useState } from "react";
import {
  ArrowUpRight,
  Plus,
  Dumbbell,
  Scale,
  Flame,
  Activity,
  Clock3,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { ProgressChart } from "../components/ProgressChart";
import {
  dateLabel,
  numberLabel,
  localDate,
  exerciseProgress,
  muscleMass,
} from "../lib/metrics";
import type { Page, Routine, RoutineDay, WeightUnit } from "../types";
export default function Dashboard({
  onNavigate,
  onNew,
  onStart,
}: {
  onNavigate: (page: Page) => void;
  onNew: () => void;
  onStart: (r: Routine, day?: RoutineDay) => void;
}) {
  useLanguage();
  const { data } = useData(),
    { demo } = useAuth();
  const [metric, setMetric] = useState("weight"),
    [range, setRange] = useState("90"),
    [exercise, setExercise] = useState(""),
    [strengthUnit, setStrengthUnit] = useState<WeightUnit>("kg");
  const nextDay = data.routines[0]
    ? nextRoutineDay(data.routines[0])
    : undefined;
  const bio = [...data.bioimpedance].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time),
  );
  const last = bio.at(-1);
  const previous = bio.at(-2);
  const since = new Date();
  since.setDate(since.getDate() - Number(range));
  const cutoff = range === "all" ? "0000-00-00" : localDate(since);
  const filtered = bio.filter((b) => b.date >= cutoff);
  const points = filtered.flatMap((r) => {
    const value =
      metric === "weight"
        ? r.weight
        : metric === "fat"
          ? r.bodyFat
          : muscleMass(r);
    return value === undefined ? [] : [{ date: r.date, value }];
  });
  const workouts = [...data.workouts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const names = [
    ...new Set(data.workouts.flatMap((w) => w.exercises.map((e) => e.name))),
  ].sort();
  const chosen = names.includes(exercise) ? exercise : (names[0] ?? "");
  const exerciseData = exerciseProgress(
    data.workouts,
    chosen,
    strengthUnit,
  ).filter((p) => p.date >= cutoff);
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekly = data.workouts.filter(
    (w) => w.date >= localDate(monday) && w.date <= localDate(),
  ).length;
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    return {
      date: localDate(date),
      label: new Intl.DateTimeFormat(getLocale(), { weekday: "narrow" }).format(
        date,
      ),
      number: date.getDate(),
    };
  });
  const cards = [
    {
      label: "Peso corporal",
      value: last?.weight,
      unit: "kg",
      icon: Scale,
      delta: last && previous ? last.weight - previous.weight : undefined,
      note: "respecto al registro anterior",
    },
    {
      label: "Grasa corporal",
      value: last?.bodyFat,
      unit: "%",
      icon: Flame,
      delta: last && previous ? last.bodyFat - previous.bodyFat : undefined,
      note: "puntos porcentuales",
    },
    {
      label: "Músculo esquelético",
      value: last ? muscleMass(last) : undefined,
      unit: "kg",
      icon: Activity,
      note: "estimado a partir de peso × %",
    },
    {
      label: "Entrenamientos",
      value: weekly,
      unit: "sesiones",
      icon: Dumbbell,
      note: "registradas esta semana",
    },
  ];
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">{t("TU PROGRESO, EN PERSPECTIVA")}</span>
          <h1>
            {t("Un poco más fuerte.")}
            <span className="blue"> {t("Cada día.")}</span>
          </h1>
          <p className="muted">
            {t("Así se ve el esfuerzo que estás poniendo en ti.")}
          </p>
        </div>
        <button className="btn primary" onClick={onNew}>
          <Plus size={18} /> {t("Registrar entrenamiento")}
        </button>
      </div>
      {demo && (
        <div className="demo-banner">
          <span className="demo-dot" />
          <span>
            <strong>{t("Estás explorando una demostración.")}</strong>{" "}
            {t(
              "Estos datos son de ejemplo; tus cambios se guardan en esta pestaña.",
            )}
          </span>
        </div>
      )}
      <div className="stats-grid">
        {cards.map((c) => (
          <article className="panel stat-card" key={c.label}>
            <div className="flex justify-between items-center">
              <span className="muted">{t(c.label)}</span>
              <c.icon size={18} className="muted" />
            </div>
            <div className="stat-value">
              {numberLabel(c.value)}
              <span>{t(c.unit)}</span>
            </div>
            <p className="stat-note">
              {c.delta !== undefined && (
                <span className="delta">
                  {c.delta > 0 ? "+" : ""}
                  {numberLabel(c.delta)}{" "}
                </span>
              )}
              {t(c.note)}
            </p>
          </article>
        ))}
      </div>
      <NutritionSummary onOpen={() => onNavigate("nutrition")} />
      <div className="dashboard-grid">
        <div className="main-column">
          <section className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">{t("COMPOSICIÓN CORPORAL")}</span>
                <h3>{t("Pequeños cambios. Progreso real.")}</h3>
              </div>
              <select
                aria-label={t("Período de gráficos")}
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="30">{t("30 días")}</option>
                <option value="90">{t("90 días")}</option>
                <option value="all">{t("Todo")}</option>
              </select>
            </div>
            <div
              className="chart-tabs"
              role="group"
              aria-label={t("Métrica de composición")}
            >
              {[
                { key: "weight", label: "Peso corporal" },
                { key: "fat", label: "Grasa corporal" },
                { key: "muscle", label: "Músculo esquelético" },
              ].map((m) => (
                <button
                  key={m.key}
                  aria-pressed={metric === m.key}
                  className={metric === m.key ? "active" : ""}
                  onClick={() => setMetric(m.key)}
                >
                  {t(m.label)}
                </button>
              ))}
            </div>
            <ProgressChart data={points} unit={metric === "fat" ? "%" : "kg"} />
            {metric === "muscle" && (
              <p className="chart-footnote">
                {t(
                  "Estimación: peso × porcentaje de músculo esquelético. No equivale a masa magra.",
                )}
              </p>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">{t("CONSTANCIA EN MOVIMIENTO")}</span>
                <h3>{t("Últimos entrenamientos")}</h3>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("workouts")}
              >
                {t("Ver todos")} <ArrowUpRight size={16} />
              </button>
            </div>
            {workouts.length ? (
              workouts.slice(0, 3).map((w) => (
                <button
                  className="recent-workout"
                  key={w.id}
                  onClick={() => onNavigate("workouts")}
                >
                  <span className="recent-icon">
                    <Dumbbell size={21} />
                  </span>
                  <span className="grow text-left">
                    <strong>{w.name}</strong>
                    <span className="muted small block">
                      {dateLabel(w.date)} · {w.exercises.length}{" "}
                      {t("ejercicios")}
                    </span>
                  </span>
                  <span className="muted small flex items-center gap-1">
                    <Clock3 size={14} />
                    {w.duration} {t("min")}
                  </span>
                  <ChevronRight size={17} className="muted" />
                </button>
              ))
            ) : (
              <p className="p-6 muted">
                {t("Tu primera sesión aparecerá aquí.")}
              </p>
            )}
          </section>
        </div>
        <aside className="side-column">
          <section className="weekly-card">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{t("ESTA SEMANA")}</span>
              <CalendarDays size={18} />
            </div>
            <h3>{t("Mantén el ritmo.")}</h3>
            <p>
              {weekly ? (
                <strong>
                  {t(
                    weekly === 1
                      ? "{0} sesión registrada esta semana."
                      : "{0} sesiones registradas esta semana.",
                    { 0: weekly },
                  )}
                </strong>
              ) : (
                t("Tu próxima sesión puede ser hoy.")
              )}
            </p>
            <div className="week-days">
              {days.map((d) => (
                <div key={d.date}>
                  <span>{d.label}</span>
                  <span
                    className={
                      data.workouts.some((w) => w.date === d.date)
                        ? "done"
                        : d.date === localDate()
                          ? "today"
                          : ""
                    }
                  >
                    {d.number}
                  </span>
                </div>
              ))}
            </div>
            <div className="week-legend">
              <span /> {t("Día con entrenamiento registrado")}
            </div>
          </section>
          <section className="panel routine-pick">
            <span className="eyebrow">{t("TU PRÓXIMA SESIÓN")}</span>
            {data.routines[0] ? (
              <>
                <div className="routine-pick-icon">
                  <Dumbbell size={34} />
                </div>
                <h3>{data.routines[0].name}</h3>
                <p className="muted">
                  {nextDay && dayLabel(nextDay)} · {nextDay?.exercises.length}{" "}
                  {t("ejercicios")}
                </p>
                <button
                  className="btn secondary w-full"
                  onClick={() => onStart(data.routines[0], nextDay)}
                >
                  {t("Empezar sesión")} <ArrowUpRight size={17} />
                </button>
              </>
            ) : (
              <>
                <h3>{t("Diseña tu rutina")}</h3>
                <p className="muted">
                  {t("Prepara los ejercicios de tu próxima sesión.")}
                </p>
                <button
                  className="btn secondary"
                  onClick={() => onNavigate("routines")}
                >
                  {t("Crear rutina")} <Plus size={16} />
                </button>
              </>
            )}
          </section>
        </aside>
      </div>
      <section className="panel chart-panel strength-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{t("PROGRESO DE FUERZA")}</span>
            <h3>{t("El peso de tu constancia")}</h3>
          </div>
          <select
            aria-label={t("Ejercicio del gráfico")}
            value={chosen}
            onChange={(e) => setExercise(e.target.value)}
          >
            {!names.length && (
              <option value="">{t("Sin ejercicios registrados")}</option>
            )}
            {names.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="strength-unit">
          <label>
            {t("Mostrar pesos en")}{" "}
            <select
              aria-label={t("Unidad del gráfico de fuerza")}
              value={strengthUnit}
              onChange={(e) => setStrengthUnit(e.target.value as WeightUnit)}
            >
              <option value="kg">{t("Kilogramos (kg)")}</option>
              <option value="lb">{t("Libras (lb)")}</option>
            </select>
          </label>
        </div>
        <ProgressChart data={exerciseData} unit={strengthUnit} />
        <p className="chart-footnote">
          {t(
            "Mayor peso registrado por día para el ejercicio seleccionado. Los registros en kg y lb se convierten a la unidad elegida para compararlos.",
          )}
        </p>
      </section>
    </>
  );
}
