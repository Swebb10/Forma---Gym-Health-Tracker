import LanguageSelector from "./LanguageSelector";
import { t, useLanguage } from "../lib/i18n";
import { useEffect, useRef, type ReactNode } from "react";
import { X, Plus, Trash2 } from "lucide-react";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  useLanguage();
  return (
    <label className="field">
      <span>{t(label)}</span>
      {children}
    </label>
  );
}
export function Empty({
  title,
  description,
  onAction,
}: {
  title: string;
  description: string;
  onAction?: () => void;
}) {
  useLanguage();
  return (
    <div className="empty">
      <div className="empty-icon">
        <Plus size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction && (
        <button className="btn primary" onClick={onAction}>
          {t("Crear primer registro")}
        </button>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <div className="modal-actions">
          <LanguageSelector />
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={t("Cerrar")}
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {children}
    </dialog>
  );
}
export function FormFooter({
  busy,
  onClose,
}: {
  busy: boolean;
  onClose: () => void;
}) {
  useLanguage();
  return (
    <div className="form-footer">
      <button
        type="button"
        className="btn secondary"
        disabled={busy}
        onClick={onClose}
      >
        {t("Cancelar")}
      </button>
      <button className="btn primary" disabled={busy}>
        {busy ? t("Guardando…") : t("Guardar registro")}
      </button>
    </div>
  );
}
export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  useLanguage();
  return (
    <button
      className="icon-btn danger"
      aria-label={t("Eliminar registro")}
      onClick={async () => {
        if (
          window.confirm(
            t("¿Eliminar este registro? Esta acción no se puede deshacer."),
          )
        ) {
          try {
            await onDelete();
          } catch {
            window.alert(
              t(
                "No se pudo eliminar. Comprueba tu conexión e inténtalo de nuevo.",
              ),
            );
          }
        }
      }}
    >
      <Trash2 size={17} />
    </button>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  useLanguage();
  return message ? (
    <p className="error" role="alert">
      {t(message)}
    </p>
  ) : null;
}
