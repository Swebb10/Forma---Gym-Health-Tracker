import { describe, it, expect } from "vitest";
import {
  bodyAnalysis,
  readingTrend,
  regions,
  skeletalKg,
} from "./bodyAnalysis";
import { defaultPreferences, type NutritionPreferences } from "./nutrition";
import type { BioRecord, Store } from "../types";
const today = "2026-10-08";
const inputs = { age: 30, height: 180, weight: 82, sex: "male" as const };
const prefs: NutritionPreferences = {
  ...defaultPreferences(),
  goal: "bulk",
  bodyContext: { priorities: ["arms"], comparable: true },
};
const bio = (
  id: string,
  date: string,
  patch: Partial<BioRecord> = {},
): BioRecord => ({
  id,
  date,
  time: "09:00",
  age: 30,
  height: 180,
  weight: 80,
  gender: "male",
  bodyFat: 20,
  bmi: 24.7,
  water: 55,
  skeletalMuscle: 40,
  leanMass: 64,
  ...patch,
});
const sample = (): Store => ({
  routines: [],
  workouts: [],
  measurements: [
    { id: "old", date: "2026-08-30", waist: 80 },
    { id: "new", date: "2026-10-04", waist: 82 },
  ],
  bioimpedance: [
    bio("old", "2026-09-01"),
    bio("new", "2026-10-05", { weight: 82, bodyFat: 22 }),
  ],
});
describe("body analysis evidence", () => {
  it("excludes future and invalid values, and compares at least 28 days apart", () => {
    const rows = [
      { id: "a", date: "2026-09-01", v: 30 },
      { id: "b", date: "2026-10-05", v: 31 },
      { id: "c", date: "2026-10-05", v: 32 },
      { id: "future", date: "2027-01-01", v: 50 },
      { id: "nan", date: "2026-10-08", v: NaN },
    ];
    expect(readingTrend(rows, (r) => r.v, today)).toMatchObject({
      delta: 2,
      latest: { id: "c" },
      baseline: { id: "a" },
      stale: false,
    });
    expect(
      readingTrend(rows.slice(1, 3), (r) => r.v, today).delta,
    ).toBeUndefined();
  });
  it("finds sparse measurements per field without merging sides or arm states", () => {
    const data = sample();
    data.measurements = [
      {
        id: "a",
        date: "2026-09-01",
        leftArmRelaxed: 30,
        rightArmRelaxed: 31,
        leftArmFlexed: 34,
        biceps: 29,
      },
      { id: "b", date: "2026-10-05", leftArmRelaxed: 31 },
      { id: "c", date: "2026-10-06", waist: 82 },
    ];
    const a = bodyAnalysis(data, prefs, inputs, today);
    expect(a.measures.leftArmRelaxed.delta).toBe(1);
    expect(a.measures.leftArmFlexed.latest?.value).toBe(34);
    expect(a.symmetry).toHaveLength(1);
    expect(a.symmetry[0]).toMatchObject({ date: "2026-09-01", value: -1 });
    expect(
      a.zones.find((z) => z.id === "arms")!.readings.map((r) => r.key),
    ).toContain("biceps");
    expect(a.zones.find((z) => z.id === "back")!.readings).toHaveLength(0);
  });
  it("counts only logged direct groups with positive repetitions in the last 28 days", () => {
    const data = sample();
    const exercises = regions
      .flatMap((r) => r.groups)
      .map((group) => ({
        id: group,
        name: group,
        group,
        sets: [
          { reps: 10, weight: 0 },
          { reps: 0, weight: 20 },
        ],
      }));
    data.workouts = [
      {
        id: "w",
        date: today,
        name: "Full",
        routineId: null,
        duration: 45,
        notes: "",
        exercises,
      },
      {
        id: "old",
        date: "2026-09-01",
        name: "Old",
        routineId: null,
        duration: 30,
        notes: "",
        exercises,
      },
    ];
    const a = bodyAnalysis(data, prefs, inputs, today);
    for (const zone of a.zones)
      for (const group of zone.training) expect(group.sets).toBe(1);
    expect(a.workouts).toBe(1);
    expect(a.zones.find((z) => z.id === "arms")?.priority).toBe(true);
  });
  it("requires confirmation, recent aligned records and complete bio endpoints", () => {
    const data = sample();
    expect(
      bodyAnalysis(data, { ...prefs, bodyContext: undefined }, inputs, today)
        .code,
    ).toBe("confirm");
    delete data.bioimpedance[1].water;
    expect(
      bodyAnalysis(data, prefs, inputs, today).suggestedGoal,
    ).toBeUndefined();
    expect(bodyAnalysis(sample(), prefs, inputs, "2027-01-20").code).toBe(
      "limited",
    );
    const misaligned = sample();
    misaligned.measurements[1].date = "2026-09-20";
    expect(bodyAnalysis(misaligned, prefs, inputs, today).code).toBe("limited");
  });
  it("suggests reviewing a surplus only when weight, fat and waist rise together", () => {
    expect(bodyAnalysis(sample(), prefs, inputs, today)).toMatchObject({
      code: "surplus",
      suggestedGoal: "maintain",
    });
    const data = sample();
    data.measurements[1].waist = 80;
    expect(
      bodyAnalysis(data, prefs, inputs, today).suggestedGoal,
    ).toBeUndefined();
    expect(prefs.goal).toBe("bulk");
  });
  it("avoids goal changes when water changes or clinical eligibility is absent", () => {
    const data = sample();
    data.bioimpedance[1].water = 58;
    expect(bodyAnalysis(data, prefs, inputs, today)).toMatchObject({
      code: "water",
      suggestedGoal: undefined,
    });
    for (const age of [17, 101])
      expect(
        bodyAnalysis(sample(), prefs, { ...inputs, age }, today).suggestedGoal,
      ).toBeUndefined();
    expect(
      bodyAnalysis(sample(), { ...prefs, specialCase: true }, inputs, today)
        .eligible,
    ).toBe(false);
    expect(
      bodyAnalysis(sample(), prefs, null, today).suggestedGoal,
    ).toBeUndefined();
  });
  it("reviews a deficit only with concordant lean and muscle changes, not fat segments", () => {
    const data = sample();
    data.bioimpedance[1] = bio("new", "2026-10-05", {
      weight: 76,
      skeletalMuscle: 38,
      leanMass: 60,
      leftArmKg: 1,
      rightArmKg: 2,
    });
    const result = bodyAnalysis(data, { ...prefs, goal: "cut" }, inputs, today);
    expect(result.code).toBe("recovery");
    expect(result.bio.muscle.latest?.value).toBeCloseTo(28.88);
    expect(
      skeletalKg(bio("x", today, { skeletalMuscle: undefined, leftArmKg: 15 })),
    ).toBeUndefined();
    delete data.bioimpedance[1].leanMass;
    expect(
      bodyAnalysis(data, { ...prefs, goal: "cut" }, inputs, today)
        .suggestedGoal,
    ).toBeUndefined();
  });
  it("handles empty data and single readings without inventing progress", () => {
    const data: Store = {
      routines: [],
      workouts: [],
      measurements: [],
      bioimpedance: [],
    };
    expect(bodyAnalysis(data, prefs, inputs, today).code).toBe("limited");
    data.measurements.push({ id: "one", date: today, leftArmRelaxed: 22 });
    expect(
      bodyAnalysis(data, prefs, inputs, today).measures.leftArmRelaxed.delta,
    ).toBeUndefined();
  });
  it("uses a rising visceral index only with matching reports and corroborating changes", () => {
    const data = sample();
    data.bioimpedance[0].visceralFat = 7;
    data.bioimpedance[1].visceralFat = 8;
    expect(bodyAnalysis(data, prefs, inputs, today).visceralRise).toBe(true);
    data.measurements[1].waist = 80;
    expect(bodyAnalysis(data, prefs, inputs, today).visceralRise).toBe(false);
  });
});
