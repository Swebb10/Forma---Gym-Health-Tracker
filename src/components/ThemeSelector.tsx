import { useEffect, useId, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { t, useLanguage } from "../lib/i18n";
import { themes, setTheme, useTheme } from "../lib/theme";
import { Modal } from "./ui";

export default function ThemeSelector() {
  useLanguage();
  const current = useTheme();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      trigger.current?.focus();
    }
  }, [open]);
  const id = useId();
  const selected = themes.find((theme) => theme.id === current)!;
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="icon-btn theme-button"
        aria-label={t("Elegir tema")}
        title={t("Tema actual: {0}", { 0: t(selected.name) })}
        aria-haspopup="dialog"
        onClick={() => {
          restoreFocus.current = true;
          setOpen(true);
        }}
      >
        <Palette size={19} />
      </button>
      {open && (
        <Modal
          title={t("Personaliza tu espacio")}
          onClose={() => setOpen(false)}
        >
          <div className="theme-picker">
            <p className="muted" id={`${id}-hint`}>
              {t(
                "Elige un tema. Se aplica al instante y se recuerda en este navegador.",
              )}
            </p>
            <fieldset className="theme-options" aria-describedby={`${id}-hint`}>
              <legend className="sr-only">{t("Tema de la aplicación")}</legend>
              {themes.map((theme) => (
                <label className="theme-option" key={theme.id}>
                  <input
                    type="radio"
                    name={`${id}-theme`}
                    value={theme.id}
                    checked={current === theme.id}
                    onChange={() => setTheme(theme.id)}
                    onClick={() => {
                      // Explicitly choosing the system's current default also saves it.
                      if (current === theme.id) setTheme(theme.id);
                    }}
                    aria-labelledby={`${id}-${theme.id}`}
                    aria-describedby={`${id}-${theme.id}-description`}
                  />
                  <span
                    className="theme-preview"
                    data-theme={theme.id}
                    aria-hidden="true"
                  >
                    <span className="theme-preview-rail">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="theme-preview-main">
                      <span className="theme-preview-top">
                        <i />
                        <b />
                      </span>
                      <span className="theme-preview-stats">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="theme-preview-chart">
                        <svg
                          viewBox="0 0 200 40"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 34 L32 26 L58 30 L88 15 L120 20 L153 6 L200 4"
                            stroke="var(--blue)"
                            strokeWidth="3"
                          />
                          <path
                            d="M0 38 L35 32 L72 36 L107 27 L143 30 L177 18 L200 22"
                            stroke="var(--chart-secondary)"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                          />
                        </svg>
                      </span>
                    </span>
                  </span>
                  <span className="theme-option-name" id={`${id}-${theme.id}`}>
                    {t(theme.name)}
                    {current === theme.id && (
                      <Check size={17} aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className="theme-option-description"
                    id={`${id}-${theme.id}-description`}
                  >
                    {t(theme.description)}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="form-footer">
            <button
              type="button"
              className="btn primary"
              onClick={() => setOpen(false)}
            >
              {t("Listo")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
