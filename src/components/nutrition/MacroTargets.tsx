import { t, useLanguage } from "../../lib/i18n";
import { numberLabel } from "../../lib/metrics";
import type { NutritionTargets } from "../../lib/nutrition";
export default function MacroTargets({
  targets,
}: {
  targets: NutritionTargets;
}) {
  useLanguage();
  return (
    <div className="macro-targets" aria-label={t("Metas diarias estimadas")}>
      {(
        [
          ["calories", "Calorías", "kcal"],
          ["protein", "Proteínas", "g"],
          ["carbs", "Carbohidratos", "g"],
          ["fat", "Grasas", "g"],
        ] as const
      ).map(([key, label, unit]) => (
        <div className={"macro-target macro-" + key} key={key}>
          <span>{t(label)}</span>
          <strong data-testid={"target-" + key}>
            {numberLabel(targets[key], 0)} <small>{unit}</small>
          </strong>
        </div>
      ))}
    </div>
  );
}
