import type { Store } from "../types";
import { localDate, bmi } from "./metrics";
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return localDate(d);
};
export function demoData(): Store {
  const exercises = [
    {
      id: "bench",
      name: "Press de banca",
      group: "Pecho",
      sets: [
        { reps: 10, weight: 60 },
        { reps: 10, weight: 60 },
        { reps: 8, weight: 65 },
      ],
    },
    {
      id: "row",
      name: "Remo con barra",
      group: "Espalda",
      sets: [
        { reps: 12, weight: 40 },
        { reps: 12, weight: 40 },
        { reps: 10, weight: 45 },
      ],
    },
    {
      id: "press",
      name: "Press militar",
      group: "Hombros",
      sets: [
        { reps: 10, weight: 25 },
        { reps: 10, weight: 25 },
        { reps: 8, weight: 30 },
      ],
    },
  ];
  return {
    routines: [
      {
        id: "upper",
        name: "Tren superior",
        description: "Pecho, espalda y hombros. Fuerza con intención.",
        exercises,
      },
      {
        id: "lower",
        name: "Piernas & core",
        description: "Una base fuerte para seguir avanzando.",
        exercises: [
          {
            id: "squat",
            name: "Sentadilla",
            group: "Piernas",
            sets: [
              { reps: 10, weight: 70 },
              { reps: 10, weight: 70 },
              { reps: 8, weight: 80 },
            ],
          },
          {
            id: "deadlift",
            name: "Peso muerto rumano",
            group: "Piernas",
            sets: [
              { reps: 10, weight: 60 },
              { reps: 10, weight: 60 },
            ],
          },
        ],
      },
    ],
    workouts: Array.from({ length: 12 }, (_, i) => ({
      id: `w${i}`,
      date: day(-38 + i * 3),
      routineId: "upper",
      name: "Tren superior",
      duration: 45 + (i % 4) * 5,
      notes: "",
      exercises: exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s, weight: s.weight - 10 + i })),
      })),
    })),
    measurements: Array.from({ length: 6 }, (_, i) => ({
      id: `m${i}`,
      date: day(-42 + i * 7),
      biceps: 34 + i * 0.3,
      chest: 101 + i * 0.4,
      waist: 86 - i * 0.5,
      thighs: 55 + i * 0.3,
      calves: 37 + i * 0.1,
    })),
    bioimpedance: Array.from({ length: 6 }, (_, i) => ({
      id: `b${i}`,
      date: day(-42 + i * 7),
      time: "08:30",
      gender: "male",
      age: 29,
      height: 178,
      weight: 80 - i * 0.4,
      bodyFat: 22 - i * 0.5,
      bmi: bmi(80 - i * 0.4, 178),
      visceralFat: 8,
      water: 55 + i * 0.3,
      skeletalMuscle: 40 + i * 0.3,
      boneMass: 3.1,
      bmr: 1740,
      fatMass: 17.6 - i * 0.48,
      leanMass: 62.4 + i * 0.08,
    })),
  };
}
