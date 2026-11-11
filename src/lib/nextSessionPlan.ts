import type { Exercise, SetEntry, Workout } from "../types";
import { exerciseUnit, fromKg, toKg } from "./training";
import {
  exerciseOccurrences,
  normalizedSets,
  priorWorkouts,
} from "./setProgress";
import { noteSources, reviewNotes } from "./noteCoach";

export type SetPlanAction =
  "repeat" | "add-rep" | "add-load" | "hold" | "pain" | "missing";
export type PlannedSet = {
  position: number;
  weight: number | null;
  reps: number | null;
  action: SetPlanAction;
};
export type PlannedExercise = {
  exercise: Exercise;
  unit: ReturnType<typeof exerciseUnit>;
  sets: PlannedSet[];
};
export type SessionPlan = {
  exercises: PlannedExercise[];
  previousDate: string;
  warning: "pain" | "hold" | null;
};

function positionOf(set: SetEntry, index: number) {
  return Number.isInteger(set.position) &&
    set.position! > 0 &&
    set.position! <= 100
    ? set.position! - 1
    : index;
}

function exerciseMap(workout: Workout) {
  const result = new Map<string, Exercise>();
  exerciseOccurrences(workout.exercises).forEach((item, index) => {
    result.set(item.key, workout.exercises[index]);
  });
  return result;
}

/**
 * Conservative double-progression guide for the next comparable workout.
 * It only proposes a load increase after two comparable sessions meet the
 * routine's repetition target at the same load. It does not edit workout data.
 */
export function buildNextSessionPlan(
  workouts: Workout[],
  current: Workout,
): SessionPlan | null {
  const previousWorkouts = priorWorkouts(workouts, current, 2);
  const latestWorkout = previousWorkouts[0];
  if (!latestWorkout) return null;

  const olderWorkout = previousWorkouts[1];
  const latestExercises = exerciseMap(latestWorkout);
  const olderExercises = olderWorkout ? exerciseMap(olderWorkout) : new Map();
  const signals = reviewNotes(noteSources(workouts, current, false));
  const pain = signals.some((signal) => signal.topic === "pain");
  const hold = signals.some((signal) =>
    ["technique", "fatigue", "recovery", "pauses", "equipment"].includes(
      signal.topic,
    ),
  );

  const exercises = exerciseOccurrences(current.exercises).map(
    (occurrence, exerciseIndex) => {
      const exercise = current.exercises[exerciseIndex];
      const latest = latestExercises.get(occurrence.key);
      const older = olderExercises.get(occurrence.key);
      const lastSets = normalizedSets(latest);
      const olderSets = normalizedSets(older);
      const routineTargets = new Map<number, SetEntry>();
      exercise.sets.forEach((set, index) => {
        const position = positionOf(set, index);
        if (Number.isInteger(set.reps) && set.reps > 0)
          routineTargets.set(position, set);
      });
      const positions = [...routineTargets.keys()].sort((a, b) => a - b);
      const lastPositions = lastSets.flatMap((set, index) =>
        set ? [index] : [],
      );
      const maxPosition = Math.max(-1, ...positions, ...lastPositions);
      const unit = exerciseUnit(exercise);
      const sets = Array.from(
        { length: maxPosition + 1 },
        (_, position): PlannedSet => {
          const last = lastSets[position];
          const prior = olderSets[position];
          const routineTarget = routineTargets.get(position);
          if (!last)
            return {
              position: position + 1,
              weight: routineTarget?.weight ?? null,
              reps: routineTarget?.reps ?? null,
              action: "missing",
            };
          if (pain)
            return {
              position: position + 1,
              weight: last.weight,
              reps: last.reps,
              action: "pain",
            };

          const goal = routineTarget?.reps ?? last.reps;
          if (hold)
            return {
              position: position + 1,
              weight: last.weight,
              reps: last.reps,
              action: "hold",
            };

          const sameLoad =
            !!prior && Math.abs(last.weight - prior.weight) < 0.01;
          if (sameLoad && prior!.reps >= goal && last.reps >= goal) {
            if (last.weight > 0) {
              const increment = unit === "lb" ? toKg(5, "lb") : 2.5;
              return {
                position: position + 1,
                weight: fromKg(last.weight + increment, unit),
                reps: goal,
                action: "add-load",
              };
            }
            return {
              position: position + 1,
              weight: fromKg(last.weight, unit),
              reps: goal + 1,
              action: "add-rep",
            };
          }
          if (last.reps < goal) {
            return {
              position: position + 1,
              weight: fromKg(last.weight, unit),
              reps: Math.min(goal, last.reps + 1),
              action: "add-rep",
            };
          }
          return {
            position: position + 1,
            weight: fromKg(last.weight, unit),
            reps: last.reps,
            action: "repeat",
          };
        },
      );
      return { exercise, unit, sets };
    },
  );

  return {
    exercises,
    previousDate: latestWorkout.date,
    warning: pain ? "pain" : hold ? "hold" : null,
  };
}
