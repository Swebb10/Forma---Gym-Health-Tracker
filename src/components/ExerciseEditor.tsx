import { t, useLanguage } from "../lib/i18n";
import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Exercise, WeightUnit } from "../types";
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
}: {
  exercises: Exercise[];
  onChange: (value: Exercise[]) => void;
}) {
  useLanguage();
  const listId = useId();
  const update = (i: number, patch: Partial<Exercise>) =>
    onChange(exercises.map((e, n) => (n === i ? { ...e, ...patch } : e)));
  return (
    <div className="exercise-editor">
      <datalist id={listId}>
        {[
          t("Press de banca"),
          t("Sentadilla"),
          t("Peso muerto"),
          t("Peso muerto rumano"),
          t("Remo con barra"),
          t("Press militar"),
          t("Dominadas"),
          t("Curl de bíceps"),
          t("Extensión de tríceps"),
          t("Prensa de piernas"),
        ].map((n) => (
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
                onChange={(ev) => update(i, { name: ev.target.value })}
              />
            </Field>
            <Field label={t("Grupo muscular")}>
              <select
                value={e.group}
                onChange={(ev) => update(i, { group: ev.target.value })}
              >
                {!muscleGroups.some((section) =>
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
          </div>
          <div className="weight-unit-row">
            <Field label={t("Unidad del peso")}>
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
                "Usa la unidad indicada en la máquina o pesa. Cambiarla conserva los números ingresados.",
              )}
            </p>
          </div>
          <div className="set-head">
            <span>{t("Serie")}</span>
            <span>{t("Repeticiones")}</span>
            <span>
              {t("Peso ·")} {exerciseUnit(e)}
            </span>
            <span />
          </div>
          {e.sets.map((s, j) => (
            <div className="set-row" key={j}>
              <span>{j + 1}</span>
              <input
                aria-label={t("Repeticiones ejercicio {0} serie {1}", {
                  "0": i + 1,
                  "1": j + 1,
                })}
                required
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
                aria-label={t("Peso ejercicio {0} serie {1}", {
                  "0": i + 1,
                  "1": j + 1,
                })}
                required
                type="number"
                min="0"
                max={fromKg(1500, exerciseUnit(e))}
                step="any"
                value={s.weight}
                onChange={(ev) =>
                  update(i, {
                    sets: e.sets.map((v, n) =>
                      n === j ? { ...v, weight: Number(ev.target.value) } : v,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={t("Quitar serie {0} del ejercicio {1}", {
                  "0": j + 1,
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
          ))}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              update(i, { sets: [...e.sets, { ...e.sets.at(-1)! }] })
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
