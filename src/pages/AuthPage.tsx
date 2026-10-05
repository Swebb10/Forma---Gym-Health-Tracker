import LanguageSelector from "../components/LanguageSelector";
import { t, useLanguage } from "../lib/i18n";
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  ArrowRight,
  Activity,
  Dumbbell,
  ChartNoAxesCombined,
} from "lucide-react";
import { auth, configured } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Field, ErrorMessage } from "../components/ui";
export default function AuthPage() {
  useLanguage();
  const { startDemo } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setMessage(
          "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.",
        );
      } else if (mode === "register")
        await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === "auth/weak-password"
          ? "Utiliza una contraseña de al menos 8 caracteres."
          : code === "auth/email-already-in-use"
            ? "Este correo ya tiene una cuenta."
            : code === "auth/too-many-requests"
              ? "Demasiados intentos. Inténtalo más tarde."
              : code === "auth/network-request-failed"
                ? "No se pudo conectar. Revisa tu conexión."
                : "No se pudo completar la solicitud. Revisa los datos y la configuración de Firebase.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="brand">
          <span className="brand-mark">f.</span>forma
          <span className="brand-dot">®</span>
        </div>
        <div>
          <span className="eyebrow">{t("GYM & HEALTH TRACKER")}</span>
          <h1>
            {t("Tu esfuerzo.")}
            <br />
            {t("Tu evolución.")}
          </h1>
          <p>
            {t(
              "Un espacio para entrenar con intención y entender tu progreso.",
            )}
          </p>
          <div className="auth-features">
            <span>
              <Dumbbell /> {t("Entrenamientos a tu medida")}
            </span>
            <span>
              <Activity /> {t("Tu salud, en perspectiva")}
            </span>
            <span>
              <ChartNoAxesCombined /> {t("Cada avance cuenta")}
            </span>
          </div>
        </div>
        <small>{t("Construye tu mejor versión, un día a la vez.")}</small>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-language">
            <LanguageSelector />
          </div>
          <span className="eyebrow">{t("TU PRÓXIMO PASO")}</span>
          <h2>
            {mode === "register"
              ? t("Crea tu cuenta")
              : mode === "reset"
                ? t("Recupera tu acceso")
                : t("Qué bueno verte")}
          </h2>
          <p className="muted">
            {mode === "register"
              ? t("Empieza a registrar lo que te hace más fuerte.")
              : t("Continúa donde lo dejaste.")}
          </p>
          {configured ? (
            <form onSubmit={submit}>
              <Field label={t("Correo electrónico")}>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </Field>
              {mode !== "reset" && (
                <Field label={t("Contraseña")}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Mínimo 8 caracteres")}
                  />
                </Field>
              )}
              <ErrorMessage message={t(error)} />
              {message && (
                <p role="status" className="success">
                  {t(message)}
                </p>
              )}
              <button className="btn primary w-full" disabled={busy}>
                {busy
                  ? t("Un momento…")
                  : mode === "register"
                    ? t("Crear cuenta")
                    : mode === "reset"
                      ? t("Enviar instrucciones")
                      : t("Iniciar sesión")}
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMode(mode === "register" ? "login" : "register");
                  setError("");
                  setMessage("");
                }}
              >
                {mode === "register"
                  ? t("Ya tengo una cuenta")
                  : t("Crear una cuenta")}
              </button>
              {mode === "login" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                  }}
                >
                  {t("Olvidé mi contraseña")}
                </button>
              )}
              {mode === "reset" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setMode("login")}
                >
                  {t("Volver al inicio de sesión")}
                </button>
              )}
            </form>
          ) : (
            <p className="notice">
              {t(
                "Firebase todavía no está conectado. Puedes explorar la aplicación con datos de ejemplo.",
              )}
            </p>
          )}
          <div className="divider" />
          <button className="btn secondary w-full" onClick={startDemo}>
            {t("Explorar demostración")} <ArrowRight size={17} />
          </button>
          <p className="small muted">
            {t("La demostración se guarda solo en esta pestaña.")}
          </p>
        </div>
      </section>
    </div>
  );
}
