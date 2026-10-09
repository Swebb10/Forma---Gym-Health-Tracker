import { describe, expect, it } from "vitest";
import {
  buildNutrition,
  calculateNutrition,
  defaultPreferences,
  latestRecords,
  sameNutrition,
  type NutritionPreferences,
} from "./nutrition";
import type { BioRecord, Measurement } from "../types";
const inputs = { age: 30, height: 180, weight: 80, sex: "male" as const };
const preferences: NutritionPreferences = {
  ...defaultPreferences(),
  source: "manual",
  sex: "male",
  manual: { age: 30, height: 180, weight: 80 },
  activity: "moderate",
};
const record = (id: string, date: string, weight = 80): BioRecord => ({
  id,
  date,
  time: "10:00",
  age: 30,
  height: 180,
  weight,
  gender: "male",
  bodyFat: 20,
  bmi: 24.7,
});
describe("nutrition estimates", () => {
  it("calculates Mifflin and macros against a known example", () => {
    expect(calculateNutrition(inputs, preferences).targets).toEqual({
      resting: 1780,
      maintenance: 2759,
      calories: 2760,
      protein: 128,
      fat: 92,
      carbs: 355,
    });
    expect(
      calculateNutrition({ ...inputs, sex: "female" }, preferences).targets
        ?.resting,
    ).toBe(1614);
  });
  it("applies four distinct goals without double-counting activity", () => {
    const calories = ["bulk", "recomp", "cut", "maintain"].map(
      (goal) =>
        calculateNutrition(inputs, {
          ...preferences,
          goal: goal as NutritionPreferences["goal"],
        }).targets!.calories,
    );
    expect(calories).toEqual([3030, 2620, 2350, 2760]);
  });
  it("keeps energy and macro targets consistent after rounding", () => {
    for (const goal of ["bulk", "recomp", "cut", "maintain"] as const)
      for (const weight of [45, 80, 150, 250]) {
        const r = calculateNutrition(
          { ...inputs, weight },
          { ...preferences, goal },
        );
        if (r.targets) {
          const m = r.targets;
          expect(m.protein * 4 + m.carbs * 4 + m.fat * 9).toBeCloseTo(
            m.calories,
            -1,
          );
          expect(m.carbs).toBeGreaterThanOrEqual(0);
        }
      }
  });
  it("does not issue targets for missing, invalid or unsupported inputs", () => {
    for (const value of [
      null,
      { ...inputs, weight: NaN },
      { ...inputs, age: 17 },
      { ...inputs, age: 101 },
      { ...inputs, height: 0 },
    ])
      expect(calculateNutrition(value, preferences).targets).toBeNull();
    expect(
      calculateNutrition(inputs, { ...preferences, specialCase: true }).targets,
    ).toBeNull();
    expect(
      calculateNutrition(
        { ...inputs, weight: 45 },
        { ...preferences, goal: "cut" },
      ).targets,
    ).toBeNull();
    expect(
      calculateNutrition(
        { ...inputs, age: 95, weight: 30, height: 130, sex: "female" },
        { ...preferences, activity: "sedentary" },
      ).targets,
    ).toBeNull();
  });
  it("uses chronological latest readings, excludes future dates and follows deletion", () => {
    const records = [
      record("old", "2026-01-01", 70),
      record("future", "2030-01-01", 200),
      record("new", "2026-10-08", 85),
    ];
    const p = { ...preferences, source: "bio" as const };
    const m = [{ id: "m", date: "2026-10-01", waist: 85 }] as Measurement[];
    const n = buildNutrition(p, records, m, "2026-10-08");
    expect(n.inputs?.weight).toBe(85);
    expect(n.sources.measurementId).toBe("m");
    expect(latestRecords([...records].reverse(), m, "2026-10-08").bio.id).toBe(
      "new",
    );
    expect(buildNutrition(p, [], m).targets).toBeNull();
    const unsupported = buildNutrition(
      p,
      [record("outside", "2026-01-01", 500)],
      m,
    );
    expect(unsupported.inputs).toBeNull();
    expect(unsupported.targets).toBeNull();
    expect(buildNutrition(preferences, records, m).inputs?.weight).toBe(80);
  });
  it("uses measurements as context without inventing calorie adjustments", () => {
    const a = buildNutrition(
      preferences,
      [],
      [{ id: "a", date: "2026-10-01", waist: 70 }],
    );
    const b = buildNutrition(
      preferences,
      [],
      [{ id: "b", date: "2026-10-02", waist: 90 }],
    );
    expect(a.targets).toEqual(b.targets);
    expect(a.sources).not.toEqual(b.sources);
    expect(sameNutrition({ x: 1, y: 2 }, { y: 2, x: 1 })).toBe(true);
  });
});
