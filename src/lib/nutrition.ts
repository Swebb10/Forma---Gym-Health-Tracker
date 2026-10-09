import type { BioRecord, Measurement } from "../types";
import { localDate } from "./metrics";

export const goals = [
  {
    id: "bulk",
    label: "Ganar masa muscular (Volumen)",
    adjustment: 0.1,
    protein: 1.8,
  },
  {
    id: "recomp",
    label: "Recomposición corporal",
    adjustment: -0.05,
    protein: 2,
  },
  {
    id: "cut",
    label: "Perder grasa (Definición)",
    adjustment: -0.15,
    protein: 2,
  },
  { id: "maintain", label: "Mantener peso", adjustment: 0, protein: 1.6 },
] as const;
export const activities = [
  {
    id: "sedentary",
    label: "Baja · trabajo sentado, poco movimiento",
    factor: 1.2,
  },
  {
    id: "light",
    label: "Ligera · algo de movimiento y 1–3 sesiones/semana",
    factor: 1.375,
  },
  {
    id: "moderate",
    label: "Moderada · movimiento diario y 3–5 sesiones/semana",
    factor: 1.55,
  },
  {
    id: "high",
    label: "Alta · trabajo activo o entrenamiento intenso frecuente",
    factor: 1.725,
  },
] as const;
export type Goal = (typeof goals)[number]["id"];
export type ActivityLevel = (typeof activities)[number]["id"];
export type NutritionInputs = {
  age: number;
  height: number;
  weight: number;
  sex: "male" | "female";
};
export type NutritionPreferences = {
  goal: Goal;
  activity: ActivityLevel;
  source: "bio" | "manual";
  sex: "male" | "female" | "";
  manual: { age: number; height: number; weight: number } | null;
  specialCase: boolean;
};
export type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  resting: number;
  maintenance: number;
};
export type NutritionSnapshot = {
  version: 1;
  preferences: NutritionPreferences;
  inputs: NutritionInputs | null;
  targets: NutritionTargets | null;
  sources: {
    bioId: string | null;
    bioDate: string | null;
    measurementId: string | null;
    measurementDate: string | null;
  };
};
export function latestRecords(
  bio: BioRecord[],
  measurements: Measurement[],
  today = localDate(),
) {
  return {
    bio: bio
      .filter((r) => r.date <= today)
      .sort((a, b) =>
        (b.date + b.time + b.id).localeCompare(a.date + a.time + a.id),
      )[0],
    measurement: measurements
      .filter((r) => r.date <= today)
      .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id))[0],
  };
}
export function defaultPreferences(bio?: BioRecord): NutritionPreferences {
  return {
    goal: "maintain",
    activity: "light",
    source: bio ? "bio" : "manual",
    sex: bio?.gender === "male" || bio?.gender === "female" ? bio.gender : "",
    manual: null,
    specialCase: false,
  };
}
export function resolveInputs(
  p: NutritionPreferences,
  bio?: BioRecord,
): NutritionInputs | null {
  const values = p.source === "bio" ? bio : p.manual;
  if (!values || !["male", "female"].includes(p.sex)) return null;
  return {
    age: values.age,
    height: values.height,
    weight: values.weight,
    sex: p.sex as NutritionInputs["sex"],
  };
}
const inRange = (n: number, min: number, max: number) =>
  Number.isFinite(n) && n >= min && n <= max;
export function nutritionIssue(
  inputs: NutritionInputs | null,
  p: NutritionPreferences,
): string {
  if (!inputs)
    return "Completa edad, altura, peso y sexo para calcular tus metas.";
  if (
    !Number.isInteger(inputs.age) ||
    !inRange(inputs.age, 1, 120) ||
    !inRange(inputs.height, 100, 250) ||
    !inRange(inputs.weight, 30, 300) ||
    !["male", "female"].includes(inputs.sex)
  )
    return "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.";
  if (inputs.age < 18 || inputs.age > 100 || p.specialCase)
    return "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.";
  if (
    !goals.some((g) => g.id === p.goal) ||
    !activities.some((a) => a.id === p.activity)
  )
    return "Selecciona un objetivo y un nivel de actividad válidos.";
  if (
    inputs.weight / (inputs.height / 100) ** 2 < 18.5 &&
    (p.goal === "cut" || p.goal === "recomp")
  )
    return "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.";
  return "";
}
/** Mifflin–St Jeor estimates resting expenditure; activity and goal adjustments are explicit product assumptions. */
export function calculateNutrition(
  inputs: NutritionInputs | null,
  p: NutritionPreferences,
): { targets: NutritionTargets | null; issue: string } {
  const issue = nutritionIssue(inputs, p);
  if (issue || !inputs) return { targets: null, issue };
  const goal = goals.find((g) => g.id === p.goal)!,
    activity = activities.find((a) => a.id === p.activity)!;
  const resting =
    10 * inputs.weight +
    6.25 * inputs.height -
    5 * inputs.age +
    (inputs.sex === "male" ? 5 : -161);
  const maintenance = resting * activity.factor;
  const calories = Math.round((maintenance * (1 + goal.adjustment)) / 10) * 10;
  // Do not silently replace a very low estimate with a seemingly personalized target.
  if (calories < 1200 || calories > 6000)
    return {
      targets: null,
      issue:
        "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.",
    };
  const protein = Math.round(
    Math.min(inputs.weight * goal.protein, (calories * 0.35) / 4),
  );
  const fat = Math.round((calories * 0.3) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  if (carbs < 0)
    return {
      targets: null,
      issue: "No se pudo obtener una distribución válida. Revisa tus datos.",
    };
  return {
    targets: {
      calories,
      protein,
      fat,
      carbs,
      resting: Math.round(resting),
      maintenance: Math.round(maintenance),
    },
    issue: "",
  };
}
export function buildNutrition(
  preferences: NutritionPreferences,
  bio: BioRecord[],
  measurements: Measurement[],
  today = localDate(),
): NutritionSnapshot {
  const latest = latestRecords(bio, measurements, today),
    rawInputs = resolveInputs(preferences, latest.bio);
  const inputs =
    rawInputs &&
    Number.isInteger(rawInputs.age) &&
    inRange(rawInputs.age, 1, 120) &&
    inRange(rawInputs.height, 100, 250) &&
    inRange(rawInputs.weight, 30, 300)
      ? rawInputs
      : null;
  return {
    version: 1,
    preferences,
    inputs,
    targets: calculateNutrition(inputs, preferences).targets,
    sources: {
      bioId: latest.bio?.id ?? null,
      bioDate: latest.bio?.date ?? null,
      measurementId: latest.measurement?.id ?? null,
      measurementDate: latest.measurement?.date ?? null,
    },
  };
}
export function sameNutrition(a: unknown, b: unknown): boolean {
  // Firestore map key order is not significant.
  const normalize = (v: unknown): unknown =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, normalize(v)]),
        )
      : v;
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}
