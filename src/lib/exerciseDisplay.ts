import type { Exercise, WeightUnit } from "../types";
import { numberLabel } from "./metrics";
import { exerciseUnit } from "./training";
import { t } from "./i18n";

/** Formats additional load without treating the user's body mass as zero kg. */
export function exerciseLoadLabel(
  exercise: Pick<Exercise, "loadType" | "unit">,
  weight: number,
  unit: WeightUnit = exerciseUnit(exercise),
) {
  if (exercise.loadType === "bodyweight") {
    return weight > 0.005
      ? t("Peso corporal + {0} {1}", {
          0: numberLabel(weight, 2),
          1: unit,
        })
      : t("Peso corporal");
  }
  return `${numberLabel(weight, 2)} ${unit}`;
}
