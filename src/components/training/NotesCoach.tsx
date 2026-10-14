import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  noteMessages,
  type NoteSource,
  type NoteSignal,
} from "../../lib/noteCoach";
import { dateLabel, numberLabel } from "../../lib/metrics";
import { t, useLanguage } from "../../lib/i18n";
import { useAuth } from "../../context/AuthContext";
export default function NotesCoach({ sources }: { sources: NoteSource[] }) {
  useLanguage();
  const { user, demo } = useAuth();
  const signature = JSON.stringify([user?.uid, demo, sources]);
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const [result, setResult] = useState<{
    signature: string;
    signals: NoteSignal[];
  } | null>(null);
  useEffect(() => {
    setResult(null);
    setError("");
    setBusy(false);
    return () => controller.current?.abort();
  }, [signature]);
  async function run() {
    controller.current?.abort();
    const task = new AbortController();
    controller.current = task;
    setBusy(true);
    setProgress(0);
    setError("");
    setResult(null);
    try {
      const { analyzeNotes } = await import("../../lib/localNotesAI");
      const signals = await analyzeNotes(sources, task.signal, setProgress);
      if (!task.signal.aborted) setResult({ signature, signals });
    } catch (e) {
      if (!task.signal.aborted)
        setError(
          e instanceof Error && e.message === "unsupported-gpu"
            ? "Este navegador o dispositivo no dispone de WebGPU compatible. Puedes seguir usando la comparación de series y consultar tus notas."
            : "No se pudo completar el análisis local. Comprueba la conexión, la memoria disponible y vuelve a intentarlo. Tus registros están guardados.",
        );
    } finally {
      if (!task.signal.aborted) setBusy(false);
    }
  }
  return (
    <section
      className="notes-coach"
      aria-label={t("Preparar la próxima sesión")}
    >
      <h3>
        <Sparkles size={18} />
        {t("Preparar la próxima sesión")}
      </h3>
      <p className="muted small">
        {t(
          "IA local gratuita: interpreta hasta 3 notas del mismo entrenamiento y día de rutina (700 caracteres por nota). Tus notas no se envían a un proveedor de IA.",
        )}
      </p>
      {!sources.length ? (
        <p className="notice">
          {t(
            "No hay notas de sesiones comparables. Al guardar, anota técnica, descansos y cómo te sentiste en las últimas series.",
          )}
        </p>
      ) : (
        <>
          <details>
            <summary>{t("Notas que se van a analizar")}</summary>
            {sources.map((s) => (
              <blockquote key={s.id}>
                <strong>
                  {dateLabel(s.date)} · {s.date.slice(0, 4)}
                </strong>
                <p>{s.notes}</p>
              </blockquote>
            ))}
          </details>
          <p className="small muted">
            {t(
              "La primera vez descarga aproximadamente 1 GB de modelo y necesita memoria y WebGPU. Se reutiliza la caché del navegador; puedes cancelar. No hay claves ni pagos por consulta.",
            )}
          </p>
          <div className="coach-actions">
            <button
              type="button"
              className="btn secondary"
              disabled={busy}
              onClick={run}
            >
              <Sparkles size={16} />
              {t(
                result?.signature === signature
                  ? "Volver a analizar notas"
                  : "Analizar notas con IA local",
              )}
            </button>
            {busy && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  controller.current?.abort();
                  setBusy(false);
                }}
              >
                {t("Cancelar")}
              </button>
            )}
          </div>
          {busy && (
            <div className="coach-progress" role="status">
              <progress
                max={1}
                value={progress}
                aria-label={t("Preparando IA local")}
              />
              {progress < 1
                ? t("Preparando modelo: {0}%", {
                    0: numberLabel(progress * 100, 0),
                  })
                : t("Analizando tus notas en este dispositivo…")}
            </div>
          )}
          {error && (
            <p className="notice" role="alert">
              {t(error)}
            </p>
          )}
          {result?.signature === signature && (
            <div className="coach-results" aria-live="polite">
              <p className="small muted">
                {t(
                  "La IA propone temas y Forma muestra consejos limitados a esos temas. Revisa las citas: un modelo pequeño puede interpretar mal una nota. No modifica tus series.",
                )}
              </p>
              {!result.signals.length && (
                <p>
                  {t(
                    "No se encontraron observaciones con evidencia suficiente. Revisa tus notas y la comparación de series.",
                  )}
                </p>
              )}
              {result.signals.map((s) => (
                <article key={s.topic}>
                  <h4>{t(noteMessages[s.topic].title)}</h4>
                  <blockquote>
                    {s.quote}
                    <small>
                      {dateLabel(
                        sources.find((n) => n.id === s.sourceId)!.date,
                      )}
                    </small>
                  </blockquote>
                  <p>{t(noteMessages[s.topic].advice)}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
