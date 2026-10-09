import { NutritionProvider } from "./context/NutritionContext";
import LanguageSelector from "./components/LanguageSelector";
import { t, useLanguage, getLocale } from "./lib/i18n";
import { useState, useEffect, lazy, Suspense } from "react";
import {
  Utensils,
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
const Nutrition = lazy(() => import("./pages/Nutrition"));
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
  { id: "nutrition", label: "Nutrición", icon: Utensils },
  { id: "subscription", label: "Mi suscripción", icon: CreditCard },
] as const;
function Workspace() {
  useLanguage();
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
          aria-label={t("Cerrar navegación")}
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
            aria-label={t("Cerrar menú")}
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
          <div className="sidebar-caption">
            {mode === "admin" && isAdmin
              ? t("ADMINISTRACIÓN")
              : t("TU ESPACIO PERSONAL")}
          </div>
          <nav aria-label={t("Navegación principal")}>
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
                {t(n.label)}
                {page === n.id && <span className="nav-dot" />}
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="small">{t("EL PROGRESO ES PERSONAL")}</span>
            <p>{t("Tu único punto de comparación eres tú.")}</p>
            <Activity size={28} />
          </div>
        </div>
        <div className="sidebar-bottom">
          {isAdmin && (
            <button
              className="btn secondary mode-switch"
              onClick={() => setChooseMode(true)}
            >
              <ArrowLeftRight size={16} /> {t("Cambiar de modo")}
            </button>
          )}
          <div className="profile">
            <span className="avatar">
              {demo ? "D" : (user?.email?.[0].toUpperCase() ?? "U")}
            </span>
            <div>
              <strong>
                {demo
                  ? t("Perfil de demostración")
                  : user?.email?.split("@")[0]}
              </strong>
              <span>
                {demo
                  ? t("Datos de ejemplo")
                  : isAdmin
                    ? mode === "admin"
                      ? t("Súper administrador")
                      : t("Modo usuario")
                    : t("Cuenta personal")}
              </span>
            </div>
            <button
              className="icon-btn"
              aria-label={
                demo ? t("Salir de demostración") : t("Cerrar sesión")
              }
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
              aria-label={t("Abrir menú")}
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span className="topbar-breadcrumb">
              {mode === "admin" ? t("Administración") : t("Mi espacio")}{" "}
              <span>/</span>{" "}
              <strong>{t(nav.find((n) => n.id === page)?.label ?? "")}</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="topbar-date">
              {new Intl.DateTimeFormat(getLocale(), {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
            <LanguageSelector />
            <button
              className="icon-btn theme-button"
              aria-label={
                dark ? t("Activar tema claro") : t("Activar tema oscuro")
              }
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
                ? t(
                    "Tu suscripción venció. Renueva tu plan para continuar registrando tu progreso.",
                  )
                : t(
                    "Tu cuenta está suspendida. Contacta al administrador.",
                  )}{" "}
              {t("Tus registros se conservan.")}
            </p>
          )}
          {canWrite &&
            !isAdmin &&
            !demo &&
            subscriptionState.days <= 7 &&
            page !== "subscription" && (
              <div className="notice subscription-alert">
                {t("Tu acceso vence en {0} días.", {
                  0: subscriptionState.days,
                })}{" "}
                <button
                  className="text-button"
                  onClick={() => navigate("subscription")}
                >
                  {t("Ver mi suscripción")}
                </button>
              </div>
            )}
          {loading ? (
            <div className="loading">{t("Cargando tu progreso…")}</div>
          ) : (
            <Suspense
              fallback={<div className="loading">{t("Cargando…")}</div>}
            >
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
              ) : visiblePage === "nutrition" ? (
                <Nutrition />
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
              {t("Tu bienestar, paso a paso")} <ArrowUpRight size={13} />
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
  useLanguage();
  const { user, demo, loading, leave } = useAuth();
  const subscription = useSubscription();
  if (loading || ((user || demo) && subscription.loading))
    return <div className="loading">{t("Preparando tu espacio…")}</div>;
  if ((user || demo) && subscription.error)
    return (
      <main className="setup-error">
        <LanguageSelector />
        <h1>{t("No se pudo preparar tu cuenta")}</h1>
        <ErrorMessage message={subscription.error} />
        <button className="btn primary" onClick={subscription.retry}>
          {t("Reintentar")}
        </button>
        <button className="btn secondary" onClick={() => void leaveSafe()}>
          {t("Cerrar sesión")}
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
      <NutritionProvider>
        <Workspace />
      </NutritionProvider>
    </DataProvider>
  ) : (
    <Suspense fallback={<div className="loading">{t("Cargando…")}</div>}>
      <AuthPage />
    </Suspense>
  );
}
export default function App() {
  useLanguage();
  return (
    <AuthProvider>
      <a className="skip-link" href="#main">
        {t("Saltar al contenido")}
      </a>
      <SubscriptionProvider>
        <Gate />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
