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
          <span className="eyebrow">GYM & HEALTH TRACKER</span>
          <h1>
            Tu esfuerzo.
            <br />
            Tu evolución.
          </h1>
          <p>Un espacio para entrenar con intención y entender tu progreso.</p>
          <div className="auth-features">
            <span>
              <Dumbbell /> Entrenamientos a tu medida
            </span>
            <span>
              <Activity /> Tu salud, en perspectiva
            </span>
            <span>
              <ChartNoAxesCombined /> Cada avance cuenta
            </span>
          </div>
        </div>
        <small>Construye tu mejor versión, un día a la vez.</small>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <span className="eyebrow">TU PRÓXIMO PASO</span>
          <h2>
            {mode === "register"
              ? "Crea tu cuenta"
              : mode === "reset"
                ? "Recupera tu acceso"
                : "Qué bueno verte"}
          </h2>
          <p className="muted">
            {mode === "register"
              ? "Empieza a registrar lo que te hace más fuerte."
              : "Continúa donde lo dejaste."}
          </p>
          {configured ? (
            <form onSubmit={submit}>
              <Field label="Correo electrónico">
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
                <Field label="Contraseña">
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                </Field>
              )}
              <ErrorMessage message={error} />
              {message && (
                <p role="status" className="success">
                  {message}
                </p>
              )}
              <button className="btn primary w-full" disabled={busy}>
                {busy
                  ? "Un momento…"
                  : mode === "register"
                    ? "Crear cuenta"
                    : mode === "reset"
                      ? "Enviar instrucciones"
                      : "Iniciar sesión"}
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
                  ? "Ya tengo una cuenta"
                  : "Crear una cuenta"}
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
                  Olvidé mi contraseña
                </button>
              )}
              {mode === "reset" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setMode("login")}
                >
                  Volver al inicio de sesión
                </button>
              )}
            </form>
          ) : (
            <p className="notice">
              Firebase todavía no está conectado. Puedes explorar la aplicación
              con datos de ejemplo.
            </p>
          )}
          <div className="divider" />
          <button className="btn secondary w-full" onClick={startDemo}>
            Explorar demostración <ArrowRight size={17} />
          </button>
          <p className="small muted">
            La demostración se guarda solo en esta pestaña.
          </p>
        </div>
      </section>
    </div>
  );
}
