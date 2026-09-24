import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";
import type { Workout, Routine } from "../types";
import { Modal, Field, FormFooter, ErrorMessage } from "./ui";
import { ExerciseEditor, freshExercise } from "./ExerciseEditor";
import { localDate, validateExercises } from "../lib/metrics";
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
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.name.trim() || !validateExercises(value.exercises)) {
      setError("Añade un nombre y al menos un ejercicio con series válidas.");
      return;
    }
    setBusy(true);
    try {
      await save("workouts", value);
      onClose();
    } catch {
      setError("No se pudo guardar el entrenamiento. Revisa tu conexión.");
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
              onChange={(e) => {
                const r = data.routines.find((r) => r.id === e.target.value);
                setValue({
                  ...value,
                  routineId: r?.id ?? null,
                  ...(r
                    ? { name: r.name, exercises: structuredClone(r.exercises) }
                    : {}),
                });
              }}
            >
              <option value="">Entrenamiento libre</option>
              {data.routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
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
export const newWorkout = (routine?: Routine): Workout => ({
  id: crypto.randomUUID(),
  date: localDate(),
  routineId: routine?.id ?? null,
  name: routine?.name ?? "Entrenamiento libre",
  duration: 45,
  notes: "",
  exercises: routine ? structuredClone(routine.exercises) : [freshExercise()],
});
