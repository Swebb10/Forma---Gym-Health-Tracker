import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import {
  noteMessages,
  reviewNotes,
  type NoteSource,
  type NoteSignal,
} from "../../lib/noteCoach";
import { dateLabel } from "../../lib/metrics";
import { t, useLanguage } from "../../lib/i18n";
import { useAuth } from "../../context/AuthContext";
export default function NotesCoach({ sources }: { sources: NoteSource[] }) {
  useLanguage();
  const { user, demo } = useAuth();
  const signature = JSON.stringify([user?.uid, demo, sources]);
  const [result, setResult] = useState<{
    signature: string;
    signals: NoteSignal[];
  } | null>(null);
  useEffect(() => {
    setResult(null);
  }, [signature]);
  function run() {
    setResult({ signature, signals: reviewNotes(sources) });
  }
  return (
    <section
      className="notes-coach"
      aria-label={t("Preparar la próxima sesión")}
    >
      <h3>
        <ClipboardCheck size={18} />
        {t("Preparar la próxima sesión")}
      </h3>
      <p className="muted small">
        {t(
          "Asistente ligero basado en reglas, no en IA. Revisa hasta 3 notas del mismo entrenamiento y día de rutina (700 caracteres por nota). Sin descargas, cuentas ni uso de GPU; tus notas se revisan en este dispositivo.",
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
            <summary>{t("Notas para revisar")}</summary>
            {sources.map((s) => (
              <blockquote key={s.id}>
                <strong>
                  {dateLabel(s.date)} · {s.date.slice(0, 4)}
                </strong>
                <p>{s.notes}</p>
              </blockquote>
            ))}
          </details>
          <div className="coach-actions">
            <button type="button" className="btn secondary" onClick={run}>
              <ClipboardCheck size={16} />
              {t(
                result?.signature === signature
                  ? "Volver a revisar notas"
                  : "Revisar mis notas",
              )}
            </button>
          </div>
          {result?.signature === signature && (
            <div className="coach-results" aria-live="polite">
              <p className="small muted">
                {t(
                  "Estas sugerencias usan frases reconocibles de tus notas. Revisa cada cita: las reglas pueden omitir matices. No modifican tus series ni indican cuánto peso debes levantar.",
                )}
              </p>
              {!result.signals.length && (
                <p>
                  {t(
                    "No encontramos frases que coincidan con las reglas. Eso no significa que no haya nada que mejorar; consulta tus notas y la comparación de series.",
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
