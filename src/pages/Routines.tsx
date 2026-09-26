import { useState, type FormEvent } from "react";
import {
  Plus,
  Dumbbell,
  ArrowUpRight,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useData } from "../context/DataContext";
import type { Routine, RoutineDay } from "../types";
import {
  Modal,
  Field,
  Empty,
  FormFooter,
  DeleteButton,
  ErrorMessage,
} from "../components/ui";
import { ExerciseEditor } from "../components/ExerciseEditor";
import { validateExercises, numberLabel } from "../lib/metrics";
import {
  routineDays,
  freshDay,
  weekdays,
  dayLabel,
  exerciseUnit,
} from "../lib/training";
export default function Routines({
  onStart,
}: {
  onStart: (routine: Routine, day?: RoutineDay) => void;
}) {
  const { data, save, remove } = useData();
  const [editing, setEditing] = useState<Routine | null>(null),
    [active, setActive] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const edit = (routine?: Routine) => {
    const day = freshDay();
    const value = routine
      ? {
          ...structuredClone(routine),
          days: structuredClone(routineDays(routine)),
        }
      : {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          exercises: [],
          days: [day],
        };
    setError("");
    setEditing(value);
    setActive(value.days[0].id);
  };
  const days = editing?.days ?? [];
  const selected = days.find((d) => d.id === active) ?? days[0];
  const updateDay = (patch: Partial<RoutineDay>) => {
    if (editing && selected)
      setEditing({
        ...editing,
        days: days.map((d) => (d.id === selected.id ? { ...d, ...patch } : d)),
      });
  };
  function changeDay(id: string) {
    const form = document.querySelector<HTMLFormElement>(".routine-form");
    if (form && !form.reportValidity()) return;
    setActive(id);
  }
  function addDay() {
    if (!editing) return;
    const form = document.querySelector<HTMLFormElement>(".routine-form");
    if (form && !form.reportValidity()) return;
    const day = freshDay(days.length);
    setEditing({ ...editing, days: [...days, day] });
    setActive(day.id);
  }
  function moveDay(direction: number) {
    if (!editing || !selected) return;
    const index = days.findIndex((d) => d.id === selected.id),
      next = index + direction;
    if (next < 0 || next >= days.length) return;
    const moved = [...days];
    [moved[index], moved[next]] = [moved[next], moved[index]];
    setEditing({ ...editing, days: moved });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const invalid = days.find(
      (d) => !d.name.trim() || !validateExercises(d.exercises),
    );
    if (!editing.name.trim() || !days.length || invalid) {
      if (invalid) setActive(invalid.id);
      setError(
        "Cada día necesita un nombre y al menos un ejercicio con series válidas.",
      );
      return;
    }
    const exercises = days.flatMap((d) => d.exercises);
    if (exercises.length > 100) {
      setError("La rutina admite hasta 100 ejercicios en total.");
      return;
    }
    setBusy(true);
    try {
      await save("routines", { ...editing, exercises, days });
      setEditing(null);
    } catch {
      setError(
        "No se pudo guardar la rutina. Revisa tu conexión y los permisos de guardado.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Tu plan, a tu manera</h2>
          <p className="muted">
            Organiza tus rutinas por días y entrena una sesión a la vez.
          </p>
        </div>
        <button className="btn primary" onClick={() => edit()}>
          <Plus size={18} /> Nueva rutina
        </button>
      </div>
      {!data.routines.length ? (
        <Empty
          title="Todo empieza con un plan"
          description="Crea una rutina y organiza sus ejercicios por días."
          onAction={() => edit()}
        />
      ) : (
        <div className="routine-grid">
          {data.routines.map((routine, i) => {
            const sessions = routineDays(routine);
            return (
              <article className="panel routine-card" key={routine.id}>
                <div className="flex items-center justify-between">
                  <span className="routine-symbol">
                    <Dumbbell size={25} />
                  </span>
                  <span className="eyebrow">
                    RUTINA {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{routine.name}</h3>
                <p className="muted">
                  {routine.description ||
                    "Tu plan de entrenamiento personalizado."}
                </p>
                <div className="tags">
                  <span>
                    {sessions.length} {sessions.length === 1 ? "día" : "días"}
                  </span>
                  <span>
                    {sessions.reduce((n, d) => n + d.exercises.length, 0)}{" "}
                    ejercicios
                  </span>
                </div>
                <div className="routine-sessions">
                  {sessions.map((day) => (
                    <section className="routine-session" key={day.id}>
                      <div className="routine-session-heading">
                        <div>
                          <span className="eyebrow">{day.weekday}</span>
                          <h4>{day.name}</h4>
                        </div>
                        <button
                          className="text-button"
                          aria-label={
                            sessions.length === 1
                              ? "Entrenar"
                              : `Entrenar ${dayLabel(day)}`
                          }
                          onClick={() => onStart(routine, day)}
                        >
                          Entrenar <ArrowUpRight size={16} />
                        </button>
                      </div>
                      <details>
                        <summary>
                          {day.exercises.length} ejercicios · Ver detalle
                        </summary>
                        <ul className="routine-list">
                          {day.exercises.map((exercise) => (
                            <li key={exercise.id}>
                              <span>
                                {exercise.name}
                                <small className="block muted">
                                  {exercise.group}
                                </small>
                              </span>
                              <span>
                                {exercise.sets
                                  .map(
                                    (set) =>
                                      `${set.reps} rep × ${numberLabel(set.weight, 2)} ${exerciseUnit(exercise)}`,
                                  )
                                  .join(" · ")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </section>
                  ))}
                </div>
                <div className="routine-footer">
                  <button
                    className="text-button"
                    aria-label={`Editar ${routine.name}`}
                    onClick={() => edit(routine)}
                  >
                    <Pencil size={16} /> Editar rutina
                  </button>
                  <DeleteButton
                    onDelete={() => remove("routines", routine.id)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
      {editing && (
        <Modal
          title={
            data.routines.some((r) => r.id === editing.id)
              ? "Editar rutina"
              : "Nueva rutina"
          }
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form className="routine-form" onSubmit={submit}>
            <div className="form-content">
              <Field label="Nombre de la rutina">
                <input
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Ej. Push, Pull & Legs"
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  maxLength={500}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Enfoque y objetivos del plan"
                />
              </Field>
              <section className="routine-day-editor">
                <div className="day-editor-heading">
                  <h3>Días de entrenamiento</h3>
                  <span className="small muted">{days.length} / 14</span>
                </div>
                <div
                  className="day-tabs"
                  role="group"
                  aria-label="Días de la rutina"
                >
                  {days.map((day, i) => (
                    <button
                      type="button"
                      key={day.id}
                      className={selected?.id === day.id ? "active" : ""}
                      aria-pressed={selected?.id === day.id}
                      onClick={() => changeDay(day.id)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {dayLabel(day)}
                    </button>
                  ))}
                </div>
                {selected && (
                  <div className="day-edit-content">
                    <div className="form-grid">
                      <Field label="Día de la semana">
                        <select
                          value={selected.weekday}
                          onChange={(e) =>
                            updateDay({ weekday: e.target.value })
                          }
                        >
                          {weekdays.map((day) => (
                            <option key={day}>{day}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Nombre de la sesión">
                        <input
                          required
                          maxLength={60}
                          value={selected.name}
                          placeholder="Ej. Push"
                          onChange={(e) => updateDay({ name: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="day-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        disabled={days[0].id === selected.id}
                        aria-label="Mover día antes"
                        onClick={() => moveDay(-1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        disabled={days.at(-1)?.id === selected.id}
                        aria-label="Mover día después"
                        onClick={() => moveDay(1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-button danger ml-auto"
                        disabled={days.length === 1}
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar ${dayLabel(selected)} y sus ejercicios de esta rutina?`,
                            )
                          ) {
                            const remaining = days.filter(
                              (d) => d.id !== selected.id,
                            );
                            setEditing({ ...editing, days: remaining });
                            setActive(remaining[0].id);
                          }
                        }}
                      >
                        <Trash2 size={15} /> Quitar día
                      </button>
                    </div>
                    <ExerciseEditor
                      exercises={selected.exercises}
                      onChange={(exercises) => updateDay({ exercises })}
                    />
                  </div>
                )}
                <button
                  className="btn secondary w-full"
                  type="button"
                  disabled={days.length >= 14}
                  onClick={addDay}
                >
                  <Plus size={17} /> Añadir día
                </button>
              </section>
              <ErrorMessage message={error} />
            </div>
            <FormFooter busy={busy} onClose={() => setEditing(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
