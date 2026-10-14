import type { Workout } from "../types";
export function prepareWorkout(value: Workout, existing = false): Workout {
  return {
    ...value,
    exercises: value.exercises.map((e) => ({
      ...e,
      sets: e.sets.map((s, i) => ({
        ...s,
        position: s.position ?? i + 1,
        completed: s.completed ?? existing,
      })),
    })),
  };
}
export function completedWorkout(value: Workout): Workout {
  return {
    ...value,
    exercises: value.exercises
      .map((e) => ({
        ...e,
        sets: e.sets.flatMap((s, i) =>
          s.completed
            ? [
                {
                  reps: s.reps,
                  weight: s.weight,
                  position: s.position ?? i + 1,
                },
              ]
            : [],
        ),
      }))
      .filter((e) => e.sets.length),
  };
}
export function readDraft(raw: string | null): Workout | null {
  try {
    if (!raw || raw.length > 500000) return null;
    const v = JSON.parse(raw);
    if (v.version !== 1) return null;
    const w = v.workout;
    if (
      typeof w?.id !== "string" ||
      typeof w.name !== "string" ||
      typeof w.date !== "string" ||
      typeof w.notes !== "string" ||
      typeof w.duration !== "number" ||
      !Array.isArray(w.exercises) ||
      w.exercises.length > 100
    )
      return null;
    if (
      !w.exercises.every(
        (e: Workout["exercises"][number]) =>
          typeof e?.id === "string" &&
          typeof e.name === "string" &&
          typeof e.group === "string" &&
          Array.isArray(e.sets) &&
          e.sets.length <= 100 &&
          e.sets.every(
            (s) => typeof s?.reps === "number" && typeof s.weight === "number",
          ),
      )
    )
      return null;
    return w;
  } catch {
    return null;
  }
}
