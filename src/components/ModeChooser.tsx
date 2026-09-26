import { Dumbbell, ShieldCheck } from "lucide-react";
import { Modal } from "./ui";
export default function ModeChooser({
  onSelect,
}: {
  onSelect: (mode: "user" | "admin") => void;
}) {
  return (
    <Modal title="¿Cómo quieres entrar?" onClose={() => onSelect("user")}>
      <div className="form-content mode-chooser">
        <p className="muted">
          Tu cuenta tiene acceso a ambos espacios. Puedes cambiar de modo cuando
          quieras.
        </p>
        <button className="mode-card" onClick={() => onSelect("user")}>
          <Dumbbell size={28} />
          <strong>Entrar como usuario</strong>
          <span>Mis rutinas, entrenamientos y progreso personal.</span>
        </button>
        <button className="mode-card" onClick={() => onSelect("admin")}>
          <ShieldCheck size={28} />
          <strong>Entrar como administrador</strong>
          <span>Suscripciones, pagos, cuentas y configuración.</span>
        </button>
      </div>
    </Modal>
  );
}
