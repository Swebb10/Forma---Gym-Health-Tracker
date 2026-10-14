import { describe, it, expect } from "vitest";
import {
  availableExercises,
  exerciseHistory,
  exerciseOccurrences,
  exerciseTotals,
  priorWorkouts,
  seriesPoints,
  setComparison,
  trainingContext,
} from "./setProgress";
import { noteSources } from "./noteCoach";
import { fromKg } from "./training";
import type { Exercise, Workout } from "../types";
const exercise = (weights = [100, 90, 90, 90]): Exercise => ({
  id: "squat",
  name: "Sentadilla",
  group: "Cuádriceps",
  unit: "kg",
  sets: weights.map((weight) => ({ weight, reps: 8 })),
});
const workout = (id: string, date: string, e = exercise()): Workout => ({
  id,
  date,
  name: "Piernas",
  routineId: "ppl",
  routineDayId: "legs",
  duration: 60,
  notes: "",
  exercises: [e],
});
describe("progress per set", () => {
  it("detects progression from one to four sets without changing top weight", () => {
    const before = exercise(),
      now = exercise([100, 100, 100, 100]);
    expect(exerciseTotals(before, 100, 8)).toMatchObject({
      max: 100,
      volume: 2960,
      matched: 1,
      reps: 32,
    });
    expect(exerciseTotals(now, 100, 8)).toMatchObject({
      max: 100,
      volume: 3200,
      matched: 4,
      reps: 32,
    });
    expect(setComparison(now, before).map((r) => r.status)).toEqual([
      "same",
      "up",
      "up",
      "up",
    ]);
  });
  it("normalizes pounds and treats weight/repetition trade-offs as mixed", () => {
    const now = {
      ...exercise(),
      unit: "lb" as const,
      sets: exercise().sets.map((s) => ({
        ...s,
        weight: fromKg(s.weight, "lb"),
      })),
    };
    expect(
      setComparison(now, exercise()).every((r) => r.status === "same"),
    ).toBe(true);
    now.sets[1] = { weight: fromKg(100, "lb"), reps: 6 };
    expect(setComparison(now, exercise())[1].status).toBe("mixed");
    expect(
      exerciseTotals({ ...exercise([0]), sets: [{ weight: 0, reps: 10 }] })
        .reps,
    ).toBe(10);
  });
  it("preserves missing set positions and ignores invalid values", () => {
    expect(
      setComparison(exercise([100]), exercise()).map((r) => r.status),
    ).toEqual(["same", "missing", "missing", "missing"]);
    const broken = {
      ...exercise(),
      sets: [
        { weight: NaN, reps: 8 },
        { weight: 80, reps: 10 },
      ],
    };
    expect(setComparison(broken, exercise())[0].current).toBeUndefined();
    expect(setComparison(broken, exercise())[1].current?.weight).toBe(80);
    expect(exerciseTotals(broken).volume).toBe(800);
  });
  it("separates variants and repeated blocks but normalizes spacing and accents", () => {
    const a = workout("a", "2026-10-01");
    a.exercises.push(
      { ...exercise([60]), id: "second" },
      { ...exercise(), id: "smith", name: "Sentadilla Smith" },
    );
    const b = workout("b", "2026-10-02", {
      ...exercise(),
      name: " SENTADÍLLA  ",
    });
    const choices = availableExercises([a, b], "2026-10-13");
    expect(choices).toHaveLength(3);
    const second = choices.find((c) => c.occurrence === 1)!;
    expect(
      exerciseHistory([a, b], second.key, "2026-10-13")[0].exercise.sets[0]
        .weight,
    ).toBe(60);
    expect(
      exerciseHistory(
        [a, b],
        choices.find(
          (c) => c.occurrence === 0 && c.name.trim() !== "Sentadilla Smith",
        )!.key,
        "2026-10-13",
      ),
    ).toHaveLength(2);
  });
  it("keeps same-day sessions separate and graph gaps for absent series", () => {
    const a = workout("a", "2026-10-01"),
      b = workout("b", "2026-10-01", exercise([100])),
      future = workout("future", "2027-01-01");
    const key = exerciseOccurrences(a.exercises)[0].key;
    const history = exerciseHistory([a, b, future], key, "2026-10-13");
    expect(history).toHaveLength(2);
    expect(
      seriesPoints(history, 3, "kg").map(({ weight, reps }) => ({
        weight,
        reps,
      })),
    ).toEqual([
      { weight: 90, reps: 8 },
      { weight: null, reps: null },
    ]);
    expect(priorWorkouts([a, b], b)).toEqual([]);
  });
  it("keeps weight and repetitions paired while converting only the weight", () => {
    const a = workout("a", "2026-10-01", {
      ...exercise(),
      sets: [{ weight: 90, reps: 12 }],
    });
    const b = workout("b", "2026-10-02", {
      ...exercise(),
      unit: "lb",
      sets: [{ weight: fromKg(100, "lb"), reps: 8 }],
    });
    const history = exerciseHistory(
      [a, b],
      exerciseOccurrences(a.exercises)[0].key,
      "2026-10-13",
    );
    const kg = seriesPoints(history, 0, "kg"),
      lb = seriesPoints(history, 0, "lb");
    expect(kg.map((p) => p.reps)).toEqual([12, 8]);
    expect(kg[0].weight).toBe(90);
    expect(kg[1].weight).toBeCloseTo(100);
    expect(lb[0].weight).toBeCloseTo(fromKg(90, "lb"));
    expect(lb.map((p) => p.reps)).toEqual([12, 8]);
    const zero = workout("zero", "2026-10-03", exercise([0]));
    expect(
      seriesPoints(
        exerciseHistory(
          [zero],
          exerciseOccurrences(zero.exercises)[0].key,
          "2026-10-13",
        ),
        0,
        "kg",
      )[0],
    ).toMatchObject({ weight: 0, reps: 8 });
  });
  it("does not mix routine days or unrelated free sessions", () => {
    const a = workout("a", "2026-10-01"),
      b = workout("b", "2026-10-10"),
      pull = { ...a, id: "pull", routineDayId: "pull" };
    expect(priorWorkouts([a, pull, b], b).map((w) => w.id)).toEqual(["a"]);
    expect(trainingContext({ ...a, routineId: null })).not.toBe(
      trainingContext({
        ...a,
        routineId: null,
        exercises: [{ ...exercise(), name: "Remo" }],
      }),
    );
  });
});
describe("notes grounding", () => {
  it("includes only recent matching-session notes and clips the disclosed input", () => {
    const a = { ...workout("a", "2026-10-01"), notes: "x".repeat(1000) },
      b = { ...workout("b", "2026-10-10"), notes: "Buena técnica" },
      other = { ...a, id: "other", routineDayId: "push" };
    expect(noteSources([a, b, other], b, false)).toEqual([
      { id: "a", date: a.date, notes: "x".repeat(700) },
    ]);
  });
});
