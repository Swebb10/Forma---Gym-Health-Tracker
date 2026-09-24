import { describe, it, expect } from "vitest";
import {
  bmi,
  muscleMass,
  volume,
  exerciseProgress,
  validateExercises,
  localDate,
} from "./metrics";
import { demoData } from "./demo";
describe("Métricas de entrenamiento y composición", () => {
  it("calcula IMC usando centímetros y redondea a un decimal", () =>
    expect(bmi(80, 178)).toBe(25.2));
  it("no confunde una medición ausente con cero", () => {
    const record = demoData().bioimpedance[0];
    expect(
      muscleMass({ ...record, skeletalMuscle: undefined }),
    ).toBeUndefined();
    expect(muscleMass({ ...record, weight: 80, skeletalMuscle: 40 })).toBe(32);
  });
  it("suma el volumen de todas las series", () => {
    const record = demoData().workouts[0];
    expect(
      volume({
        ...record,
        exercises: [
          {
            id: "1",
            name: "Press",
            group: "Pecho",
            sets: [
              { reps: 10, weight: 50 },
              { reps: 8, weight: 60 },
            ],
          },
        ],
      }),
    ).toBe(980);
  });
  it("agrupa el máximo diario sin depender del nombre de la rutina ni del orden", () => {
    const base = demoData().workouts[0];
    const w = (date: string, weight: number) => ({
      ...base,
      date,
      exercises: [
        {
          id: "1",
          name: " Press de banca ",
          group: "Pecho",
          sets: [{ reps: 8, weight }],
        },
      ],
    });
    expect(
      exerciseProgress(
        [w("2026-09-12", 50), w("2026-09-10", 40), w("2026-09-12", 60)],
        "press de banca",
      ),
    ).toEqual([
      { date: "2026-09-10", value: 40 },
      { date: "2026-09-12", value: 60 },
    ]);
  });
  it("rechaza series vacías, repeticiones fraccionarias y pesos negativos", () => {
    expect(validateExercises([])).toBe(false);
    expect(
      validateExercises([{ name: "A", sets: [{ reps: 1.5, weight: 10 }] }]),
    ).toBe(false);
    expect(
      validateExercises([{ name: "A", sets: [{ reps: 10, weight: -1 }] }]),
    ).toBe(false);
    expect(
      validateExercises([{ name: "A", sets: [{ reps: 10, weight: 0 }] }]),
    ).toBe(true);
  });
  it("conserva la fecha local", () =>
    expect(localDate(new Date(2026, 8, 24, 23, 59))).toBe("2026-09-24"));
});
