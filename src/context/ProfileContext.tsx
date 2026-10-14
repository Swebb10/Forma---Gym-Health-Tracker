import {
  createContext,
  useContext,
  useEffect,
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
import { useSubscription } from "./SubscriptionContext";
import type { BodyProfile, WeightUnit } from "../types";
type Profile = { bodyProfile?: BodyProfile; activeRoutineId?: string | null };
type State = {
  profile: Profile;
  loading: boolean;
  error: string;
  unit: WeightUnit;
  setUnit: (u: WeightUnit) => void;
  saveProfile: (patch: Profile) => Promise<void>;
};
const Context = createContext<State>(null!);
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth(),
    { canWrite } = useSubscription();
  const [profile, setProfile] = useState<Profile>({}),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [unit, updateUnit] = useState<WeightUnit>(() => {
    try {
      return localStorage.getItem("forma-body-unit") === "lb" ? "lb" : "kg";
    } catch {
      return "kg";
    }
  });
  useEffect(() => {
    setProfile({});
    setLoading(true);
    setError("");
    if (demo) {
      try {
        setProfile(
          JSON.parse(sessionStorage.getItem("forma-demo-profile-v1") ?? "{}"),
        );
      } catch {}
      setLoading(false);
      return;
    }
    if (!db || !user) {
      setLoading(false);
      return;
    }
    return onSnapshot(
      doc(db, "users", user.uid),
      (s) => {
        const d = s.data();
        setProfile({
          bodyProfile: d?.bodyProfile,
          activeRoutineId: d?.activeRoutineId,
        });
        setLoading(false);
        setError("");
      },
      () => {
        setLoading(false);
        setError("No se pudo cargar el perfil corporal.");
      },
    );
  }, [user?.uid, demo]);
  async function saveProfile(patch: Profile) {
    if (!canWrite || loading || error)
      throw Error("No se puede guardar el perfil en este momento.");
    if (demo) {
      const next = { ...profile, ...patch };
      sessionStorage.setItem("forma-demo-profile-v1", JSON.stringify(next));
      setProfile(next);
      return;
    }
    if (!db || !user) throw Error("Debes iniciar sesión.");
    await runTransaction(db, async (tx) => {
      const ref = doc(db!, "users", user.uid),
        s = await tx.get(ref);
      tx.set(
        ref,
        {
          ...patch,
          createdAt: s.data()?.createdAt ?? serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
  }
  return (
    <Context.Provider
      value={{
        profile,
        loading,
        error,
        unit,
        setUnit: (u) => {
          updateUnit(u);
          try {
            localStorage.setItem("forma-body-unit", u);
          } catch {}
        },
        saveProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useProfile = () => useContext(Context);
