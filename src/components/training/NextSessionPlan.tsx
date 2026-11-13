import { ClipboardList } from "lucide-react";
import type { Workout } from "../../types";
import { dateLabel, numberLabel } from "../../lib/metrics";
import {
  buildNextSessionPlan,
  type SetPlanAction,
} from "../../lib/nextSessionPlan";
import { t } from "../../lib/i18n";
import { exerciseLoadLabel } from "../../lib/exerciseDisplay";

const actionText: Record<SetPlanAction, string> = {
  repeat: "Repite la última marca para consolidarla.",
  "add-rep": "Mantén el peso y prueba una repetición más, con técnica estable.",
  "add-load": "Dos sesiones alcanzaron la meta: prueba un incremento pequeño.",
  hold: "Mantén la última carga; las notas piden revisar técnica o recuperación.",
  pain: "Nota de dolor: no fuerces el movimiento que lo provoca.",
  missing: "Sin registro de esta serie; conserva el objetivo de tu rutina.",
};

export default function NextSessionPlan({
  workouts,
  workout,
}: {
  workouts: Workout[];
  workout: Workout;
}) {
  const plan = buildNextSessionPlan(workouts, workout);
  if (!plan) return null;

  return (
    <section
      className="next-session-plan"
      aria-label={t("Objetivos por serie para esta sesión")}
    >
      <header>
        <div>
          <h3>
            <ClipboardList size={18} />
            {t("Objetivos por serie para esta sesión")}
          </h3>
          <p className="muted small">
            {t(
              "Guía orientativa basada en los dos últimos registros comparables y tus notas. No cambia ni guarda tus series automáticamente.",
            )}
          </p>
        </div>
        <span className="next-session-date">
          {t("Última sesión: {0}", { 0: dateLabel(plan.previousDate) })}
        </span>
      </header>

      {plan.warning === "pain" ? (
        <p className="notice next-session-warning">
          {t(
            "Una nota reciente menciona dolor. No uses estos datos como objetivo para ese movimiento; si el dolor persiste, suspéndelo y consulta a un profesional.",
          )}
        </p>
      ) : plan.warning === "hold" ? (
        <p className="notice next-session-warning">
          {t(
            "Las notas recientes recomiendan prudencia. La guía mantiene las cargas y repeticiones registradas; revisa técnica, descanso y recuperación antes de progresar.",
          )}
        </p>
      ) : null}

      <div className="next-session-exercises">
        {plan.exercises.map(({ exercise, unit, sets }, index) => (
          <details
            className="next-session-exercise"
            key={`${exercise.id}-${index}`}
            open={index === 0}
          >
            <summary>
              <strong>{exercise.name}</strong>
              <span>{t("{0} series", { 0: sets.length })}</span>
            </summary>
            <ul>
              {sets.map((set) => {
                const value =
                  set.weight === null || set.reps === null
                    ? null
                    : `${exerciseLoadLabel(exercise, set.weight, unit)} × ${numberLabel(set.reps, 0)} ${t("rep")}`;
                return (
                  <li key={set.position}>
                    <span>{t("Serie {0}", { 0: set.position })}</span>
                    <div>
                      <strong>
                        {set.action === "pain" && value
                          ? t("Último registro: {0}", { 0: value })
                          : (value ?? t("Sin objetivo registrado"))}
                      </strong>
                      <small>{t(actionText[set.action])}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
      <p className="small muted">
        {t(
          "Solo se sugiere aumentar tras repetir la meta en dos sesiones: aproximadamente 2,5 kg o 5 lb. Adáptalo al equipo disponible y prioriza siempre una técnica segura.",
        )}
      </p>
    </section>
  );
}
