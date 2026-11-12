import { ArrowUpRight, Utensils } from "lucide-react";
import { useNutrition } from "../../context/NutritionContext";
import { goals } from "../../lib/nutrition";
import { regions } from "../../lib/bodyAnalysis";
import { localDate, numberLabel, dateLabel } from "../../lib/metrics";
import { useData } from "../../context/DataContext";
import { t, useLanguage } from "../../lib/i18n";
import MacroTargets from "./MacroTargets";
export default function NutritionSummary({ onOpen }: { onOpen: () => void }) {
  useLanguage();
  const { current, loading, error } = useNutrition();
  const { data } = useData();
  const today = localDate();
  const todayMeals = (data.meals ?? []).filter((entry) => entry.date === today);
  const intake = todayMeals.reduce(
    (total, entry) => ({
      calories: total.calories + entry.calories,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
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
      <div className="nutrition-intake">
        <h4>
          {t("Consumido hoy")} · {dateLabel(today)}
        </h4>
        <div className="nutrition-intake-grid">
          {(
            [
              ["Calorías", intake.calories, current?.targets?.calories, "kcal"],
              ["Proteínas", intake.protein, current?.targets?.protein, "g"],
              ["Carbohidratos", intake.carbs, current?.targets?.carbs, "g"],
              ["Grasas", intake.fat, current?.targets?.fat, "g"],
            ] as const
          ).map(([label, amount, target, unit]) => (
            <div key={label}>
              <span>{t(label)}</span>
              <strong>
                {numberLabel(amount, label === "Calorías" ? 0 : 1)}
                {target !== undefined && (
                  <small> / {numberLabel(target, 0)}</small>
                )}
                <small> {unit}</small>
              </strong>
            </div>
          ))}
        </div>
        {!todayMeals.length && (
          <p className="small muted">
            {t("Todavía no has registrado comidas hoy.")}
          </p>
        )}
      </div>
    </section>
  );
}
