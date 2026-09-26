import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";
import type { Workout, Routine, RoutineDay } from "../types";
import { Modal, Field, FormFooter, ErrorMessage } from "./ui";
import { ExerciseEditor } from "./ExerciseEditor";
import { localDate, validateExercises } from "../lib/metrics";
import {
  routineDays,
  nextRoutineDay,
  dayLabel,
  freshExercise,
} from "../lib/training";
export function routineSession(
  routine: Routine,
  day = nextRoutineDay(routine),
) {
  return {
    routineId: routine.id,
    routineDayId: day.id,
    name: `${routine.name} · ${day.name}`.slice(0, 100),
    exercises: structuredClone(day.exercises),
  };
}
export function WorkoutForm({
  initial,
  onClose,
}: {
  initial: Workout;
  onClose: () => void;
}) {
  const { data, save } = useData();
  const [value, setValue] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const routine = data.routines.find((r) => r.id === value.routineId);
  const sessions = routine ? routineDays(routine) : [];
  const selectedExists = sessions.some((d) => d.id === value.routineDayId);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.name.trim() || !validateExercises(value.exercises)) {
      setError("Añade un nombre y al menos un ejercicio con series válidas.");
      return;
    }
    setBusy(true);
    try {
      await save("workouts", value);
      onClose();
    } catch {
      setError(
        "No se pudo guardar el entrenamiento. Revisa tu conexión y los permisos de guardado.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Registrar entrenamiento"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-content">
          <Field label="Usar una rutina">
            <select
              value={value.routineId ?? ""}
              onChange={(event) => {
                const r = data.routines.find(
                  (r) => r.id === event.target.value,
                );
                setValue({
                  ...value,
                  ...(r
                    ? routineSession(r)
                    : { routineId: null, routineDayId: null }),
                });
              }}
            >
              <option value="">Entrenamiento libre</option>
              {value.routineId && !routine && (
                <option value={value.routineId}>
                  Rutina eliminada · sesión conservada
                </option>
              )}
              {data.routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          {routine && (
            <Field label="Día de la rutina">
              <select
                value={selectedExists ? (value.routineDayId ?? "") : ""}
                onChange={(event) => {
                  const day = sessions.find((d) => d.id === event.target.value);
                  if (day)
                    setValue({ ...value, ...routineSession(routine, day) });
                }}
              >
                {!selectedExists && (
                  <option value="">
                    Sesión guardada · conservar ejercicios
                  </option>
                )}
                {sessions.map((day) => (
                  <option key={day.id} value={day.id}>
                    {dayLabel(day)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Nombre de la sesión">
            <input
              required
              maxLength={100}
              value={value.name}
              onChange={(e) => setValue({ ...value, name: e.target.value })}
            />
          </Field>
          <div className="form-grid">
            <Field label="Fecha">
              <input
                type="date"
                required
                max={localDate()}
                value={value.date}
                onChange={(e) => setValue({ ...value, date: e.target.value })}
              />
            </Field>
            <Field label="Duración · minutos">
              <input
                type="number"
                min="1"
                max="1440"
                step="1"
                required
                value={value.duration || ""}
                onChange={(e) =>
                  setValue({ ...value, duration: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <ExerciseEditor
            exercises={value.exercises}
            onChange={(exercises) => setValue({ ...value, exercises })}
          />
          <Field label="Notas de la sesión">
            <textarea
              maxLength={1000}
              value={value.notes}
              onChange={(e) => setValue({ ...value, notes: e.target.value })}
              placeholder="¿Cómo te sentiste hoy?"
            />
          </Field>
          <ErrorMessage message={error} />
        </div>
        <FormFooter busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}
export const newWorkout = (routine?: Routine, day?: RoutineDay): Workout => ({
  id: crypto.randomUUID(),
  date: localDate(),
  routineId: null,
  name: "Entrenamiento libre",
  duration: 45,
  notes: "",
  exercises: [freshExercise()],
  ...(routine ? routineSession(routine, day) : {}),
});
