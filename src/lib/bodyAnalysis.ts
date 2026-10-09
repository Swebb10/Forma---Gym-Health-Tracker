import type { BioRecord, Store } from "../types";
import { allMeasurementFields, type MeasurementField } from "./measurements";
import { localDate } from "./metrics";
import {
  calculateNutrition,
  type NutritionInputs,
  type NutritionPreferences,
  type Goal,
} from "./nutrition";

type MeasureKey = MeasurementField["key"];
export const regions = [
  {
    id: "neck",
    label: "Cuello",
    fields: ["neck"],
    groups: ["Cuello"],
    segments: [],
  },
  {
    id: "shoulders",
    label: "Hombros",
    fields: ["shoulders"],
    groups: ["Hombros"],
    segments: [],
  },
  {
    id: "chest",
    label: "Pecho",
    fields: ["chest"],
    groups: ["Pecho"],
    segments: ["torso"],
  },
  {
    id: "back",
    label: "Espalda",
    fields: [],
    groups: ["Espalda"],
    segments: ["torso"],
  },
  {
    id: "arms",
    label: "Brazos",
    fields: [
      "leftArmRelaxed",
      "leftArmFlexed",
      "rightArmRelaxed",
      "rightArmFlexed",
      "biceps",
    ],
    groups: ["Bíceps", "Tríceps"],
    segments: ["leftArm", "rightArm"],
  },
  {
    id: "forearms",
    label: "Antebrazos",
    fields: ["leftForearm", "rightForearm"],
    groups: ["Antebrazos"],
    segments: ["leftArm", "rightArm"],
  },
  {
    id: "core",
    label: "Core",
    fields: ["waist"],
    groups: ["Core"],
    segments: ["torso"],
  },
  {
    id: "glutes",
    label: "Glúteos",
    fields: ["hips"],
    groups: ["Glúteos"],
    segments: ["torso"],
  },
  {
    id: "thighs",
    label: "Muslos",
    fields: [
      "leftThighHigh",
      "leftThighMid",
      "rightThighHigh",
      "rightThighMid",
      "thighs",
    ],
    groups: ["Cuádriceps", "Isquiotibiales", "Aductores", "Abductores"],
    segments: ["leftLeg", "rightLeg"],
  },
  {
    id: "calves",
    label: "Pantorrillas",
    fields: ["leftCalf", "rightCalf", "calves"],
    groups: ["Pantorrillas"],
    segments: ["leftLeg", "rightLeg"],
  },
] as const;
export type RegionId = (typeof regions)[number]["id"];
export type BodyContext = { priorities: RegionId[]; comparable: boolean };
export const emptyBodyContext: BodyContext = {
  priorities: [],
  comparable: false,
};
export type Reading = { value: number; date: string; id: string };
export type Trend = {
  latest?: Reading;
  baseline?: Reading;
  delta?: number;
  stale: boolean;
};
const days = (a: string, b: string) =>
  (Date.parse(a + "T12:00:00Z") - Date.parse(b + "T12:00:00Z")) / 86400000;
const round = (n: number) => Math.round(n * 100) / 100;
export function readingTrend<
  T extends { id: string; date: string; time?: string },
>(records: T[], get: (record: T) => unknown, today = localDate()): Trend {
  const readings = records
    .filter((r) => r.date <= today && Number.isFinite(days(today, r.date)))
    .sort((a, b) =>
      (b.date + (b.time ?? "") + b.id).localeCompare(
        a.date + (a.time ?? "") + a.id,
      ),
    )
    .flatMap((r) => {
      const value = get(r);
      return typeof value === "number" && Number.isFinite(value)
        ? [{ value, date: r.date, id: r.id }]
        : [];
    });
  const latest = readings[0];
  // Endpoints are observations, not a fitted trend or a diagnosis. Same-day readings never form a trend.
  const baseline =
    latest &&
    readings.find(
      (r) =>
        days(latest.date, r.date) >= 28 && days(latest.date, r.date) <= 180,
    );
  return {
    latest,
    baseline,
    delta:
      latest && baseline ? round(latest.value - baseline.value) : undefined,
    stale: !!latest && days(today, latest.date) > 90,
  };
}
export const skeletalKg = (b: BioRecord) =>
  typeof b.skeletalMuscle === "number" &&
  b.skeletalMuscle > 0 &&
  b.skeletalMuscle <= 100 &&
  b.weight > 0
    ? (b.weight * b.skeletalMuscle) / 100
    : undefined;
