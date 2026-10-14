import type { Exercise, SetEntry, WeightUnit, Workout } from "../types";
import { exerciseUnit, fromKg, toKg } from "./training";
import { localDate } from "./metrics";

export const normalizeExercise = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
export const exerciseIdentity = (exercise: Exercise) =>
  JSON.stringify([
    normalizeExercise(exercise.name),
    normalizeExercise(exercise.group),
  ]);
export type ExerciseOccurrence = {
  key: string;
  identity: string;
  occurrence: number;
  name: string;
  group: string;
};
export type ExerciseSession = {
  key: string;
  workout: Workout;
  exercise: Exercise;
  occurrence: number;
};
export function exerciseOccurrences(
  exercises: Exercise[],
): ExerciseOccurrence[] {
  const counts = new Map<string, number>();
  return exercises.map((e) => {
    const identity = exerciseIdentity(e),
      occurrence = counts.get(identity) ?? 0;
    counts.set(identity, occurrence + 1);
    return {
      key: JSON.stringify([identity, occurrence]),
      identity,
      occurrence,
      name: e.name,
      group: e.group,
    };
  });
}
export function availableExercises(workouts: Workout[], today = localDate()) {
  const all = new Map<string, ExerciseOccurrence>();
  [...workouts]
    .filter((w) => w.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .forEach((w) =>
      exerciseOccurrences(w.exercises).forEach((e) => {
        if (e.name.trim() && !all.has(e.key)) all.set(e.key, e);
      }),
    );
  return [...all.values()].sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      a.group.localeCompare(b.group) ||
      a.occurrence - b.occurrence,
  );
}
export function exerciseHistory(
  workouts: Workout[],
  key: string,
  today = localDate(),
): ExerciseSession[] {
  return workouts
    .filter((w) => w.date <= today)
    .flatMap((workout) =>
      exerciseOccurrences(workout.exercises).flatMap((e, i) =>
        e.key === key
          ? [
              {
                key: JSON.stringify([workout.id, i]),
                workout,
                exercise: workout.exercises[i],
                occurrence: e.occurrence,
              },
            ]
          : [],
      ),
    )
    .sort(
      (a, b) =>
        b.workout.date.localeCompare(a.workout.date) ||
        b.key.localeCompare(a.key),
    );
}
export function trainingContext(workout: Workout): string {
  // Deleted routines retain their IDs. Free sessions require the same name and
  // exercise list; general notes must never silently migrate to another routine day.
  return workout.routineId
    ? JSON.stringify([
        "routine",
        workout.routineId,
        workout.routineDayId ?? null,
      ])
    : JSON.stringify([
        "free",
        normalizeExercise(workout.name),
        workout.exercises.map(exerciseIdentity).sort(),
      ]);
}
export function priorWorkouts(
  workouts: Workout[],
  current: Workout,
  limit = 3,
): Workout[] {
  return workouts
    .filter(
      (w) =>
        w.id !== current.id &&
        w.date < current.date &&
        trainingContext(w) === trainingContext(current),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, limit);
}
export function validSet(set?: SetEntry): set is SetEntry {
  return (
    !!set &&
    Number.isFinite(set.weight) &&
    set.weight >= 0 &&
    Number.isInteger(set.reps) &&
    set.reps > 0
  );
}
export function normalizedSets(
  exercise: Exercise | undefined,
): (SetEntry | undefined)[] {
  return (
    exercise?.sets.map((s) =>
      validSet(s)
        ? { reps: s.reps, weight: toKg(s.weight, exerciseUnit(exercise)) }
        : undefined,
    ) ?? []
  );
}
export function setComparison(current: Exercise, previous?: Exercise) {
  const now = normalizedSets(current),
    before = normalizedSets(previous);
  return Array.from(
    { length: Math.max(now.length, before.length) },
    (_, index) => {
      const a = now[index],
        b = before[index];
      const weightDelta = a && b ? a.weight - b.weight : undefined;
      const repsDelta = a && b ? a.reps - b.reps : undefined;
      const w =
        weightDelta === undefined
          ? 0
          : Math.abs(weightDelta) < 0.01
            ? 0
            : Math.sign(weightDelta);
      const r = Math.sign(repsDelta ?? 0);
      const status = !a
        ? "missing"
        : !b
          ? "new"
          : !w && !r
            ? "same"
            : w >= 0 && r >= 0
              ? "up"
              : w <= 0 && r <= 0
                ? "down"
                : "mixed";
      return { index, current: a, previous: b, weightDelta, repsDelta, status };
    },
  );
}
export function exerciseTotals(
  exercise: Exercise,
  targetKg?: number,
  targetReps?: number,
) {
  const sets = normalizedSets(exercise).filter(validSet);
  return {
    volume: sets.reduce((n, s) => n + s.weight * s.reps, 0),
    reps: sets.reduce((n, s) => n + s.reps, 0),
    max: sets.length ? Math.max(...sets.map((s) => s.weight)) : 0,
    count: sets.length,
    matched:
      targetKg !== undefined && targetReps !== undefined
        ? sets.filter(
            (s) => s.weight + 0.01 >= targetKg && s.reps >= targetReps,
          ).length
        : 0,
  };
}
export function seriesPoints(
  history: ExerciseSession[],
  index: number,
  metric: "weight" | "reps",
  unit: WeightUnit,
) {
  return [...history].reverse().map((entry, order) => {
    const set = normalizedSets(entry.exercise)[index];
    return {
      order,
      key: entry.key,
      date: entry.workout.date,
      name: entry.workout.name,
      value: set
        ? metric === "weight"
          ? fromKg(set.weight, unit)
          : set.reps
        : null,
    };
  });
}
export const comparisonLabels: Record<string, string> = {
  new: "Sin serie anterior",
  missing: "Sin serie actual",
  same: "Sin cambios",
  up: "Más carga o repeticiones",
  down: "Menos carga o repeticiones",
  mixed: "Cambio mixto",
};
export function progressAdvice(current: Exercise, previous?: Exercise): string {
  if (!previous)
    return "Esta sesión será tu referencia. Conserva el orden de las series y registra también descansos y sensaciones.";
  const rows = setComparison(current, previous).filter(
    (r) => r.current && r.previous,
  );
  if (rows.some((r) => r.status === "down" || r.status === "mixed"))
    return "Las series cambiaron de forma distinta. Antes de subir la carga, revisa técnica, descansos y las notas de la sesión; más peso con menos repeticiones no demuestra por sí solo una mejora.";
  if (
    rows.length &&
    rows.every((r) => r.status === "up" || r.status === "same") &&
    rows.some((r) => r.status === "up")
  )
    return "Mejoraste carga o repeticiones en las series comparables. Busca repetirlo con buena técnica antes de decidir otro aumento; no necesitas subir en cada sesión.";
  return "Usa estas series como referencia para la próxima sesión. Si completas tu objetivo con buena técnica y esfuerzo controlado, revisa una progresión gradual con tu entrenador.";
}
