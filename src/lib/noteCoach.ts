import type { Workout } from "../types";
import { priorWorkouts } from "./setProgress";
export const noteTopics = [
  "pain",
  "pauses",
  "technique",
  "fatigue",
  "recovery",
  "easy",
  "time",
  "equipment",
] as const;
export type NoteTopic = (typeof noteTopics)[number];
export type NoteSource = { id: string; date: string; notes: string };
export type NoteSignal = { topic: NoteTopic; sourceId: string; quote: string };
export function noteSources(
  workouts: Workout[],
  current: Workout,
  includeCurrent = true,
): NoteSource[] {
  const related = [
    ...(includeCurrent ? [current] : []),
    ...priorWorkouts(workouts, current, 3),
  ].slice(0, 3);
  return related
    .filter((w) => w.notes.trim())
    .map((w) => ({
      id: w.id,
      date: w.date,
      notes: w.notes.trim().slice(0, 700),
    }));
}
export const noteMessages: Record<
  NoteTopic,
  { title: string; advice: string }
> = {
  pauses: {
    title: "Distingue las series con pausas",
    advice:
      "Si necesitaste parar dentro de una serie, anótalo como serie con pausas. En la próxima sesión compara también cuántas repeticiones hiciste seguidas antes de aumentar la carga.",
  },
  pain: {
    title: "Molestias por revisar",
    advice:
      "Si esta nota describe dolor, no aumentes la carga ni fuerces el movimiento que lo provoca. Si persiste o limita el movimiento, busca valoración profesional antes de repetirlo.",
  },
  technique: {
    title: "Prioriza la técnica",
    advice:
      "En la próxima sesión busca un movimiento controlado y un rango consistente. Mantén o ajusta la carga con tu entrenador si la técnica se deteriora; no persigas el récord de peso.",
  },
  fatigue: {
    title: "Revisa las últimas series",
    advice:
      "Compara las series finales y registra cuánto descansaste. Antes de aumentar el peso, busca repetir las repeticiones con técnica estable y sin forzar el fallo.",
  },
  recovery: {
    title: "Ten en cuenta la recuperación",
    advice:
      "Anota sueño, energía y recuperación antes de repetir la sesión. Si sigues cansado, ajusta el entrenamiento con tu entrenador en lugar de compensar con más carga.",
  },
  easy: {
    title: "Confirma que puedes repetirlo",
    advice:
      "Que una sesión se sintiera fácil es una señal para revisar, no una orden de subir peso. Confirma el objetivo de todas las series, la técnica y el esfuerzo antes de una progresión gradual.",
  },
  time: {
    title: "Organiza la próxima sesión",
    advice:
      "Prepara el orden de ejercicios y el tiempo disponible. Si faltó tiempo, prioriza lo planificado con tu entrenador sin comprimir los descansos solo para completar más series.",
  },
  equipment: {
    title: "Compara condiciones similares",
    advice:
      "Registra si cambiaste de máquina, barra, agarre o variante. Mantén nombres distintos para variantes diferentes: sus pesos no siempre son comparables.",
  },
};
const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const words = (pattern: string) =>
  new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${pattern})(?=$|[^\\p{L}\\p{N}])`, "u");

// Small, bounded phrase rules, not a language model. Negated or hypothetical
// clauses are deliberately skipped rather than guessed. Notes are never executed.
const uncertain = words(
  "no|sin|ni|nunca|not|never|without|\\p{L}+n['’]t|kein[a-z]*|nicht|ohne|pas|sans|aucun[a-z]*|jamais|nao|sem|nem|не|нет|без|if|si|wenn|se|если|quizas|maybe|perhaps|vielleicht|talvez|peut-etre|возможно",
);
const rules: Record<NoteTopic, RegExp> = {
  pain: words(
    "dolor[a-z]*|me dolio|molestia[a-z]*|pain|hurt[a-z]*|discomfort|schmerz[a-z]*|douleur[a-z]*|dor|dores|боль|болит|болело",
  ),
  pauses: words(
    "tuve que parar|tuve que hacer una pausa|pare dentro de la serie|pare para seguir|had to (?:stop|pause)|paused (?:during|within|mid)[ -](?:the )?set|musste (?:pausieren|unterbrechen)|pause im satz|j'ai du (?:m'arreter|faire une pause)|precisei parar|tive que parar|пришлось (?:остановиться|сделать паузу)",
  ),
  technique: words(
    "perdi la tecnica|mala tecnica|me balancee|rango incompleto|perdi el equilibrio|poor form|lost (?:form|balance)|incomplete range|schlechte technik|gleichgewicht verloren|mauvaise technique|perdu l'equilibre|tecnica ruim|perdi a tecnica|perdi o equilibrio|плохая техника|потерял равновесие",
  ),
  fatigue: words(
    "cansad[a-z]*|canse|fatiga[a-z]*|agotad[a-z]*|muy dificil|me costo|tired|fatigue[d]?|exhausted|very hard|struggled|mude|erschopft|sehr schwer|fatigue[a-z]*|epuise[a-z]*|tres difficile|muito dificil|exaust[a-z]*|устал[a-zа-я]*|тяжело",
  ),
  recovery: words(
    "dormi (?:poco|mal)|poco sueno|slept (?:poorly|badly)|poor sleep|little sleep|schlecht geschlafen|wenig geschlafen|j'ai mal dormi|peu dormi|dormi (?:pouco|mal)|плохо спал[а]?|мало спал[а]?|недосып",
  ),
  easy: words(
    "fue facil|muy facil|se sintio facil|felt easy|very easy|war leicht|sehr leicht|tres facile|c'etait facile|foi facil|muito facil|было легко|очень легко",
  ),
  time: words(
    "falto tiempo|poco tiempo|ran out of time|short on time|wenig zeit|zeit fehlte|manque de temps|peu de temps|faltou tempo|pouco tempo|мало времени",
  ),
  equipment: words(
    "cambie (?:de|la|el) (?:maquina|barra|agarre)|otra maquina|different (?:machine|bar|grip)|changed (?:machine|bar|grip)|andere maschine|anderer griff|change de machine|autre machine|mudei (?:de|a) (?:maquina|barra|pegada)|outra maquina|другои тренажер|сменил хват",
  ),
};

export function reviewNotes(sources: NoteSource[]): NoteSignal[] {
  const found = new Map<NoteTopic, NoteSignal>();
  for (const source of sources.slice(0, 3)) {
    for (const raw of source.notes
      .slice(0, 700)
      .split(/[.!?;,\n]|\s+(?:pero|but|aber|mais|mas|но|однако)\s+/iu)) {
      const quote = raw.trim(),
        text = normalize(quote);
      if (uncertain.test(text)) continue;
      for (const topic of noteTopics) {
        if (!found.has(topic) && rules[topic].test(text)) {
          found.set(topic, { topic, sourceId: source.id, quote });
        }
      }
    }
  }
  return noteTopics
    .flatMap((topic) => (found.has(topic) ? [found.get(topic)!] : []))
    .slice(0, 3);
}
