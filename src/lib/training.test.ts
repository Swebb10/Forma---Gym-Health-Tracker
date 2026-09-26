import { describe, it, expect } from "vitest";
import {
  toKg,
  fromKg,
  routineDays,
  nextRoutineDay,
  muscleGroups,
} from "./training";
import { volume, exerciseProgress, validateExercises } from "./metrics";
import { measurementSections, legacyMeasurementFields } from "./measurements";
import type { Workout, Routine, Exercise } from "../types";
const exercise = (weight: number, unit?: "kg" | "lb"): Exercise => ({
  id: "bench",
  name: "Press",
  group: "Pecho",
  unit,
  sets: [{ reps: 10, weight }],
});
const workout = (exercises: Exercise[], date = "2026-09-24"): Workout => ({
  id: "w",
  date,
  routineId: null,
  name: "Libre",
  duration: 45,
  notes: "",
  exercises,
});
const legacy: Routine = {
  id: "r",
  name: "Anterior",
  description: "",
  exercises: [exercise(50)],
};
describe("Unidades de entrenamiento y compatibilidad", () => {
  it("interpreta los pesos anteriores como kg", () => {
    expect(volume(workout([exercise(50)]))).toBe(500);
    expect(toKg(50)).toBe(50);
  });
  it("convierte libras exactamente y permite la conversión inversa", () => {
    expect(toKg(100, "lb")).toBeCloseTo(45.359237, 6);
    expect(fromKg(toKg(100, "lb"), "lb")).toBeCloseTo(100, 8);
  });
  it("suma volumen mixto en una sola unidad", () => {
    expect(volume(workout([exercise(50), exercise(100, "lb")]))).toBeCloseTo(
      953.59237,
      5,
    );
    expect(volume(workout([exercise(100, "lb")]), "lb")).toBeCloseTo(1000, 6);
  });
  it("elige el máximo diario físico, no el número mayor sin convertir", () => {
    const records = [
      workout([exercise(100, "lb")]),
      workout([exercise(50, "kg")]),
    ];
    expect(exerciseProgress(records, "Press")).toEqual([
      { date: "2026-09-24", value: 50 },
    ]);
    expect(exerciseProgress(records, "Press", "lb")[0].value).toBeCloseTo(
      110.23113,
      4,
    );
  });
  it("acepta decimales y aplica el mismo máximo físico en ambas unidades", () => {
    expect(validateExercises([exercise(2.2, "lb")])).toBe(true);
    expect(validateExercises([exercise(3000, "lb")])).toBe(true);
    expect(validateExercises([exercise(4000, "lb")])).toBe(false);
  });
});
describe("Rutinas por días y anatomía", () => {
  it("adapta una rutina anterior sin mutarla ni perder sus ejercicios", () => {
    const before = structuredClone(legacy);
    const days = routineDays(legacy);
    expect(days).toHaveLength(1);
    expect(days[0].weekday).toBe("Sin asignar");
    expect(days[0].exercises).toEqual(legacy.exercises);
    expect(legacy).toEqual(before);
  });
  it("elige la sesión de hoy y mantiene el orden como alternativa", () => {
    const routine = {
      ...legacy,
      days: [
        { id: "a", name: "Push", weekday: "Lunes", exercises: [exercise(50)] },
        {
          id: "b",
          name: "Pull",
          weekday: "Miércoles",
          exercises: [exercise(30)],
        },
      ],
    };
    expect(nextRoutineDay(routine, new Date(2026, 8, 23)).id).toBe("b");
    expect(nextRoutineDay(routine, new Date(2026, 8, 25)).id).toBe("a");
  });
  it("ofrece los 14 grupos y las 17 medidas con claves únicas", () => {
    expect(muscleGroups.flatMap((s) => s.groups)).toHaveLength(14);
    const fields = measurementSections.flatMap((s) => s.fields);
    expect(fields).toHaveLength(17);
    expect(new Set(fields.map((f) => f.key)).size).toBe(17);
    expect(legacyMeasurementFields.map((f) => f.key)).toEqual([
      "biceps",
      "thighs",
      "calves",
    ]);
  });
});
