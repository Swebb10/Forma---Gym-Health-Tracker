import { t } from "./i18n";
import type { Exercise, Routine, RoutineDay, WeightUnit } from "../types";
export const muscleGroups = [
  {
    label: "Tren Superior",
    groups: [
      "Pecho",
      "Espalda",
      "Hombros",
      "Bíceps",
      "Tríceps",
      "Antebrazos",
      "Cuello",
    ],
  },
  {
    label: "Tren Inferior",
    groups: [
      "Glúteos",
      "Cuádriceps",
      "Isquiotibiales",
      "Aductores",
      "Abductores",
      "Pantorrillas",
    ],
  },
  { label: "Zona Media", groups: ["Core"] },
];
export const weekdays = [
  "Sin asignar",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;
export const freshExercise = (): Exercise => ({
  id: crypto.randomUUID(),
  name: "",
  group: "Pecho",
  unit: "kg",
  sets: [{ reps: 10, weight: 0 }],
});
export const freshDay = (index = 0): RoutineDay => ({
  id: crypto.randomUUID(),
  name: t("Día {0}", { 0: index + 1 }),
  weekday: "Sin asignar",
  exercises: [freshExercise()],
});
export function routineDays(routine: Routine): RoutineDay[] {
  return routine.days?.length
    ? routine.days
    : [
        {
          id: `${routine.id}-legacy`,
          name: t("Sesión general"),
          weekday: "Sin asignar",
          exercises: routine.exercises,
        },
      ];
}
export const dayLabel = (day: RoutineDay) =>
  day.weekday === "Sin asignar" ? day.name : `${t(day.weekday)} · ${day.name}`;
export function nextRoutineDay(routine: Routine, date = new Date()) {
  const days = routineDays(routine);
  const today = weekdays[date.getDay() === 0 ? 7 : date.getDay()];
  return days.find((day) => day.weekday === today) ?? days[0];
}
export const KG_PER_LB = 0.45359237;
export const toKg = (weight: number, unit: WeightUnit = "kg") =>
  unit === "lb" ? weight * KG_PER_LB : weight;
export const fromKg = (weight: number, unit: WeightUnit = "kg") =>
  unit === "lb" ? weight / KG_PER_LB : weight;
export const exerciseUnit = (exercise: Pick<Exercise, "unit">): WeightUnit =>
  exercise.unit ?? "kg";
