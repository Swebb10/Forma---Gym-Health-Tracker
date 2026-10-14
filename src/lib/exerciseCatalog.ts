import type { Exercise } from "../types";
export const normalizeName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
export const exerciseCatalog = [
  {
    id: "barbell-bench",
    name: "Press de banca",
    group: "Pecho",
    aliases: [
      "Bench press",
      "Bankdrücken",
      "Жим лёжа",
      "Supino reto",
      "Développé couché",
    ],
  },
  {
    id: "barbell-squat",
    name: "Sentadilla",
    group: "Cuádriceps",
    aliases: ["Squat", "Kniebeuge", "Приседания", "Agachamento"],
  },
  {
    id: "barbell-deadlift",
    name: "Peso muerto",
    group: "Isquiotibiales",
    aliases: [
      "Deadlift",
      "Kreuzheben",
      "Становая тяга",
      "Levantamento terra",
      "Soulevé de terre",
    ],
  },
  {
    id: "romanian-deadlift",
    name: "Peso muerto rumano",
    group: "Isquiotibiales",
    aliases: [
      "Romanian deadlift",
      "Rumänisches Kreuzheben",
      "Румынская тяга",
      "Levantamento terra romeno",
      "Soulevé de terre roumain",
    ],
  },
  {
    id: "barbell-row",
    name: "Remo con barra",
    group: "Espalda",
    aliases: [
      "Barbell row",
      "Langhantelrudern",
      "Тяга штанги в наклоне",
      "Remada curvada",
      "Rowing barre",
    ],
  },
  {
    id: "overhead-press",
    name: "Press militar",
    group: "Hombros",
    aliases: [
      "Overhead press",
      "Military press",
      "Schulterdrücken",
      "Армейский жим",
      "Desenvolvimento militar",
      "Développé militaire",
    ],
  },
  {
    id: "pull-up",
    name: "Dominadas",
    group: "Espalda",
    aliases: [
      "Pull-up",
      "Pull-ups",
      "Klimmzüge",
      "Подтягивания",
      "Barra fixa",
      "Tractions",
    ],
  },
  {
    id: "biceps-curl",
    name: "Curl de bíceps",
    group: "Bíceps",
    aliases: [
      "Biceps curl",
      "Bizepscurl",
      "Сгибание на бицепс",
      "Rosca bíceps",
      "Curl biceps",
    ],
  },
  {
    id: "triceps-extension",
    name: "Extensión de tríceps",
    group: "Tríceps",
    aliases: [
      "Triceps extension",
      "Trizepsstrecken",
      "Разгибание на трицепс",
      "Extensão de tríceps",
      "Extension triceps",
    ],
  },
  {
    id: "leg-press",
    name: "Prensa de piernas",
    group: "Cuádriceps",
    aliases: ["Leg press", "Beinpresse", "Жим ногами", "Presse à cuisses"],
  },
] as const;
export const catalogByName = (name: string) =>
  exerciseCatalog.find((e) =>
    [e.name, ...e.aliases].some(
      (alias) => normalizeName(alias) === normalizeName(name),
    ),
  );
export function catalogEntry(e: Exercise) {
  const entry = e.movementId
    ? exerciseCatalog.find((c) => c.id === e.movementId)
    : catalogByName(e.name);
  return entry && entry.group === e.group ? entry : undefined;
}
export const movementIdentity = (e: Exercise) =>
  catalogEntry(e)?.id ??
  JSON.stringify([normalizeName(e.name), normalizeName(e.group)]);
