import { useState } from "react";
import { Plus, Clock3, Dumbbell, Pencil, ChevronDown } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Workout } from "../types";
import { Empty, DeleteButton } from "../components/ui";
import { dateLabel, volume, numberLabel } from "../lib/metrics";
import { WorkoutForm } from "../components/WorkoutForm";
export default function Workouts({ onNew }: { onNew: () => void }) {
  const { data, remove } = useData();
  const [editing, setEditing] = useState<Workout | null>(null),
    [filter, setFilter] = useState("");
  const sorted = [...data.workouts]
    .filter((w) => !filter || w.date.startsWith(filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Cada sesión cuenta</h2>
          <p className="muted">El trabajo de hoy es el progreso de mañana.</p>
        </div>
        <button className="btn primary" onClick={onNew}>
          <Plus size={18} /> Registrar sesión
        </button>
      </div>
      <div className="filter-bar">
        <label className="flex items-center gap-3">
          Filtrar por mes{" "}
          <input
            aria-label="Filtrar por mes"
            type="month"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        {filter && (
          <button className="text-button" onClick={() => setFilter("")}>
            Ver todo
          </button>
        )}
        <span className="muted ml-auto">{sorted.length} sesiones</span>
      </div>
      {!sorted.length ? (
        <Empty
          title="Sin entrenamientos en este período"
          description="Registra una sesión para empezar a ver tu evolución."
          onAction={onNew}
        />
      ) : (
        <div className="workout-list">
          {sorted.map((w) => (
            <article className="panel workout-card" key={w.id}>
              <div className="workout-summary">
                <div className="date-block">
                  <strong>{new Date(w.date + "T12:00:00").getDate()}</strong>
                  <span>{dateLabel(w.date).split(" ").slice(1).join(" ")}</span>
                </div>
                <div className="grow">
                  <h3>{w.name}</h3>
                  <div className="workout-meta">
                    <span>
                      <Dumbbell size={14} />
                      {w.exercises.length} ejercicios
                    </span>
                    <span>
                      <Clock3 size={14} />
                      {w.duration} min
                    </span>
                    <span>{numberLabel(volume(w), 0)} kg de volumen</span>
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Editar sesión del ${w.date}`}
                  onClick={() => setEditing(structuredClone(w))}
                >
                  <Pencil size={17} />
                </button>
                <DeleteButton onDelete={() => remove("workouts", w.id)} />
              </div>
              <details>
                <summary>
                  Ver ejercicios y series <ChevronDown size={15} />
                </summary>
                <div className="workout-details">
                  {w.exercises.map((e) => (
                    <div key={e.id}>
                      <strong>{e.name}</strong>
                      <p className="muted">
                        {e.sets
                          .map(
                            (s, i) =>
                              `Serie ${i + 1}: ${s.reps} rep × ${s.weight} kg`,
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
