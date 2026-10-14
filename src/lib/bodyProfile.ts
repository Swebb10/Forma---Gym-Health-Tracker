import type { BioRecord, BodyProfile, WeightRecord } from "../types";
import type { NutritionPreferences, NutritionInputs } from "./nutrition";
import { localDate } from "./metrics";
export function weightHistory(
  bio: BioRecord[],
  weights: WeightRecord[] = [],
  today = localDate(),
) {
  return [
    ...bio.map((b) => ({
      id: `bio:${b.id}`,
      date: b.date,
      time: b.time,
      weight: b.weight,
      source: "bio" as const,
    })),
    ...weights.map((w) => ({
      ...w,
      id: `weight:${w.id}`,
      source: "weight" as const,
    })),
  ]
    .filter((w) => w.date <= today && Number.isFinite(w.weight) && w.weight > 0)
    .sort(
      (a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time) ||
        (a.source === b.source
          ? a.id.localeCompare(b.id)
          : a.source === "weight"
            ? 1
            : -1),
    );
}
export function resolveBody(
  profile: BodyProfile | null,
  bio: BioRecord[],
  weights: WeightRecord[] = [],
  legacy?: NutritionPreferences,
  today = localDate(),
) {
  const latestBio = [...bio]
    .filter((b) => b.date <= today)
    .sort((a, b) =>
      (b.date + b.time + b.id).localeCompare(a.date + a.time + a.id),
    )[0];
  const manual = legacy?.source === "manual" ? legacy.manual : null;
  const history = weightHistory(bio, weights, today);
  // Undated legacy manual weight remains a labelled fallback until explicitly
  // replaced by a dated shared record. Never manufacture a historical date.
  const useLegacyWeight = !!manual && !weights.length;
  const weight = useLegacyWeight ? manual!.weight : history.at(-1)?.weight;
  const values = profile ?? manual ?? latestBio;
  const sex =
    profile?.sex ??
    (manual
      ? legacy?.sex
      : latestBio?.gender === "male" || latestBio?.gender === "female"
        ? latestBio.gender
        : legacy?.sex) ??
    "";
  const inputs: NutritionInputs | null =
    values && weight && (sex === "male" || sex === "female")
      ? { age: values.age, height: values.height, weight, sex }
      : null;
  return {
    inputs,
    age: values?.age,
    height: values?.height,
    sex: (sex === "male" || sex === "female" ? sex : "") as BodyProfile["sex"],
    weight,
    weightDate: useLegacyWeight ? null : (history.at(-1)?.date ?? null),
    history,
    legacyWeight: useLegacyWeight,
    profileDate: profile?.date ?? (manual ? null : (latestBio?.date ?? null)),
  };
}