const fatKg = (b: BioRecord) =>
  b.weight > 0 && b.bodyFat > 0 && b.bodyFat < 100
    ? (b.weight * b.bodyFat) / 100
    : undefined;
export function bodyAnalysis(
  data: Store,
  prefs: NutritionPreferences,
  inputs: NutritionInputs | null,
  today = localDate(),
) {
  const context = prefs.bodyContext ?? emptyBodyContext;
  const measures = Object.fromEntries(
    allMeasurementFields.map((f) => [
      f.key,
      readingTrend(
        data.measurements,
        (r) =>
          typeof r[f.key] === "number" && r[f.key]! > 0 && r[f.key]! <= f.max
            ? r[f.key]
            : undefined,
        today,
      ),
    ]),
  ) as Record<MeasureKey, Trend>;
  const bio = {
    visceral: readingTrend(
      data.bioimpedance,
      (b) =>
        typeof b.visceralFat === "number" &&
        b.visceralFat >= 0 &&
        b.visceralFat <= 100
          ? b.visceralFat
          : undefined,
      today,
    ),
    weight: readingTrend(
      data.bioimpedance,
      (b) => (b.weight > 0 ? b.weight : undefined),
      today,
    ),
    fat: readingTrend(data.bioimpedance, fatKg, today),
    muscle: readingTrend(data.bioimpedance, skeletalKg, today),
    lean: readingTrend(
      data.bioimpedance,
      (b) => (b.leanMass && b.leanMass <= b.weight ? b.leanMass : undefined),
      today,
    ),
    water: readingTrend(
      data.bioimpedance,
      (b) => (b.water && b.water <= 100 ? b.water : undefined),
      today,
    ),
  };
  const workouts = data.workouts.filter(
    (w) => days(today, w.date) >= 0 && days(today, w.date) < 28,
  );
  const groupSets = (group: string) =>
    workouts
      .flatMap((w) => w.exercises)
      .filter((e) => e.group === group)
      .reduce(
        (sum, e) =>
          sum +
          e.sets.filter((s) => Number.isFinite(s.reps) && s.reps > 0).length,
        0,
      );
  const zones = regions.map((r) => ({
    ...r,
    priority: context.priorities.includes(r.id),
    readings: (r.fields as readonly MeasureKey[])
      .map((key) => ({
        ...allMeasurementFields.find((f) => f.key === key)!,
        trend: measures[key],
      }))
      .filter((f) => f.trend.latest),
    training: r.groups.map((group) => ({ group, sets: groupSets(group) })),
  }));
  const candidatePairs = [
    ["leftArmRelaxed", "rightArmRelaxed"],
    ["leftArmFlexed", "rightArmFlexed"],
    ["leftForearm", "rightForearm"],
    ["leftThighHigh", "rightThighHigh"],
    ["leftThighMid", "rightThighMid"],
    ["leftCalf", "rightCalf"],
  ] as const;
  const symmetry = candidatePairs.flatMap(([left, right]) => {
    // Never compare sides from different sessions, or flexed with relaxed arms.
    const pair = readingTrend(
      data.measurements,
      (m) =>
        typeof m[left] === "number" &&
        typeof m[right] === "number" &&
        m[left]! > 0 &&
        m[right]! > 0
          ? m[left]! - m[right]!
          : undefined,
      today,
    );
    return pair.latest
      ? [{ left, right, ...pair.latest, stale: pair.stale }]
      : [];
  });
  const aligned = (...trends: Trend[]) =>
    trends.every(
      (t) =>
        !t.stale &&
        t.latest &&
        t.baseline &&
        Math.abs(days(t.latest.date, bio.weight.latest!.date)) <= 7 &&
        Math.abs(days(t.baseline.date, bio.weight.baseline!.date)) <= 7,
    );
  const sameBioEndpoints = (trend: Trend) =>
    trend.latest?.id === bio.weight.latest?.id &&
    trend.baseline?.id === bio.weight.baseline?.id;
  const ready =
    context.comparable &&
    !!bio.weight.baseline &&
    aligned(bio.weight, bio.fat, bio.muscle, bio.water, measures.waist) &&
    [bio.fat, bio.muscle, bio.water].every(sameBioEndpoints);
  const hydrationChanged = ready && Math.abs(bio.water.delta!) >= 2;
  let code:
    | "baseline"
    | "confirm"
    | "limited"
    | "water"
    | "surplus"
    | "recovery"
    | "progress" = "baseline";
  let suggestedGoal: Goal | undefined;
  const eligible = !!calculateNutrition(inputs, prefs).targets;
  if (!context.comparable) code = "confirm";
  else if (!ready) code = "limited";
  else if (hydrationChanged) code = "water";
  else if (
    eligible &&
    prefs.goal === "bulk" &&
    bio.weight.delta! / bio.weight.baseline!.value >= 0.01 &&
    bio.fat.delta! >= 1 &&
    measures.waist.delta! >= 1
  ) {
    code = "surplus";
    suggestedGoal = "maintain";
  } else if (
    eligible &&
    (prefs.goal === "cut" || prefs.goal === "recomp") &&
    aligned(bio.lean) &&
    sameBioEndpoints(bio.lean) &&
    bio.weight.delta! <= -1 &&
    bio.muscle.delta! <= -1 &&
    bio.lean.delta! <= -1
  ) {
    code = "recovery";
    suggestedGoal = "maintain";
  } else if (
    eligible &&
    bio.fat.delta! <= -1 &&
    Math.abs(measures.waist.delta!) < 1 &&
    bio.muscle.delta! >= -0.5
  )
    code = "progress";
  return {
    zones,
    measures,
    bio,
    symmetry,
    code,
    suggestedGoal,
    eligible,
    visceralRise:
      ready &&
      !hydrationChanged &&
      sameBioEndpoints(bio.visceral) &&
      bio.visceral.delta! > 0 &&
      measures.waist.delta! >= 1 &&
      bio.fat.delta! >= 1,
    workouts: workouts.length,
    unclassifiedSets: ["General", "Brazos", "Piernas"].reduce(
      (n, g) => n + groupSets(g),
      0,
    ),
  };
}
export const analysisMessages = {
  baseline: [
    "Observa el conjunto",
    "Valora peso, cintura, fuerza y recuperación juntos. Mantén tu objetivo como punto de partida y revisa cómo evolucionas.",
  ],
  confirm: [
    "Primero, datos comparables",
    "Confirma que usaste el mismo equipo y condiciones parecidas. Puedes consultar tus registros mientras tanto; no sugerimos cambios de objetivo con datos sin confirmar.",
  ],
  limited: [
    "Construye tu referencia",
    "Para cruzar señales necesitamos dos registros separados entre 28 y 180 días de peso, grasa, músculo, agua y cintura; fechas entre fuentes a no más de 7 días y datos recientes (90 días).",
  ],
  water: [
    "Repite la evaluación",
    "El agua corporal cambió al menos 2 puntos porcentuales. Esto puede alterar las estimaciones de composición; repite en condiciones similares antes de cambiar la alimentación.",
  ],
  surplus: [
    "Revisa el superávit",
    "Suben peso, grasa estimada y cintura a la vez. Antes de añadir más comida para desarrollar una zona, revisa tu evolución; puedes previsualizar mantenimiento y comentarlo con tu nutricionista.",
  ],
  recovery: [
    "Revisa el déficit y la recuperación",
    "Bajan peso, músculo estimado y masa magra. No confirma pérdida muscular, pero conviene revisar la fuerza, la recuperación y el déficit con tu nutricionista. Puedes previsualizar mantenimiento.",
  ],
  progress: [
    "Una evolución para seguir observando",
    "La grasa estimada baja, la cintura cambia poco y el músculo estimado no cae de forma marcada. Continúa observando fuerza y recuperación; dos registros no prueban ganancia muscular.",
  ],
} as const;
