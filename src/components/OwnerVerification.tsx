import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { OWNER_EMAIL } from "../lib/subscription";
import { ErrorMessage } from "./ui";
export default function OwnerVerification() {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  if (user?.email?.toLowerCase() !== OWNER_EMAIL || user.emailVerified)
    return null;
  async function act(send: boolean) {
    setBusy(true);
    setError("");
    try {
      if (send) {
        await sendEmailVerification(user!);
        setMessage(
          "Te enviamos un enlace. Revisa tu correo y luego pulsa «Ya verifiqué mi correo».",
        );
      } else {
        await refresh();
        setMessage(
          "Verificación actualizada. Si aún aparece este aviso, abre primero el enlace del correo.",
        );
      }
    } catch {
      setError(
        "No se pudo completar la solicitud. Espera un momento e inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="notice verification">
      <strong>Activa tu acceso de súper administrador</strong>
      <p>
        Confirma que eres el titular de {OWNER_EMAIL}. Después podrás elegir
        cómo entrar.
      </p>
      <div className="billing-actions">
        <button
          className="btn secondary"
          disabled={busy}
          onClick={() => act(true)}
        >
          Enviar verificación
        </button>
        <button
          className="btn primary"
          disabled={busy}
          onClick={() => act(false)}
        >
          Ya verifiqué mi correo
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      <ErrorMessage message={error} />
    </section>
  );
}
