export type NumericField = {
  key: string;
  label: string;
  unit: string;
  max: number;
  min?: number;
  step?: string;
  required?: boolean;
};
export const measurementFields: NumericField[] = [
  { key: "biceps", label: "Bíceps", unit: "cm", max: 100 },
  { key: "chest", label: "Pecho", unit: "cm", max: 250 },
  { key: "waist", label: "Cintura", unit: "cm", max: 250 },
  { key: "thighs", label: "Muslos", unit: "cm", max: 150 },
  { key: "calves", label: "Pantorrillas", unit: "cm", max: 100 },
];
export const bioSections: {
  title: string;
  description?: string;
  fields: NumericField[];
}[] = [
  {
    title: "Datos generales",
    fields: [
      {
        key: "age",
        label: "Edad",
        unit: "años",
        min: 1,
        max: 120,
        step: "1",
        required: true,
      },
      {
        key: "height",
        label: "Altura",
        unit: "cm",
        min: 30,
        max: 250,
        required: true,
      },
    ],
  },
  {
    title: "Métricas principales",
    fields: [
      {
        key: "weight",
        label: "Peso",
        unit: "kg",
        min: 1,
        max: 500,
        required: true,
      },
      {
        key: "bodyFat",
        label: "Grasa corporal",
        unit: "%",
        max: 100,
        required: true,
      },
      {
        key: "bmi",
        label: "Índice de masa corporal",
        unit: "kg/m²",
        min: 1,
        max: 200,
      },
      {
        key: "visceralFat",
        label: "Índice de grasa visceral",
        unit: "índice",
        max: 100,
      },
      { key: "water", label: "Agua corporal", unit: "%", max: 100 },
      {
        key: "skeletalMuscle",
        label: "Músculo esquelético",
        unit: "%",
        max: 100,
      },
    ],
  },
  {
    title: "Composición corporal avanzada",
    description: "Transcribe las proporciones y unidades de tu informe.",
    fields: [
      { key: "boneMass", label: "Contenido mineral óseo", unit: "kg", max: 30 },
      {
        key: "bmr",
        label: "Metabolismo basal",
        unit: "kcal",
        max: 10000,
        step: "1",
      },
      {
        key: "normalMuscle",
        label: "Proporción normal · músculo",
        unit: "%",
        max: 100,
      },
      {
        key: "normalFat",
        label: "Proporción normal · grasa",
        unit: "%",
        max: 100,
      },
      {
        key: "normalSkeleton",
        label: "Proporción normal · esqueleto",
        unit: "%",
        max: 100,
      },
      {
        key: "normalOther",
        label: "Proporción normal · otros",
        unit: "%",
        max: 100,
      },
    ],
  },
  {
    title: "Análisis de grasa y masa",
    fields: [
      { key: "fatMass", label: "Grasa corporal", unit: "kg", max: 400 },
      { key: "fatIndex", label: "Índice de grasa", unit: "índice", max: 200 },
      { key: "leanMass", label: "Masa corporal magra", unit: "kg", max: 400 },
      {
        key: "fatLossIndex",
        label: "Índice de pérdida de grasa",
        unit: "índice",
        min: -100,
        max: 200,
      },
      {
        key: "fatProportion",
        label: "Proporción de grasa corporal",
        unit: "%",
        max: 100,
      },
    ],
  },
  {
    title: "Grasa segmentaria",
    fields: [
      ...(
        ["leftArm", "rightArm", "torso", "leftLeg", "rightLeg"] as const
      ).flatMap((part, i) => [
        {
          key: part + "Kg",
          label: [
            "Brazo izquierdo · ESI",
            "Brazo derecho · ESD",
            "Torso",
            "Pierna izquierda · EII",
            "Pierna derecha · EID",
          ][i],
          unit: "kg",
          max: 200,
        },
        {
          key: part + "Pct",
          label: [
            "Brazo izquierdo · ESI",
            "Brazo derecho · ESD",
            "Torso",
            "Pierna izquierda · EII",
            "Pierna derecha · EID",
          ][i],
          unit: "%",
          max: 100,
        },
      ]),
    ],
  },
];
