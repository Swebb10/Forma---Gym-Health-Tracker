import { useState, type FormEvent } from "react";
import { Plus, Dumbbell, ArrowUpRight, Pencil } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Routine } from "../types";
import {
  Modal,
  Field,
  Empty,
  FormFooter,
  DeleteButton,
  ErrorMessage,
} from "../components/ui";
import { ExerciseEditor, freshExercise } from "../components/ExerciseEditor";
import { validateExercises } from "../lib/metrics";
export default function Routines({
  onStart,
}: {
  onStart: (routine: Routine) => void;
}) {
  const { data, save, remove } = useData();
  const [editing, setEditing] = useState<Routine | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const create = () => {
    setError("");
    setEditing({
      id: crypto.randomUUID(),
      name: "",
      description: "",
      exercises: [freshExercise()],
    });
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim() || !validateExercises(editing.exercises)) {
      setError("Añade un nombre y al menos un ejercicio con series válidas.");
      return;
    }
    setBusy(true);
    try {
      await save("routines", editing);
      setEditing(null);
    } catch {
      setError("No se pudo guardar la rutina. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Tu plan, a tu manera</h2>
          <p className="muted">Rutinas que se adaptan a tus objetivos.</p>
        </div>
        <button className="btn primary" onClick={create}>
          <Plus size={18} /> Nueva rutina
        </button>
      </div>
      {!data.routines.length ? (
        <Empty
          title="Todo empieza con un plan"
          description="Agrupa tus ejercicios y prepara tu próxima sesión."
          onAction={create}
        />
      ) : (
        <div className="routine-grid">
          {data.routines.map((r, i) => (
            <article className="panel routine-card" key={r.id}>
              <div className="flex items-center justify-between">
                <span className="routine-symbol">
                  <Dumbbell size={25} />
                </span>
                <span className="eyebrow">
                  RUTINA {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{r.name}</h3>
              <p className="muted">
                {r.description || "Tu sesión de entrenamiento personalizada."}
              </p>
              <div className="tags">
                <span>{r.exercises.length} ejercicios</span>
                <span>
                  {r.exercises.reduce((n, e) => n + e.sets.length, 0)} series
                </span>
              </div>
              <ul className="routine-list">
                {r.exercises.map((e) => (
                  <li key={e.id}>
                    <span>{e.name}</span>
                    <span>
                      {e.sets.length} × {e.sets.map((s) => s.reps).join("/")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="routine-footer">
                <button className="text-button" onClick={() => onStart(r)}>
                  Entrenar <ArrowUpRight size={18} />
                </button>
                <div className="flex gap-1">
                  <button
                    className="icon-btn"
                    aria-label={`Editar ${r.name}`}
                    onClick={() => {
                      setError("");
                      setEditing(structuredClone(r));
                    }}
                  >
                    <Pencil size={17} />
                  </button>
                  <DeleteButton onDelete={() => remove("routines", r.id)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <Modal
          title={
            data.routines.some((r) => r.id === editing.id)
              ? "Editar rutina"
              : "Nueva rutina"
          }
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form onSubmit={submit}>
            <div className="form-content">
              <Field label="Nombre de la rutina">
                <input
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Ej. Tren superior"
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  maxLength={500}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Enfoque y objetivos de esta sesión"
                />
              </Field>
              <ExerciseEditor
                exercises={editing.exercises}
                onChange={(exercises) => setEditing({ ...editing, exercises })}
              />
              <ErrorMessage message={error} />
            </div>
            <FormFooter busy={busy} onClose={() => setEditing(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
