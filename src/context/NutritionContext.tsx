import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { useSubscription } from "./SubscriptionContext";
import {
  buildNutrition,
  sameNutrition,
  type NutritionPreferences,
  type NutritionSnapshot,
} from "../lib/nutrition";
import { localDate } from "../lib/metrics";
const DEMO_KEY = "forma-demo-nutrition-v1";
type State = {
  saved: NutritionSnapshot | null;
  current: NutritionSnapshot | null;
  loading: boolean;
  syncing: boolean;
  error: string;
  save: (p: NutritionPreferences) => Promise<void>;
  retry: () => void;
};
const Context = createContext<State>(null!);
export function NutritionProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth(),
    { data, loading: dataLoading, error: dataError } = useData(),
    { canWrite } = useSubscription();
  const uid = user?.uid;
  const [saved, setSaved] = useState<NutritionSnapshot | null>(null),
    [loading, setLoading] = useState(true),
    [syncing, setSyncing] = useState(false),
    [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setSaved(null);
    setLoading(true);
    setError("");
    if (demo) {
      try {
        const raw = sessionStorage.getItem(DEMO_KEY);
        const value = raw ? JSON.parse(raw) : null;
        if (value?.version === 1) setSaved(value);
      } catch {}
      setLoading(false);
      return;
    }
    if (!db || !uid) {
      setLoading(false);
      return;
    }
    return onSnapshot(
      doc(db, "users", uid),
      (snapshot) => {
        setSaved(snapshot.data()?.nutrition ?? null);
        setLoading(false);
        setError("");
      },
      () => {
        setLoading(false);
        setError(
          "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.",
        );
      },
    );
  }, [uid, demo, attempt]);
  const today = localDate();
  const current = useMemo(
    () =>
      saved
        ? buildNutrition(
            saved.preferences,
            data.bioimpedance,
            data.measurements,
            today,
          )
        : null,
    [saved, data.bioimpedance, data.measurements, today],
  );
  const persist = useCallback(
    async (next: NutritionSnapshot, expected: NutritionSnapshot | null) => {
      if (demo) {
        sessionStorage.setItem(DEMO_KEY, JSON.stringify(next));
        setSaved(next);
        return;
      }
      if (!db || !uid) throw new Error("Debes iniciar sesión.");
      await runTransaction(db, async (transaction) => {
        const ref = doc(db!, "users", uid),
          snap = await transaction.get(ref),
          previous = snap.data();
        if (!sameNutrition(previous?.nutrition ?? null, expected))
          throw new Error(
            "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.",
          );
        transaction.set(
          ref,
          {
            nutrition: next,
            createdAt: previous?.createdAt ?? serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
    },
    [demo, uid],
  );
  // Persist the refreshed estimate only after all source collections are loaded.
  // Failed writes remain visible and retry only on an explicit retry or source change.
  const signature = JSON.stringify(current),
    savedSignature = JSON.stringify(saved);
  useEffect(() => {
    if (
      loading ||
      dataLoading ||
      dataError ||
      error ||
      !canWrite ||
      !current ||
      sameNutrition(saved, current)
    )
      return;
    let active = true;
    setSyncing(true);
    void persist(current, saved)
      .catch(() => {
        if (active)
          setError(
            "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.",
          );
      })
      .finally(() => {
        if (active) setSyncing(false);
      });
    return () => {
      active = false;
      setSyncing(false);
    };
  }, [
    signature,
    savedSignature,
    loading,
    dataLoading,
    dataError,
    canWrite,
    error,
    persist,
  ]);
  const save = async (preferences: NutritionPreferences) => {
    if (!canWrite)
      throw new Error(
        "Tu suscripción no permite guardar registros. Revisa Mi suscripción.",
      );
    if (loading || dataLoading || dataError || syncing)
      throw new Error("Espera a que termine la sincronización de tus datos.");
    const next = buildNutrition(
      preferences,
      data.bioimpedance,
      data.measurements,
      today,
    );
    await persist(next, saved);
    setError("");
  };
  return (
    <Context.Provider
      value={{
        saved,
        current,
        loading,
        syncing,
        error,
        save,
        retry: () => setAttempt((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useNutrition = () => useContext(Context);
