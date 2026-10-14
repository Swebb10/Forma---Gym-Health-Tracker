import { t, useLanguage } from "../lib/i18n";
import { useEffect, useState, type FormEvent } from "react";
import { useWorkoutDraft } from "../context/WorkoutDraftContext";
import { prepareWorkout, completedWorkout } from "../lib/workoutDraft";
import { useData } from "../context/DataContext";
import type { Workout, Routine, RoutineDay } from "../types";
import { Modal, Field, FormFooter, ErrorMessage } from "./ui";
import { ExerciseEditor } from "./ExerciseEditor";
import { priorWorkouts } from "../lib/setProgress";
import { noteSources } from "../lib/noteCoach";
import NotesCoach from "./training/NotesCoach";
import "./training/trainingProgress.css";
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
    exercises: structuredClone(day.exercises).map((e) => ({
      ...e,
      sets: e.sets.map((s, i) => ({ ...s, position: i + 1, completed: false })),
    })),
  };
}
export function WorkoutForm({
  initial,
  onClose,
}: {
  initial: Workout;
  onClose: () => void;
}) {
  useLanguage();
  const { data, save } = useData();
  const { remember, clear, error: draftError } = useWorkoutDraft();
  const [value, setValue] = useState(() =>
      prepareWorkout(
        initial,
        data.workouts.some((w) => w.id === initial.id),
      ),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => remember(value), [value, remember]);
  const routine = data.routines.find((r) => r.id === value.routineId);
  const sessions = routine ? routineDays(routine) : [];
  const selectedExists = sessions.some((d) => d.id === value.routineDayId);
  const previousSession = priorWorkouts(data.workouts, value, 1)[0];
  async function submit(event: FormEvent) {
    event.preventDefault();
    const actual = completedWorkout(value);
    if (!actual.name.trim() || !validateExercises(actual.exercises)) {
      setError("Confirma al menos una serie realizada con datos válidos.");
      return;
    }
    setBusy(true);
    try {
      await save("workouts", actual);
      clear(value.id);
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
      title={t("Registrar entrenamiento")}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-content">
          <p className="notice">
            {t(
              "Confirma las series que realizaste. Solo esas series se guardan en tu historial.",
            )}
          </p>
          {!draftError && (
            <p className="small muted">
              {t(
                "Borrador guardado en este navegador. Puedes cerrar y retomarlo.",
              )}
            </p>
          )}
          <ErrorMessage message={draftError} />
          <Field label={t("Usar una rutina")}>
            <select
              value={value.routineId ?? ""}
              onChange={(event) => {
                if (
                  !window.confirm(
                    t(
                      "Cambiar de plan reemplaza las series de este borrador. ¿Continuar?",
                    ),
                  )
                )
                  return;
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
              <option value="">{t("Entrenamiento libre")}</option>
              {value.routineId && !routine && (
                <option value={value.routineId}>
                  {t("Rutina eliminada · sesión conservada")}
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
            <Field label={t("Día de la rutina")}>
              <select
                value={selectedExists ? (value.routineDayId ?? "") : ""}
                onChange={(event) => {
                  if (
                    !window.confirm(
                      t(
                        "Cambiar de plan reemplaza las series de este borrador. ¿Continuar?",
                      ),
                    )
                  )
                    return;
                  const day = sessions.find((d) => d.id === event.target.value);
                  if (day)
                    setValue({ ...value, ...routineSession(routine, day) });
                }}
              >
                {!selectedExists && (
                  <option value="">
                    {t("Sesión guardada · conservar ejercicios")}
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
          <Field label={t("Nombre de la sesión")}>
            <input
              required
              maxLength={100}
              value={value.name}
              onChange={(e) => setValue({ ...value, name: e.target.value })}
            />
          </Field>
          <div className="form-grid">
            <Field label={t("Fecha")}>
              <input
                type="date"
                required
                max={localDate()}
                value={value.date}
                onChange={(e) => setValue({ ...value, date: e.target.value })}
              />
            </Field>
            <Field label={t("Duración · minutos")}>
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
            workout
            exercises={value.exercises}
            previousExercises={previousSession?.exercises}
            onChange={(exercises) => setValue({ ...value, exercises })}
          />
          {previousSession && (
            <details className="workout-preparation">
              <summary>
                {t("Referencia anterior y notas")} · {previousSession.date}
              </summary>
              <NotesCoach sources={noteSources(data.workouts, value, false)} />
            </details>
          )}
          <Field label={t("Notas de la sesión")}>
            <textarea
              maxLength={1000}
              value={value.notes}
              onChange={(e) => setValue({ ...value, notes: e.target.value })}
              placeholder={t("¿Cómo te sentiste hoy?")}
            />
          </Field>
          <ErrorMessage message={t(error)} />
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
  name: t("Entrenamiento libre"),
  duration: 0,
  notes: "",
  exercises: [freshExercise()],
  ...(routine ? routineSession(routine, day) : {}),
});
