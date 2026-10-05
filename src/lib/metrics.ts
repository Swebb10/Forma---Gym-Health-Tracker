import { getLocale } from "./i18n";
import { toKg, fromKg, exerciseUnit } from "./training";
import type { BioRecord, Workout, WeightUnit } from "../types";
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat(getLocale(), {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
export const numberLabel = (value: number | undefined, decimals = 1) =>
  value === undefined
    ? "—"
    : new Intl.NumberFormat(getLocale(), {
        maximumFractionDigits: decimals,
      }).format(value);
export const volume = (workout: Workout, unit: WeightUnit = "kg") =>
  fromKg(
    workout.exercises.reduce(
      (total, e) =>
        total +
        e.sets.reduce(
          (sum, s) => sum + s.reps * toKg(s.weight, exerciseUnit(e)),
          0,
        ),
      0,
    ),
    unit,
  );
export const bmi = (weight: number, height: number) =>
  height > 0 ? Math.round((weight / (height / 100) ** 2) * 10) / 10 : 0;
export const muscleMass = (record: BioRecord) =>
  record.skeletalMuscle === undefined
    ? undefined
    : Math.round(((record.weight * record.skeletalMuscle) / 100) * 10) / 10;
export function exerciseProgress(
  workouts: Workout[],
  name: string,
  unit: WeightUnit = "kg",
) {
  const days = new Map<string, number>();
  workouts.forEach((w) =>
    w.exercises
      .filter(
        (e) =>
          e.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
      )
      .forEach((e) => {
        const max = Math.max(
          ...e.sets.map((s) => toKg(s.weight, exerciseUnit(e))),
        );
        if (Number.isFinite(max))
          days.set(w.date, Math.max(days.get(w.date) ?? 0, max));
      }),
  );
  return [...days]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: fromKg(value, unit) }));
}
export function validateExercises(
  exercises: {
    name: string;
    unit?: WeightUnit;
    sets: { reps: number; weight: number }[];
  }[],
) {
  return (
    exercises.length > 0 &&
    exercises.length <= 100 &&
    exercises.every(
      (e) =>
        e.name.trim().length > 0 &&
        e.name.trim().length <= 100 &&
        (e.unit === undefined || e.unit === "kg" || e.unit === "lb") &&
        e.sets.length > 0 &&
        e.sets.every(
          (s) =>
            Number.isInteger(s.reps) &&
            s.reps > 0 &&
            s.reps <= 1000 &&
            Number.isFinite(s.weight) &&
            s.weight >= 0 &&
            toKg(s.weight, exerciseUnit(e)) <= 1500,
        ),
    )
  );
}

export const monthLabel = (date: string) =>
  new Intl.DateTimeFormat(getLocale(), { month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
