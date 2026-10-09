import { ArrowUpRight, Utensils } from "lucide-react";
import { useNutrition } from "../../context/NutritionContext";
import { goals } from "../../lib/nutrition";
import { regions } from "../../lib/bodyAnalysis";
import { t, useLanguage } from "../../lib/i18n";
import MacroTargets from "./MacroTargets";
export default function NutritionSummary({ onOpen }: { onOpen: () => void }) {
  useLanguage();
  const { current, loading, error } = useNutrition();
  return (
    <section className="panel nutrition-summary">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            <Utensils size={15} />
            {t("NUTRICIÓN A TU MEDIDA")}
          </span>
          <h3>
            {current
              ? t(
                  goals.find((g) => g.id === current.preferences.goal)?.label ??
                    "Nutrición",
                )
              : t("Alimenta tu progreso")}
          </h3>
        </div>
        <button className="text-button" onClick={onOpen}>
          {t("Ver nutrición")} <ArrowUpRight size={16} />
        </button>
      </div>
      {loading ? (
        <p className="muted nutrition-summary-note">{t("Cargando…")}</p>
      ) : current?.targets ? (
        <MacroTargets targets={current.targets} />
      ) : (
        <p className="muted nutrition-summary-note">
          {t(
            current
              ? "Revisa tus datos para obtener una estimación."
              : "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.",
          )}
        </p>
      )}
      {!!current?.preferences.bodyContext?.priorities.length && (
        <p className="muted nutrition-summary-note">
          {t("Prioridades elegidas: {0}.", {
            0: regions
              .filter((r) =>
                current.preferences.bodyContext!.priorities.includes(r.id),
              )
              .map((r) => t(r.label))
              .join(", "),
          })}
        </p>
      )}
      {error && <p className="error nutrition-summary-note">{t(error)}</p>}
    </section>
  );
}
