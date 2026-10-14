import type { Routine, Workout } from "../types";
import { routineDays, weekdays } from "./training";
import { localDate } from "./metrics";
export function nextSession(
  routine: Routine,
  workouts: Workout[],
  today = new Date(),
) {
  const days = routineDays(routine),
    todayKey = localDate(today);
  const previous = workouts
    .filter((w) => w.routineId === routine.id && w.date <= todayKey)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (days.some((d) => d.weekday !== "Sin asignar")) {
    for (let offset = 0; offset <= 7; offset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      const key = localDate(date),
        weekday = weekdays[date.getDay() === 0 ? 7 : date.getDay()];
      const day = days.find(
        (d) =>
          d.weekday === weekday &&
          !previous.some(
            (w) =>
              w.date === key &&
              (w.routineDayId === d.id ||
                (!w.routineDayId && days.length === 1)),
          ),
      );
      if (day) return { day, date: key };
    }
  }
  const last = previous.find((w) => days.some((d) => d.id === w.routineDayId));
  return {
    day: days[
      (days.findIndex((d) => d.id === last?.routineDayId) + 1) % days.length
    ],
    date: undefined,
  };
}
