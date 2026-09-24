import type { BioRecord, Workout } from "../types";
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(
    new Date(`${value}T12:00:00`),
  );
export const numberLabel = (value: number | undefined, decimals = 1) =>
  value === undefined
    ? "—"
    : new Intl.NumberFormat("es", { maximumFractionDigits: decimals }).format(
        value,
      );
export const volume = (workout: Workout) =>
  workout.exercises.reduce(
    (total, e) => total + e.sets.reduce((sum, s) => sum + s.reps * s.weight, 0),
    0,
  );
export const bmi = (weight: number, height: number) =>
  height > 0 ? Math.round((weight / (height / 100) ** 2) * 10) / 10 : 0;
export const muscleMass = (record: BioRecord) =>
  record.skeletalMuscle === undefined
    ? undefined
    : Math.round(((record.weight * record.skeletalMuscle) / 100) * 10) / 10;
export function exerciseProgress(workouts: Workout[], name: string) {
  const days = new Map<string, number>();
  workouts.forEach((w) =>
    w.exercises
      .filter(
        (e) =>
          e.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
      )
      .forEach((e) => {
        const max = Math.max(...e.sets.map((s) => s.weight));
        if (Number.isFinite(max))
          days.set(w.date, Math.max(days.get(w.date) ?? 0, max));
      }),
  );
  return [...days]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
export function validateExercises(
  exercises: { name: string; sets: { reps: number; weight: number }[] }[],
) {
  return (
    exercises.length > 0 &&
    exercises.every(
      (e) =>
        e.name.trim().length > 0 &&
        e.sets.length > 0 &&
        e.sets.every(
          (s) =>
            Number.isInteger(s.reps) &&
            s.reps > 0 &&
            s.reps <= 1000 &&
            Number.isFinite(s.weight) &&
            s.weight >= 0 &&
            s.weight <= 1500,
        ),
    )
  );
}
