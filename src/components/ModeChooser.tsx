import { t, useLanguage } from "../lib/i18n";
import { Dumbbell, ShieldCheck } from "lucide-react";
import { Modal } from "./ui";
export default function ModeChooser({
  onSelect,
}: {
  onSelect: (mode: "user" | "admin") => void;
}) {
  useLanguage();
  return (
    <Modal title={t("¿Cómo quieres entrar?")} onClose={() => onSelect("user")}>
      <div className="form-content mode-chooser">
        <p className="muted">
          {t(
            "Tu cuenta tiene acceso a ambos espacios. Puedes cambiar de modo cuando quieras.",
          )}
        </p>
        <button className="mode-card" onClick={() => onSelect("user")}>
          <Dumbbell size={28} />
          <strong>{t("Entrar como usuario")}</strong>
          <span>{t("Mis rutinas, entrenamientos y progreso personal.")}</span>
        </button>
        <button className="mode-card" onClick={() => onSelect("admin")}>
          <ShieldCheck size={28} />
          <strong>{t("Entrar como administrador")}</strong>
          <span>{t("Suscripciones, pagos, cuentas y configuración.")}</span>
        </button>
      </div>
    </Modal>
  );
}
