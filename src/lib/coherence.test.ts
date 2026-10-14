import { describe, it, expect } from "vitest";
import { resolveBody, weightHistory } from "./bodyProfile";
import { prepareWorkout, completedWorkout, readDraft } from "./workoutDraft";
import {
  normalizedSets,
  exerciseIdentity,
  exerciseOccurrences,
  exerciseHistory,
  exerciseTotals,
} from "./setProgress";
import { freshExercise } from "./training";
import { buildNutrition, defaultPreferences } from "./nutrition";
import { nextSession } from "./schedule";
import { readRoute, routeHash } from "./navigation";
import type { BioRecord, Workout, Routine } from "../types";
const bio: BioRecord = {
  id: "bio",
  date: "2026-10-01",
  time: "09:00",
  age: 30,
  height: 180,
  gender: "male",
  weight: 80,
  bodyFat: 20,
  bmi: 24.7,
};
const workout: Workout = {
  id: "w",
  name: "Piernas",
  date: "2026-10-12",
  routineId: "r",
  routineDayId: "push",
  duration: 60,
  notes: "",
  exercises: [
    {
      id: "sq",
      name: "Sentadilla",
      group: "Cuádriceps",
      unit: "kg",
      sets: [
        { reps: 8, weight: 100 },
        { reps: 8, weight: 90 },
        { reps: 8, weight: 90 },
      ],
    },
  ],
};
describe("completed sets and recoverable drafts", () => {
  it("new plans are not results; legacy saved sets remain completed when editing", () => {
    expect(completedWorkout(prepareWorkout(workout)).exercises).toEqual([]);
    expect(
      completedWorkout(prepareWorkout(workout, true)).exercises[0].sets,
    ).toHaveLength(3);
    expect(workout.exercises[0].sets[0].completed).toBeUndefined();
  });
  it("skipped sets keep their original ordinal and do not inflate totals", () => {
    const draft = prepareWorkout(workout);
    draft.exercises[0].sets[0].completed = true;
    draft.exercises[0].sets[2].completed = true;
    const actual = completedWorkout(draft);
    expect(actual.exercises[0].sets.map((s) => s.position)).toEqual([1, 3]);
    expect(normalizedSets(actual.exercises[0])).toEqual([
      { weight: 100, reps: 8 },
      undefined,
      { weight: 90, reps: 8 },
    ]);
    expect(exerciseTotals(actual.exercises[0])).toMatchObject({
      count: 2,
      reps: 16,
      volume: 1520,
    });
    expect(actual.exercises[0].sets[0]).not.toHaveProperty("completed");
  });
  it("restores pending values and rejects corrupt or excessive local drafts", () => {
    const draft = prepareWorkout(workout);
    expect(readDraft(JSON.stringify({ version: 1, workout: draft }))).toEqual(
      draft,
    );
    for (const raw of [
      null,
      "bad",
      "{}",
      JSON.stringify({ version: 2, workout }),
      "x".repeat(500001),
    ])
      expect(readDraft(raw)).toBeNull();
  });
});
describe("shared body data", () => {
  it("uses the latest dated weight, retaining the original body composition assessment", () => {
    const weights = [
      { id: "w", date: "2026-10-12", time: "08:00", weight: 85 },
    ];
    const body = resolveBody(null, [bio], weights, undefined, "2026-10-13");
    expect(body.inputs).toMatchObject({ weight: 85, height: 180, age: 30 });
    expect(body.weightDate).toBe("2026-10-12");
    expect(bio.weight).toBe(80);
    const n = buildNutrition(defaultPreferences(bio), [bio], [], "2026-10-13", {
      profile: null,
      weights,
    });
    expect(n.inputs?.weight).toBe(85);
    expect(n.targets?.protein).toBe(136);
    expect(n.sources.bioId).toBe("bio");
  });
  it("excludes future readings and compares times on the same date", () => {
    expect(
      weightHistory(
        [bio],
        [
          { id: "early", date: bio.date, time: "08:00", weight: 81 },
          { id: "late", date: bio.date, time: "10:00", weight: 82 },
          { id: "future", date: "2026-11-01", time: "12:00", weight: 90 },
        ],
        "2026-10-13",
      ).map((w) => w.weight),
    ).toEqual([81, 80, 82]);
  });
  it("keeps undated legacy nutrition data until an explicit dated record exists", () => {
    const prefs = {
      ...defaultPreferences(),
      sex: "male" as const,
      manual: { age: 35, height: 175, weight: 77 },
    };
    const body = resolveBody(null, [bio], [], prefs);
    expect(body.weight).toBe(77);
    expect(body.weightDate).toBeNull();
    expect(body.history).toHaveLength(1);
    const updated = resolveBody(
      { age: 36, height: 176, sex: "female", date: "2026-10-13" },
      [bio],
      [{ id: "new", date: "2026-10-13", time: "09:00", weight: 79 }],
      prefs,
    );
    expect(updated.inputs).toEqual({
      age: 36,
      height: 176,
      sex: "female",
      weight: 79,
    });
  });
  it("shared sex and optional nutrition preferences remain consistent for Firestore", () => {
    const n = buildNutrition(defaultPreferences(), [], [], "2026-10-13", {
      profile: { age: 30, height: 180, sex: "female", date: "2026-10-13" },
      weights: [{ id: "w", date: "2026-10-13", time: "09:00", weight: 80 }],
    });
    expect(n.preferences.sex).toBe("female");
    expect(n.inputs?.sex).toBe("female");
    expect(n.preferences.source).toBe("bio");
    expect(n.targets).not.toBeNull();
  });
});
describe("exercise identity and navigation", () => {
  it("does not silently assign chest to new custom movements", () =>
    expect(freshExercise().group).toBe(""));
  it("joins translated catalog names but keeps variants and legacy conflicting groups separate", () => {
    const e = workout.exercises[0];
    expect(exerciseIdentity({ ...e, name: "Kniebeuge" })).toBe(
      exerciseIdentity(e),
    );
    expect(exerciseIdentity({ ...e, name: "Sentadilla frontal" })).not.toBe(
      exerciseIdentity(e),
    );
    expect(exerciseIdentity({ ...e, group: "Pecho" })).not.toBe(
      exerciseIdentity(e),
    );
    const history = exerciseHistory(
      [
        workout,
        { ...workout, id: "other", exercises: [{ ...e, name: "Squat" }] },
      ],
      exerciseOccurrences([e])[0].key,
    );
    expect(history).toHaveLength(2);
  });
  it("round-trips exercise identifiers and preserves exact session links", () => {
    const options = {
      view: "progress",
      exercise: exerciseOccurrences(workout.exercises)[0].key,
      session: "w & 2",
    };
    expect(readRoute("#" + routeHash("workouts", options))).toEqual({
      page: "workouts",
      ...options,
    });
    expect(readRoute("#unknown").page).toBe("dashboard");
    expect(readRoute("#bioimpedance").page).toBe("bioimpedance");
  });
});
describe("next planned session", () => {
  const routine: Routine = {
    id: "r",
    name: "PPL",
    description: "",
    exercises: workout.exercises,
    days: [
      {
        id: "push",
        name: "Push",
        weekday: "Lunes",
        exercises: workout.exercises,
      },
      {
        id: "pull",
        name: "Pull",
        weekday: "Miércoles",
        exercises: workout.exercises,
      },
      {
        id: "legs",
        name: "Legs",
        weekday: "Viernes",
        exercises: workout.exercises,
      },
    ],
  };
  it("finds the next calendar day and skips a completed session today", () => {
    expect(nextSession(routine, [], new Date(2026, 9, 12)).day.id).toBe("push");
    expect(
      nextSession(routine, [workout], new Date(2026, 9, 12)),
    ).toMatchObject({ day: { id: "pull" }, date: "2026-10-14" });
    expect(nextSession(routine, [], new Date(2026, 9, 13)).day.id).toBe("pull");
  });
  it("rotates unscheduled days from the most recent recorded day", () => {
    const free = {
      ...routine,
      days: routine.days!.map((d) => ({ ...d, weekday: "Sin asignar" })),
    };
    expect(nextSession(free, [workout], new Date(2026, 9, 13)).day.id).toBe(
      "pull",
    );
    expect(
      nextSession(
        free,
        [{ ...workout, routineDayId: "legs" }],
        new Date(2026, 9, 13),
      ).day.id,
    ).toBe("push");
  });
});
