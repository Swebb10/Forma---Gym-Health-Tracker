import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Pencil, Plus, Save, Utensils } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useNutrition } from "../../context/NutritionContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { localDate, numberLabel } from "../../lib/metrics";
import { t, useLanguage } from "../../lib/i18n";
import type { MealCategory, MealEntry } from "../../types";
import { DeleteButton, ErrorMessage, Field } from "../ui";

type MealDraft = Omit<MealEntry, "id" | "date" | "createdAt" | "updatedAt">;

const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};
const emptyDraft = (): MealDraft => ({
  time: nowTime(),
  category: "breakfast",
  food: "",
  portion: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});
const categoryOrder: MealCategory[] = ["breakfast", "lunch", "dinner", "snack"];
const categoryLabels: Record<MealCategory, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Merienda",
};

export default function MealLog() {
  useLanguage();
  const { data, loading, error, save, remove } = useData();
  const { current } = useNutrition();
  const { canWrite } = useSubscription();
  const [date, setDate] = useState(localDate());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MealEntry | null>(null);
  const [draft, setDraft] = useState<MealDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const entries = useMemo(
    () =>
      (data.meals ?? [])
        .filter((entry) => entry.date === date)
        .sort(
          (a, b) =>
            a.time.localeCompare(b.time) || a.food.localeCompare(b.food),
        ),
    [data.meals, date],
  );
  const totals = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => ({
          calories: sum.calories + entry.calories,
          protein: sum.protein + entry.protein,
          carbs: sum.carbs + entry.carbs,
          fat: sum.fat + entry.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [entries],
  );
  const targets = current?.targets;

  function startNew() {
    setEditing(null);
    setDraft(emptyDraft());
    setFormError("");
    setMessage("");
    setShowForm(true);
  }

  function startEdit(entry: MealEntry) {
    const {
      id: _id,
      date: _date,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...values
    } = entry;
    setEditing(entry);
    setDraft(values);
    setFormError("");
    setMessage("");
    setShowForm(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    setMessage("");
    try {
      const entry: MealEntry = {
        ...draft,
        id: editing?.id ?? crypto.randomUUID(),
        date,
        food: draft.food.trim(),
        portion: draft.portion.trim(),
      };
      await save("meals", entry);
      setDraft(emptyDraft());
      setEditing(null);
      setShowForm(false);
      setMessage(
        editing ? "Comida actualizada." : "Comida agregada al registro.",
      );
    } catch {
      setFormError(
        "No se pudo guardar la comida. Revisa tu conexión, tu suscripción y las reglas de Firestore.",
      );
    } finally {
      setBusy(false);
    }
  }

  function cancelEdit() {
    setShowForm(false);
    setEditing(null);
    setDraft(emptyDraft());
    setFormError("");
  }

  const macros = [
    {
      key: "calories" as const,
      label: "Calorías",
      unit: "kcal",
      target: targets?.calories,
    },
    {
      key: "protein" as const,
      label: "Proteínas",
      unit: "g",
      target: targets?.protein,
    },
    {
      key: "carbs" as const,
      label: "Carbohidratos",
      unit: "g",
      target: targets?.carbs,
    },
    { key: "fat" as const, label: "Grasas", unit: "g", target: targets?.fat },
  ];

  return (
    <section className="panel nutrition-section meal-log">
      <header className="meal-log-heading">
        <div>
          <span className="eyebrow">{t("REGISTRO DIARIO")}</span>
          <h2>
            <Utensils size={21} />
            {t("Comidas y macros")}
          </h2>
          <p className="muted">
            {t(
              "Registra lo que comes y compara el total del día con tus metas nutricionales.",
            )}
          </p>
        </div>
        <label className="meal-date">
          <CalendarDays size={17} />
          <span className="sr-only">{t("Fecha del registro")}</span>
          <input
            type="date"
            aria-label={t("Fecha del registro")}
            max={localDate()}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              cancelEdit();
              setMessage("");
            }}
          />
        </label>
      </header>

      <div className="meal-totals">
        {macros.map((macro) => {
          const amount = totals[macro.key];
          const percentage = macro.target
            ? Math.min(100, (amount / macro.target) * 100)
            : 0;
          const difference =
            macro.target === undefined ? undefined : macro.target - amount;
          return (
            <article className="meal-total" key={macro.key}>
              <span>{t(macro.label)}</span>
              <strong>
                {numberLabel(amount, macro.key === "calories" ? 0 : 1)}
                <small> {macro.unit}</small>
              </strong>
              {macro.target !== undefined ? (
                <>
                  <div
                    className="meal-progress"
                    role="progressbar"
                    aria-label={t("Progreso de {0}", { 0: t(macro.label) })}
                    aria-valuemin={0}
                    aria-valuemax={macro.target}
                    aria-valuenow={amount}
                  >
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <small className="muted">
                    {t("Meta: {0} {1}", {
                      0: numberLabel(macro.target, 0),
                      1: macro.unit,
                    })}
                    {difference !== undefined && difference >= 0
                      ? ` · ${t("Faltan {0} {1}", { 0: numberLabel(difference, 0), 1: macro.unit })}`
                      : difference !== undefined
                        ? ` · ${t("{0} {1} sobre la meta", { 0: numberLabel(Math.abs(difference), 0), 1: macro.unit })}`
                        : ""}
                  </small>
                </>
              ) : (
                <small className="muted">{t("Sin meta diaria guardada")}</small>
              )}
            </article>
          );
        })}
      </div>

      {!targets && (
        <p className="notice meal-log-notice">
          {t(
            "Puedes registrar tus comidas aunque aún no hayas guardado metas diarias en Nutrición.",
          )}
        </p>
      )}

      {message && (
        <p className="success" role="status">
          {t(message)}
        </p>
      )}
      <ErrorMessage message={error} />
      <ErrorMessage message={formError} />

      <div className="meal-log-toolbar">
        <h3>{t("Alimentos del día")}</h3>
        <button
          type="button"
          className="btn primary"
          onClick={showForm ? cancelEdit : startNew}
          disabled={!canWrite}
        >
          <Plus size={17} />{" "}
          {t(showForm ? "Cerrar formulario" : "Añadir comida")}
        </button>
      </div>

      {showForm && (
        <form className="meal-form" onSubmit={submit}>
          <h3>{t(editing ? "Editar comida" : "Añadir comida")}</h3>
          <div className="meal-form-grid">
            <Field label="Tipo de comida">
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    category: event.target.value as MealCategory,
                  })
                }
              >
                {categoryOrder.map((category) => (
                  <option key={category} value={category}>
                    {t(categoryLabels[category])}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hora">
              <input
                type="time"
                required
                value={draft.time}
                onChange={(event) =>
                  setDraft({ ...draft, time: event.target.value })
                }
              />
            </Field>
            <Field label="Alimento o bebida">
              <input
                required
                maxLength={100}
                value={draft.food}
                placeholder={t("Ej. avena con leche")}
                onChange={(event) =>
                  setDraft({ ...draft, food: event.target.value })
                }
              />
            </Field>
            <Field label="Porción consumida">
              <input
                required
                maxLength={100}
                value={draft.portion}
                placeholder={t("Ej. 1 taza o 150 g")}
                onChange={(event) =>
                  setDraft({ ...draft, portion: event.target.value })
                }
              />
            </Field>
            <Field label="Calorías (kcal)">
              <input
                type="number"
                required
                min="0"
                max="10000"
                step="1"
                value={draft.calories}
                onChange={(event) =>
                  setDraft({ ...draft, calories: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Proteínas (g)">
              <input
                type="number"
                required
                min="0"
                max="500"
                step="0.1"
                value={draft.protein}
                onChange={(event) =>
                  setDraft({ ...draft, protein: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Carbohidratos (g)">
              <input
                type="number"
                required
                min="0"
                max="1000"
                step="0.1"
                value={draft.carbs}
                onChange={(event) =>
                  setDraft({ ...draft, carbs: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Grasas (g)">
              <input
                type="number"
                required
                min="0"
                max="500"
                step="0.1"
                value={draft.fat}
                onChange={(event) =>
                  setDraft({ ...draft, fat: Number(event.target.value) })
                }
              />
            </Field>
          </div>
          <p className="small muted">
            {t(
              "Anota los valores de la porción que realmente consumiste. Puedes usar la etiqueta del producto o una fuente confiable.",
            )}
          </p>
          <div className="meal-form-actions">
            <button
              type="button"
              className="btn secondary"
              disabled={busy}
              onClick={cancelEdit}
            >
              {t("Cancelar")}
            </button>
            <button className="btn primary" disabled={busy || !canWrite}>
              <Save size={16} />{" "}
              {t(
                busy
                  ? "Guardando…"
                  : editing
                    ? "Guardar cambios"
                    : "Guardar comida",
              )}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">{t("Cargando…")}</p>
      ) : entries.length ? (
        <div className="meal-list">
          {categoryOrder.map((category) => {
            const group = entries.filter(
              (entry) => entry.category === category,
            );
            if (!group.length) return null;
            return (
              <section className="meal-group" key={category}>
                <h4>{t(categoryLabels[category])}</h4>
                {group.map((entry) => (
                  <article className="meal-entry" key={entry.id}>
                    <div className="meal-entry-main">
                      <time>{entry.time}</time>
                      <div>
                        <strong>{entry.food}</strong>
                        <p className="muted small">{entry.portion}</p>
                      </div>
                    </div>
                    <div className="meal-entry-macros">
                      <span>{numberLabel(entry.calories, 0)} kcal</span>
                      <span>
                        {t("P")}: {numberLabel(entry.protein)} g
                      </span>
                      <span>
                        {t("C")}: {numberLabel(entry.carbs)} g
                      </span>
                      <span>
                        {t("G")}: {numberLabel(entry.fat)} g
                      </span>
                    </div>
                    <div className="meal-entry-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t("Editar {0}", { 0: entry.food })}
                        disabled={!canWrite}
                        onClick={() => startEdit(entry)}
                      >
                        <Pencil size={16} />
                      </button>
                      <DeleteButton
                        onDelete={() => remove("meals", entry.id)}
                      />
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="meal-empty">
          <Utensils size={24} />
          <p>{t("Aún no registras comidas en esta fecha.")}</p>
          {canWrite && (
            <button className="text-button" onClick={startNew}>
              {t("Añadir el primer alimento")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
