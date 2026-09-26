import type { Measurement } from "../types";
export type MeasurementField = {
  key: keyof Omit<Measurement, "id" | "date" | "createdAt" | "updatedAt">;
  label: string;
  max: number;
};
export const measurementSections: {
  title: string;
  fields: MeasurementField[];
}[] = [
  {
    title: "Tren Superior",
    fields: [
      { key: "neck", label: "Cuello", max: 100 },
      { key: "shoulders", label: "Hombros", max: 250 },
      { key: "chest", label: "Pecho", max: 250 },
      { key: "leftArmRelaxed", label: "Brazo Izquierdo (Relajado)", max: 100 },
      { key: "leftArmFlexed", label: "Brazo Izquierdo (Contraído)", max: 100 },
      { key: "rightArmRelaxed", label: "Brazo Derecho (Relajado)", max: 100 },
      { key: "rightArmFlexed", label: "Brazo Derecho (Contraído)", max: 100 },
      { key: "leftForearm", label: "Antebrazo Izquierdo", max: 100 },
      { key: "rightForearm", label: "Antebrazo Derecho", max: 100 },
    ],
  },
  {
    title: "Zona Media",
    fields: [
      { key: "waist", label: "Cintura (A la altura del ombligo)", max: 250 },
      {
        key: "hips",
        label: "Cadera / Glúteos (La parte más prominente)",
        max: 250,
      },
    ],
  },
  {
    title: "Tren Inferior",
    fields: [
      { key: "leftThighHigh", label: "Muslo Izquierdo (Alto)", max: 150 },
      { key: "leftThighMid", label: "Muslo Izquierdo (Medio)", max: 150 },
      { key: "rightThighHigh", label: "Muslo Derecho (Alto)", max: 150 },
      { key: "rightThighMid", label: "Muslo Derecho (Medio)", max: 150 },
      { key: "leftCalf", label: "Pantorrilla Izquierda", max: 100 },
      { key: "rightCalf", label: "Pantorrilla Derecha", max: 100 },
    ],
  },
];
export const legacyMeasurementFields: MeasurementField[] = [
  { key: "biceps", label: "Bíceps (registro anterior, sin lado)", max: 100 },
  { key: "thighs", label: "Muslos (registro anterior, sin lado)", max: 150 },
  {
    key: "calves",
    label: "Pantorrillas (registro anterior, sin lado)",
    max: 100,
  },
];
export const allMeasurementFields = [
  ...measurementSections.flatMap((s) => s.fields),
  ...legacyMeasurementFields,
];
export const hasMeasurement = (
  records: Measurement[],
  field: MeasurementField,
) => records.some((r) => typeof r[field.key] === "number");
