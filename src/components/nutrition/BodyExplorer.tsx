import { useState } from "react";
import { Activity, RotateCw, Target, ArrowRight } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  bodyAnalysis,
  regions,
  emptyBodyContext,
  analysisMessages,
  type RegionId,
  type Trend,
} from "../../lib/bodyAnalysis";
import { bioSections } from "../../lib/fields";
import { allMeasurementFields } from "../../lib/measurements";
import {
  latestRecords,
  type NutritionPreferences,
  type NutritionInputs,
  type NutritionTargets,
} from "../../lib/nutrition";
import { dateLabel, numberLabel } from "../../lib/metrics";
import { t, useLanguage } from "../../lib/i18n";
import type { BioRecord } from "../../types";
import BodyMap from "./BodyMap";
import "./bodyExplorer.css";

const fullDate = (date: string) => dateLabel(date) + " · " + date.slice(0, 4);
const signed = (n: number) => (n > 0 ? "+" : "") + numberLabel(n, 1);
function Change({ trend, unit }: { trend: Trend; unit: string }) {
  return (
    <span className="body-change">
      {trend.delta !== undefined
        ? t("{0} {1} desde {2}", {
            0: signed(trend.delta),
            1: unit,
            2: fullDate(trend.baseline!.date),
          })
        : t("Sin comparación de 28 días")}
      {trend.stale && <> · {t("Registro de más de 90 días")}</>}
    </span>
  );
}
const goalGuidance = {
  bulk: "Para desarrollar músculo: combina entrenamiento progresivo con tu superávit moderado. Reparte la proteína entre comidas y usa carbohidratos para apoyar el entrenamiento.",
  recomp:
    "Para recomposición: conserva la proteína diaria y el entrenamiento de fuerza. Sigue cintura, rendimiento y recuperación; el peso por sí solo puede ocultar cambios.",
  cut: "Para definición: conserva la proteína y la fuerza durante el déficit. Prioriza alimentos saciantes, verduras, fruta y fuentes de fibra sin recortar más por una sola medición.",
  maintain:
    "Para mantenimiento: distribuye tus metas entre comidas variadas. Incluye proteína, carbohidratos, grasas y vegetales; revisa el rendimiento antes de cambiar las calorías.",
};
export default function BodyExplorer({
  prefs,
  inputs,
  targets,
  onChange,
}: {
  prefs: NutritionPreferences;
  inputs: NutritionInputs | null;
  targets: NutritionTargets | null;
  onChange: (patch: Partial<NutritionPreferences>) => void;
}) {
  useLanguage();
  const { data, loading, error } = useData();
  const [selected, setSelected] = useState<RegionId>("arms");
  const [view, setView] = useState<"front" | "back">("front");
  const context = prefs.bodyContext ?? emptyBodyContext;
  const analysis = bodyAnalysis(data, prefs, inputs);
  const zone = analysis.zones.find((r) => r.id === selected)!;
  const bio = latestRecords(data.bioimpedance, data.measurements).bio;
  const [title, description] = analysisMessages[analysis.code];
  const choose = (id: RegionId) => {
    setSelected(id);
    if (id === "back" || id === "glutes") setView("back");
    if (id === "chest" || id === "core") setView("front");
  };
  const flip = () => {
    const next = view === "front" ? "back" : "front";
    setView(next);
    if (next === "back" && ["chest", "core"].includes(selected))
      setSelected("back");
    if (next === "front" && ["back", "glutes"].includes(selected))
      setSelected("chest");
  };
  if (loading || error)
    return (
      <section className="panel nutrition-section">
        <p>{t(loading ? "Cargando…" : error)}</p>
      </section>
    );
  return (
    <section className="panel body-explorer" aria-labelledby="body-heading">
      <header className="body-header">
        <div>
          <span className="eyebrow">
            <Activity size={15} />
            {t("TU CUERPO, EN CONTEXTO")}
          </span>
          <h2 id="body-heading">{t("Explora tu progreso corporal")}</h2>
          <p className="muted">
            {t(
              "Selecciona una zona. Conecta tus medidas, tu entrenamiento y tu nutrición.",
            )}
          </p>
        </div>
      </header>
      <div className="body-layout">
        <div className="body-stage">
          <div className="body-view">
            <span>
              {t(view === "front" ? "Vista frontal" : "Vista posterior")}
            </span>
            <button type="button" className="btn secondary" onClick={flip}>
              <RotateCw size={16} />
              {t("Girar figura")}
            </button>
          </div>
          <BodyMap
            view={view}
            selected={selected}
            onSelect={choose}
            priorities={context.priorities}
            recorded={analysis.zones
              .filter((z) => z.readings.length)
              .map((z) => z.id)}
          />
          <div className="body-legend">
            <span>
              <i className="recorded" />
              {t("Con medidas")}
            </span>
            <span>
              <i className="priority" />
              {t("Tu prioridad")}
            </span>
            <span>
              <i />
              {t("Sin medidas")}
            </span>
          </div>
          <p className="small muted">
            {t(
              "Figura ilustrativa: su forma no representa tus proporciones reales.",
            )}
          </p>
        </div>
        <div className="body-detail">
          <label className="field">
            <span>{t("Zona corporal")}</span>
            <select
              value={selected}
              onChange={(e) => choose(e.target.value as RegionId)}
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.label)}
                </option>
              ))}
            </select>
          </label>
          <div className="body-zone-heading">
            <h3>{t(zone.label)}</h3>
            <Target size={20} className="blue" />
          </div>
          <label className="nutrition-check">
            <input
              type="checkbox"
              checked={zone.priority}
              onChange={() =>
                onChange({
                  bodyContext: {
                    ...context,
                    priorities: zone.priority
                      ? context.priorities.filter((p) => p !== selected)
                      : [...context.priorities, selected],
                  },
                })
              }
            />
            <span>{t("Quiero desarrollar esta zona")}</span>
          </label>
          <p className="small muted">
            {t(
              "Tus prioridades se guardan con el botón «Guardar objetivo y metas».",
            )}
          </p>
          <div className="body-readings" aria-live="polite">
            {zone.readings.length ? (
              zone.readings.map((f) => (
                <div className="body-reading" key={f.key}>
                  <div>
                    <span>{t(f.label)}</span>
                    <small>{fullDate(f.trend.latest!.date)}</small>
                  </div>
                  <strong>
                    {numberLabel(f.trend.latest!.value)} <small>cm</small>
                  </strong>
                  <Change trend={f.trend} unit="cm" />
                </div>
              ))
            ) : (
              <p className="notice">
                {t(
                  selected === "back"
                    ? "No hay una circunferencia que aísle la espalda. Usa el registro de fuerza y una evaluación técnica para seguirla."
                    : "Registra medidas de esta zona para ver su evolución.",
                )}
              </p>
            )}
          </div>
          {analysis.symmetry
            .filter((pair) =>
              (zone.fields as readonly string[]).includes(pair.left),
            )
            .map((pair) => (
              <p className="small muted" key={pair.left}>
                {t("Diferencia izquierda − derecha: {0} cm · {1} · {2}", {
                  0: signed(pair.value),
                  1: t(
                    allMeasurementFields.find((f) => f.key === pair.left)!
                      .label,
                  ),
                  2: fullDate(pair.date),
                })}
              </p>
            ))}
          <p className="small muted">
            {t(
              "Las circunferencias incluyen músculo, grasa y otros tejidos. Las diferencias entre lados no diagnostican desequilibrios.",
            )}
          </p>
          <h4>{t("Entrenamiento registrado · últimos 28 días")}</h4>
          <div className="body-training">
            {zone.training.map((g) => (
              <div key={g.group}>
                <span>{t(g.group)}</span>
                <strong>{t("{0} series", { 0: g.sets })}</strong>
              </div>
            ))}
          </div>
          {zone.training.every((g) => !g.sets) && (
            <p className="notice">
              {t(
                "Sin series específicas registradas. Si quieres desarrollar esta zona, revisa su presencia en tu rutina con tu entrenador.",
              )}
            </p>
          )}
          <p className="small muted">
            {t(
              "Contamos solo el grupo asignado a cada ejercicio; no el trabajo indirecto. Cero registros no significa cero entrenamiento.",
            )}
          </p>
          {!!analysis.unclassifiedSets && (
            <p className="small muted">
              {t(
                "Hay {0} series con grupos generales; especifica el músculo para incluirlas aquí.",
                { 0: analysis.unclassifiedSets },
              )}
            </p>
          )}
          {bio && (
            <details className="body-segments">
              <summary>{t("Grasa segmentaria del informe")}</summary>
              <p className="small muted">
                {t("Estos valores son grasa, no masa muscular de esa zona.")}{" "}
                {fullDate(bio.date)}
              </p>
              <dl className="nutrition-measures">
                {bioSections
                  .at(-1)!
                  .fields.filter(
                    (f) =>
                      zone.segments.some(
                        (s) => f.key === s + "Kg" || f.key === s + "Pct",
                      ) && typeof bio[f.key as keyof BioRecord] === "number",
                  )
                  .map((f) => (
                    <div key={f.key}>
                      <dt>{t(f.label)}</dt>
                      <dd>
                        {numberLabel(bio[f.key as keyof BioRecord] as number)}{" "}
                        {f.unit}
                      </dd>
                    </div>
                  ))}
              </dl>
              <p className="small muted">
                {t(
                  "Solo se muestran los segmentos disponibles del último informe; pueden abarcar varias zonas.",
                )}
              </p>
            </details>
          )}
        </div>
      </div>
      <div className="body-guidance">
        <details className="body-overview">
          <summary>{t("Revisar todas las zonas")}</summary>
          <p className="small muted">
            {t(
              "Las zonas sin aumento observado o sin series específicas son puntos para revisar, no músculos diagnosticados como rezagados.",
            )}
          </p>
          <div className="body-zone-list">
            {analysis.zones.map((z) => {
              const comparisons = z.readings.filter(
                (r) => r.trend.delta !== undefined && !r.trend.stale,
              );
              const noIncrease =
                z.id !== "core" &&
                context.comparable &&
                comparisons.length > 0 &&
                comparisons.every((r) => r.trend.delta! <= 0);
              return (
                <button
                  type="button"
                  key={z.id}
                  onClick={() => {
                    choose(z.id);
                    document
                      .querySelector(".body-detail")
                      ?.scrollIntoView({ block: "center" });
                  }}
                >
                  <strong>
                    {t(z.label)}
                    {z.priority && <Target size={14} />}
                  </strong>
                  <span>
                    {t("{0} series", {
                      0: z.training.reduce((n, g) => n + g.sets, 0),
                    })}
                  </span>
                  <small>
                    {t(
                      noIncrease
                        ? "Medidas sin aumento observado"
                        : z.readings.length
                          ? "Con medidas"
                          : "Sin medidas",
                    )}
                  </small>
                </button>
              );
            })}
          </div>
        </details>
        <label className="nutrition-check">
          <input
            type="checkbox"
            checked={context.comparable}
            onChange={(e) =>
              onChange({
                bodyContext: { ...context, comparable: e.target.checked },
              })
            }
          />
          <span>
            {t(
              "Mis registros usan el mismo equipo, puntos de medición y condiciones similares de horario, ejercicio e hidratación.",
            )}
          </span>
        </label>
        <div className="body-signal" data-testid="body-signal">
          <span className="eyebrow">{t("LECTURA CONJUNTA")}</span>
          <h3>{t(title)}</h3>
          <p>{t(description)}</p>
          {analysis.visceralRise && (
            <p>
              {t(
                "También aumentan el índice visceral, la cintura y la grasa estimada. Revisa esta evolución con tu nutricionista y los rangos de tu equipo; el índice por sí solo no diagnostica un riesgo.",
              )}
            </p>
          )}
          <div className="body-evidence">
            {(
              [
                ["weight", "Peso corporal", "kg"],
                ["fat", "Grasa estimada · peso × %", "kg"],
                ["muscle", "Músculo estimado · peso × %", "kg"],
                ["lean", "Masa corporal magra", "kg"],
                ["water", "Agua corporal", "%"],
                ["visceral", "Índice de grasa visceral", "índice"],
              ] as const
            ).map(([key, label, unit]) => (
              <div key={key}>
                <span>{t(label)}</span>
                <strong>
                  {numberLabel(analysis.bio[key].latest?.value)} {t(unit)}
                </strong>
                {analysis.bio[key].latest && (
                  <small>{fullDate(analysis.bio[key].latest!.date)}</small>
                )}
                <Change
                  trend={analysis.bio[key]}
                  unit={unit === "%" ? t("puntos porcentuales") : t(unit)}
                />
              </div>
            ))}
            <div>
              <span>{t("Cintura (A la altura del ombligo)")}</span>
              <strong>
                {numberLabel(analysis.measures.waist.latest?.value)} cm
              </strong>
              {analysis.measures.waist.latest && (
                <small>{fullDate(analysis.measures.waist.latest.date)}</small>
              )}
              <Change trend={analysis.measures.waist} unit="cm" />
            </div>
          </div>
          {analysis.suggestedGoal && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                onChange({ goal: analysis.suggestedGoal! });
                document
                  .querySelector(".nutrition-estimate")
                  ?.scrollIntoView({ behavior: "auto", block: "center" });
              }}
            >
              {t("Previsualizar mantenimiento")}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        {targets && analysis.eligible ? (
          <div className="body-food-plan">
            <h3>{t("Cómo llevarlo a tus comidas")}</h3>
            <p>{t(goalGuidance[prefs.goal])}</p>
            {!!context.priorities.length && (
              <p>
                {t("Prioridades elegidas: {0}.", {
                  0: regions
                    .filter((r) => context.priorities.includes(r.id))
                    .map((r) => t(r.label))
                    .join(", "),
                })}{" "}
                {t(
                  "Ningún alimento desarrolla un músculo concreto. Tu energía y proteína apoyan todo el cuerpo; el estímulo depende del entrenamiento.",
                )}
              </p>
            )}
            <p className="body-protein">
              {t(
                "Con tu meta de {0} g de proteína, dividirla en 4 comidas daría unos {1} g por comida.",
                {
                  0: numberLabel(targets.protein, 0),
                  1: numberLabel(targets.protein / 4, 0),
                },
              )}
            </p>
            <p className="small muted">
              {t(
                "Es una forma de repartir tu total, no proteína adicional. Combina huevos, pollo, pescado, lácteos o legumbres según tus preferencias; consulta las porciones en la Macro-Guía.",
              )}
            </p>
          </div>
        ) : (
          <p className="notice">
            {t(
              "Completa o revisa los datos del cálculo antes de recibir orientación alimentaria personalizada.",
            )}
          </p>
        )}
        <details className="body-method">
          <summary>{t("Criterios y límites del análisis")}</summary>
          <p>
            {t(
              "Comparamos puntos de la misma medida, no cuerpos ideales. Una medida estable no demuestra falta de crecimiento; repite la técnica y revisa tu fuerza. La masa magra tampoco equivale a músculo.",
            )}
          </p>
          <p>
            {t(
              "Las señales son reglas orientativas de la app: en volumen, peso +1%, grasa estimada +1 kg y cintura +1 cm; en déficit, peso −1 kg, músculo estimado −1 kg y masa magra −1 kg. No son umbrales clínicos. Nunca cambiamos tus metas sin que guardes la elección.",
            )}
          </p>
          <p>
            {t(
              "El índice visceral depende de la escala del equipo; el contenido óseo no mide densidad ósea. Sus valores y las proporciones del informe se muestran como contexto, sin inventar diagnósticos ni dosis de nutrientes.",
            )}
          </p>
          <p>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/29349935/"
              target="_blank"
              rel="noreferrer"
            >
              {t("Medición de masa muscular")}
            </a>{" "}
            ·{" "}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/28642676/"
              target="_blank"
              rel="noreferrer"
            >
              ISSN · {t("Proteína y ejercicio")}
            </a>
          </p>
        </details>
        <details className="body-method">
          <summary>
            {t("Todas las métricas de tu última bioimpedancia")}
          </summary>
          {bio ? (
            <>
              <p>{fullDate(bio.date)}</p>
              {bioSections.map((s) => (
                <section key={s.title}>
                  <h4>{t(s.title)}</h4>
                  <dl className="nutrition-measures">
                    {s.fields
                      .filter(
                        (f) =>
                          typeof bio[f.key as keyof BioRecord] === "number",
                      )
                      .map((f) => (
                        <div key={f.key}>
                          <dt>{t(f.label)}</dt>
                          <dd>
                            {numberLabel(
                              bio[f.key as keyof BioRecord] as number,
                            )}{" "}
                            {t(f.unit)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </section>
              ))}
            </>
          ) : (
            <p>{t("Sin bioimpedancia registrada")}</p>
          )}
        </details>
      </div>
    </section>
  );
}
