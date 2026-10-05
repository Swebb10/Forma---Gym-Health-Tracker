import { t, useLanguage } from "../lib/i18n";
import { exerciseUnit } from "../lib/training";
import { useState } from "react";
import { Plus, Clock3, Dumbbell, Pencil, ChevronDown } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Workout, WeightUnit } from "../types";
import { Empty, DeleteButton } from "../components/ui";
import { monthLabel, volume, numberLabel } from "../lib/metrics";
import { WorkoutForm } from "../components/WorkoutForm";
export default function Workouts({ onNew }: { onNew: () => void }) {
  useLanguage();
  const { data, remove } = useData();
  const [editing, setEditing] = useState<Workout | null>(null),
    [filter, setFilter] = useState(""),
    [unit, setUnit] = useState<WeightUnit>("kg");
  const sorted = [...data.workouts]
    .filter((w) => !filter || w.date.startsWith(filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>{t("Cada sesión cuenta")}</h2>
          <p className="muted">
            {t("El trabajo de hoy es el progreso de mañana.")}
          </p>
        </div>
        <button className="btn primary" onClick={onNew}>
          <Plus size={18} /> {t("Registrar sesión")}
        </button>
      </div>
      <div className="filter-bar">
        <label className="flex items-center gap-3">
          {t("Filtrar por mes")}{" "}
          <input
            aria-label={t("Filtrar por mes")}
            type="month"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        {filter && (
          <button className="text-button" onClick={() => setFilter("")}>
            {t("Ver todo")}
          </button>
        )}
        <label className="volume-unit">
          {t("Unidad del volumen")}{" "}
          <select
            aria-label={t("Unidad del volumen")}
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>
        <span className="muted ml-auto">
          {sorted.length} {t("sesiones")}
        </span>
      </div>
      {!sorted.length ? (
        <Empty
          title={t("Sin entrenamientos en este período")}
          description={t(
            "Registra una sesión para empezar a ver tu evolución.",
          )}
          onAction={onNew}
        />
      ) : (
        <div className="workout-list">
          {sorted.map((w) => (
            <article className="panel workout-card" key={w.id}>
              <div className="workout-summary">
                <div className="date-block">
                  <strong>{new Date(w.date + "T12:00:00").getDate()}</strong>
                  <span>{monthLabel(w.date)}</span>
                </div>
                <div className="grow">
                  <h3>{w.name}</h3>
                  <div className="workout-meta">
                    <span>
                      <Dumbbell size={14} />
                      {w.exercises.length} {t("ejercicios")}
                    </span>
                    <span>
                      <Clock3 size={14} />
                      {w.duration} {t("min")}
                    </span>
                    <span>
                      {numberLabel(volume(w, unit), 1)} {unit} {t("de volumen")}
                    </span>
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={t("Editar sesión del {0}", { "0": w.date })}
                  onClick={() => setEditing(structuredClone(w))}
                >
                  <Pencil size={17} />
                </button>
                <DeleteButton onDelete={() => remove("workouts", w.id)} />
              </div>
              <details>
                <summary>
                  {t("Ver ejercicios y series")} <ChevronDown size={15} />
                </summary>
                <div className="workout-details">
                  {w.exercises.map((e) => (
                    <div key={e.id}>
                      <strong>{e.name}</strong>
                      <p className="muted">
                        {e.sets
                          .map((s, i) =>
                            t("Serie {0}: {1} rep × {2} {3}", {
                              "0": i + 1,
                              "1": s.reps,
                              "2": numberLabel(s.weight, 2),
                              "3": exerciseUnit(e),
                            }),
                          )
                          .join(" · ")}
                      </p>
                    </div>
                  ))}
                  {w.notes && <p>{w.notes}</p>}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <WorkoutForm initial={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
