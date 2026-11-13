import { t, useLanguage } from "../lib/i18n";
import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Exercise, WeightUnit } from "../types";
import {
  exerciseOccurrences,
  exerciseRecordIdentity,
} from "../lib/setProgress";
import { exerciseLoadLabel } from "../lib/exerciseDisplay";
import { toKg } from "../lib/training";
import { exerciseCatalog, catalogByName } from "../lib/exerciseCatalog";
import { Field } from "./ui";
import {
  muscleGroups,
  freshExercise,
  exerciseUnit,
  fromKg,
} from "../lib/training";
export { freshExercise } from "../lib/training";
export function ExerciseEditor({
  exercises,
  onChange,
  previousExercises,
  workout = false,
}: {
  exercises: Exercise[];
  onChange: (value: Exercise[]) => void;
  previousExercises?: Exercise[];
  workout?: boolean;
}) {
  useLanguage();
  const listId = useId();
  const update = (i: number, patch: Partial<Exercise>) =>
    onChange(exercises.map((e, n) => (n === i ? { ...e, ...patch } : e)));
  return (
    <div className="exercise-editor">
      <datalist id={listId}>
        {exerciseCatalog
          .map((c) => t(c.name))
          .map((n) => (
            <option key={n} value={n} />
          ))}
      </datalist>
      {exercises.map((e, i) => (
        <section className="exercise-box" key={e.id}>
          <div className="exercise-title">
            <span className="index">{String(i + 1).padStart(2, "0")}</span>
            <strong>{t("Ejercicio")}</strong>
            <button
              className="icon-btn danger ml-auto"
              type="button"
              aria-label={t("Quitar ejercicio {0}", { "0": i + 1 })}
              onClick={() => onChange(exercises.filter((_, n) => n !== i))}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="form-grid">
            <Field label={t("Nombre del ejercicio")}>
              <input
                required
                maxLength={100}
                list={listId}
                value={e.name}
                placeholder={t("Ej. Press de banca")}
                onChange={(ev) => {
                  const name = ev.target.value;
                  const entry =
                    catalogByName(name) ??
                    exerciseCatalog.find((c) => t(c.name) === name);
                  update(i, {
                    name,
                    movementId: entry?.id,
                    ...(entry ? { group: entry.group } : {}),
                  });
                }}
              />
            </Field>
            <Field label={t("Grupo muscular")}>
              <select
                required
                value={e.group}
                onChange={(ev) =>
                  update(i, { group: ev.target.value, movementId: undefined })
                }
              >
                <option value="">{t("Seleccionar grupo muscular")}</option>
                {!!e.group &&
                  !muscleGroups.some((section) =>
                    section.groups.includes(e.group),
                  ) && (
                    <option value={e.group}>
                      {t(e.group)} {t("(anterior)")}
                    </option>
                  )}
                {muscleGroups.map((section) => (
                  <optgroup key={section.label} label={t(section.label)}>
                    {section.groups.map((group) => (
                      <option key={group} value={group}>
                        {t(group)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label={t("Tipo de carga")}>
              <select
                value={e.loadType ?? "external"}
                onChange={(ev) =>
                  update(i, {
                    loadType: ev.target.value as Exercise["loadType"],
                  })
                }
              >
                <option value="external">{t("Peso externo")}</option>
                <option value="bodyweight">{t("Peso corporal")}</option>
              </select>
            </Field>
          </div>
          <div className="weight-unit-row">
            <Field
              label={t(
                e.loadType === "bodyweight"
                  ? "Unidad de carga adicional"
                  : "Unidad del peso",
              )}
            >
              <select
                value={exerciseUnit(e)}
                onChange={(ev) =>
                  update(i, { unit: ev.target.value as WeightUnit })
                }
              >
                <option value="kg">{t("Kilogramos (kg)")}</option>
                <option value="lb">{t("Libras (lb)")}</option>
              </select>
            </Field>
            <p className="small muted">
              {t(
                e.loadType === "bodyweight"
                  ? "En peso corporal, registra aquí solo el lastre; deja 0 si no agregaste peso. El peso de tu cuerpo no se suma al volumen externo."
                  : "Usa la unidad indicada en la máquina o pesa. Cambiarla conserva los números ingresados.",
              )}
            </p>
          </div>
          <Field label={t("Notas del ejercicio")}>
            <textarea
              maxLength={500}
              value={e.notes ?? ""}
              placeholder={t(
                "Ej. Mantener el agarre neutro y controlar la bajada.",
              )}
              onChange={(ev) => update(i, { notes: ev.target.value })}
            />
          </Field>
          {workout && (
            <p className="small muted exercise-note-help">
              {t(
                "Puedes adaptar estas notas para esta sesión; los cambios no modifican la rutina guardada.",
              )}
            </p>
          )}
          <div className="set-head">
            <span>{t("Serie")}</span>
            <span>{t("Repeticiones")}</span>
            <span>
              {t(e.loadType === "bodyweight" ? "Peso adicional ·" : "Peso ·")}{" "}
              {exerciseUnit(e)}
            </span>
            <span />
          </div>
          {e.sets.map((s, j) => {
            const occurrence = exerciseOccurrences(exercises)[i].occurrence;
            const previous = previousExercises?.filter(
              (p) => exerciseRecordIdentity(p) === exerciseRecordIdentity(e),
            )[occurrence];
            const prior = previous?.sets.find(
              (p, k) => (p.position ?? k + 1) === (s.position ?? j + 1),
            );
            return (
              <div key={j}>
                <div className="set-row">
                  <span>{s.position ?? j + 1}</span>
                  <input
                    aria-label={t("Repeticiones ejercicio {0} serie {1}", {
                      "0": i + 1,
                      "1": s.position ?? j + 1,
                    })}
                    required={!workout || s.completed}
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={s.reps || ""}
                    onChange={(ev) =>
                      update(i, {
                        sets: e.sets.map((v, n) =>
                          n === j ? { ...v, reps: Number(ev.target.value) } : v,
                        ),
                      })
                    }
                  />
                  <input
                    aria-label={t(
                      e.loadType === "bodyweight"
                        ? "Carga adicional ejercicio {0} serie {1}"
                        : "Peso ejercicio {0} serie {1}",
                      {
                        "0": i + 1,
                        "1": s.position ?? j + 1,
                      },
                    )}
                    required={!workout || s.completed}
                    type="number"
                    min="0"
                    max={fromKg(1500, exerciseUnit(e))}
                    step="any"
                    value={s.weight}
                    onChange={(ev) =>
                      update(i, {
                        sets: e.sets.map((v, n) =>
                          n === j
                            ? { ...v, weight: Number(ev.target.value) }
                            : v,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t("Quitar serie {0} del ejercicio {1}", {
                      "0": s.position ?? j + 1,
                      "1": i + 1,
                    })}
                    disabled={e.sets.length === 1}
                    onClick={() =>
                      update(i, { sets: e.sets.filter((_, n) => n !== j) })
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {workout && (
                  <label className="set-completed">
                    <input
                      type="checkbox"
                      checked={s.completed === true}
                      onChange={(ev) =>
                        update(i, {
                          sets: e.sets.map((v, n) =>
                            n === j
                              ? { ...v, completed: ev.target.checked }
                              : v,
                          ),
                        })
                      }
                    />
                    {t("Serie {0} realizada", { 0: s.position ?? j + 1 })}
                  </label>
                )}
                {prior && previous && (
                  <p className="set-reference">
                    {t("Anterior · serie {0}: {1} × {2} rep", {
                      0: s.position ?? j + 1,
                      1: exerciseLoadLabel(
                        previous,
                        fromKg(
                          toKg(prior.weight, exerciseUnit(previous)),
                          exerciseUnit(e),
                        ),
                        exerciseUnit(e),
                      ),
                      2: prior.reps,
                    })}
                  </p>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className="text-button"
            disabled={
              e.sets.length >= 100 ||
              Math.max(...e.sets.map((s, k) => s.position ?? k + 1)) >= 100
            }
            onClick={() =>
              update(i, {
                sets: [
                  ...e.sets,
                  {
                    ...e.sets.at(-1)!,
                    ...(workout
                      ? {
                          completed: false,
                          position:
                            Math.max(
                              ...e.sets.map((s, k) => s.position ?? k + 1),
                            ) + 1,
                        }
                      : {}),
                  },
                ],
              })
            }
          >
            <Plus size={15} /> {t("Añadir serie")}
          </button>
        </section>
      ))}
      <button
        type="button"
        className="btn secondary w-full"
        onClick={() => onChange([...exercises, freshExercise()])}
      >
        <Plus size={17} /> {t("Añadir ejercicio")}
      </button>
    </div>
  );
}
