import { useState, useEffect, lazy, Suspense } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Ruler,
  Activity,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  CreditCard,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider, useData } from "./context/DataContext";
import { WorkoutForm, newWorkout } from "./components/WorkoutForm";
import {
  SubscriptionProvider,
  useSubscription,
} from "./context/SubscriptionContext";
import ModeChooser from "./components/ModeChooser";
import OwnerVerification from "./components/OwnerVerification";
import { membership } from "./lib/subscription";
import { ErrorMessage } from "./components/ui";
import type { Page, Routine, RoutineDay, Workout } from "./types";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Routines = lazy(() => import("./pages/Routines"));
const Workouts = lazy(() => import("./pages/Workouts"));
const Measurements = lazy(() => import("./pages/Measurements"));
const Bioimpedance = lazy(() => import("./pages/Bioimpedance"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Admin = lazy(() => import("./pages/Admin"));
const personalNav = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "workouts", label: "Entrenamientos", icon: Dumbbell },
  { id: "routines", label: "Mis rutinas", icon: ClipboardList },
  { id: "measurements", label: "Medidas corporales", icon: Ruler },
  { id: "bioimpedance", label: "Bioimpedancia", icon: Activity },
  { id: "subscription", label: "Mi suscripción", icon: CreditCard },
] as const;
function Workspace() {
  const { user, demo, leave } = useAuth(),
    { loading, error } = useData();
  const { isAdmin, canWrite, member, now } = useSubscription();
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [chooseMode, setChooseMode] = useState(true);
  const nav =
    mode === "admin" && isAdmin
      ? [{ id: "admin" as const, label: "Administración", icon: ShieldCheck }]
      : personalNav;
  const [page, setPage] = useState<Page>(() =>
      nav.some((n) => n.id === location.hash.slice(1))
        ? (location.hash.slice(1) as Page)
        : "dashboard",
    ),
    [menu, setMenu] = useState(false),
    [workout, setWorkout] = useState<Workout | null>(null),
    [sessionError, setSessionError] = useState("");
  const [dark, setDark] = useState(() => {
    try {
      return (
        localStorage.getItem("forma-theme") === "dark" ||
        (!localStorage.getItem("forma-theme") &&
          matchMedia("(prefers-color-scheme: dark)").matches)
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("forma-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    const update = () => {
      const p = location.hash.slice(1);
      if (nav.some((n) => n.id === p)) setPage(p as Page);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [mode, isAdmin]);
  const navigate = (next: Page) => {
    location.hash = next;
    setPage(next);
    setMenu(false);
    window.scrollTo({ top: 0 });
  };
  const selectMode = (next: "user" | "admin") => {
    setMode(next);
    setChooseMode(false);
    setWorkout(null);
    navigate(next === "admin" ? "admin" : "dashboard");
  };
  useEffect(() => {
    if (!isAdmin && page === "admin") {
      setMode("user");
      navigate("dashboard");
    }
  }, [isAdmin, page]);
  const start = (r?: Routine, day?: RoutineDay) => {
    if (canWrite) setWorkout(newWorkout(r, day));
  };
  const visiblePage = !canWrite && page !== "admin" ? "subscription" : page;
  const subscriptionState = membership(member, now);
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="sidebar-scroll">
          <a
            href={mode === "admin" ? "#admin" : "#dashboard"}
            onClick={() => navigate(mode === "admin" ? "admin" : "dashboard")}
            className="brand"
          >
            <span className="brand-mark">f.</span>forma
            <span className="brand-dot">®</span>
          </a>
          <button
            className="icon-btn mobile-close"
            aria-label="Cerrar menú"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
          <div className="sidebar-caption">
            {mode === "admin" && isAdmin
              ? "ADMINISTRACIÓN"
              : "TU ESPACIO PERSONAL"}
          </div>
          <nav aria-label="Navegación principal">
            {nav.map((n) => (
              <a
                href={"#" + n.id}
                key={n.id}
                className={page === n.id ? "active" : ""}
                aria-current={page === n.id ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(n.id);
                }}
              >
                <n.icon size={20} />
                {n.label}
                {page === n.id && <span className="nav-dot" />}
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="small">EL PROGRESO ES PERSONAL</span>
            <p>Tu único punto de comparación eres tú.</p>
            <Activity size={28} />
          </div>
        </div>
        <div className="sidebar-bottom">
          {isAdmin && (
            <button
              className="btn secondary mode-switch"
              onClick={() => setChooseMode(true)}
            >
              <ArrowLeftRight size={16} /> Cambiar de modo
            </button>
          )}
          <div className="profile">
            <span className="avatar">
              {demo ? "D" : (user?.email?.[0].toUpperCase() ?? "U")}
            </span>
            <div>
              <strong>
                {demo ? "Perfil de demostración" : user?.email?.split("@")[0]}
              </strong>
              <span>
                {demo
                  ? "Datos de ejemplo"
                  : isAdmin
                    ? mode === "admin"
                      ? "Súper administrador"
                      : "Modo usuario"
                    : "Cuenta personal"}
              </span>
            </div>
            <button
              className="icon-btn"
              aria-label={demo ? "Salir de demostración" : "Cerrar sesión"}
              onClick={async () => {
                try {
                  await leave();
                } catch {
                  setSessionError(
                    "No se pudo cerrar la sesión. Inténtalo de nuevo.",
                  );
                }
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="icon-btn mobile-menu"
              aria-label="Abrir menú"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span className="topbar-breadcrumb">
              {mode === "admin" ? "Administración" : "Mi espacio"}{" "}
              <span>/</span>{" "}
              <strong>{nav.find((n) => n.id === page)?.label}</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="topbar-date">
              {new Intl.DateTimeFormat("es", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
            <button
              className="icon-btn theme-button"
              aria-label={dark ? "Activar tema claro" : "Activar tema oscuro"}
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>
        <main id="main">
          <ErrorMessage message={error || sessionError} />
          <OwnerVerification />
          {!canWrite && (
            <p className="notice subscription-alert">
              {member?.active
                ? "Tu suscripción venció. Renueva tu plan para continuar registrando tu progreso."
                : "Tu cuenta está suspendida. Contacta al administrador."}{" "}
              Tus registros se conservan.
            </p>
          )}
          {canWrite &&
            !isAdmin &&
            !demo &&
            subscriptionState.days <= 7 &&
            page !== "subscription" && (
              <div className="notice subscription-alert">
                Tu acceso vence en {subscriptionState.days} días.{" "}
                <button
                  className="text-button"
                  onClick={() => navigate("subscription")}
                >
                  Ver mi suscripción
                </button>
              </div>
            )}
          {loading ? (
            <div className="loading">Cargando tu progreso…</div>
          ) : (
            <Suspense fallback={<div className="loading">Cargando…</div>}>
              {visiblePage === "admin" && isAdmin ? (
                <Admin />
              ) : visiblePage === "subscription" ? (
                <Subscription />
              ) : visiblePage === "dashboard" ? (
                <Dashboard
                  onNavigate={navigate}
                  onNew={() => start()}
                  onStart={start}
                />
              ) : visiblePage === "routines" ? (
                <Routines onStart={start} />
              ) : visiblePage === "workouts" ? (
                <Workouts onNew={() => start()} />
              ) : visiblePage === "measurements" ? (
                <Measurements />
              ) : (
                <Bioimpedance />
              )}
            </Suspense>
          )}
          <footer className="page-footer">
            <span>
              forma <span className="muted">/ Gym & Health Tracker</span>
            </span>
            <span>
              Tu bienestar, paso a paso <ArrowUpRight size={13} />
            </span>
          </footer>
        </main>
      </div>
      {isAdmin && chooseMode && <ModeChooser onSelect={selectMode} />}
      {workout && canWrite && (
        <WorkoutForm initial={workout} onClose={() => setWorkout(null)} />
      )}
    </div>
  );
}
function Gate() {
  const { user, demo, loading, leave } = useAuth();
  const subscription = useSubscription();
  if (loading || ((user || demo) && subscription.loading))
    return <div className="loading">Preparando tu espacio…</div>;
  if ((user || demo) && subscription.error)
    return (
      <main className="setup-error">
        <h1>No se pudo preparar tu cuenta</h1>
        <ErrorMessage message={subscription.error} />
        <button className="btn primary" onClick={subscription.retry}>
          Reintentar
        </button>
        <button className="btn secondary" onClick={() => void leaveSafe()}>
          Cerrar sesión
        </button>
      </main>
    );
  async function leaveSafe() {
    try {
      await leave();
    } catch {
      subscription.retry();
    }
  }
  return user || demo ? (
    <DataProvider key={demo ? "demo" : user!.uid}>
      <Workspace />
    </DataProvider>
  ) : (
    <Suspense fallback={<div className="loading">Cargando…</div>}>
      <AuthPage />
    </Suspense>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <SubscriptionProvider>
        <Gate />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
