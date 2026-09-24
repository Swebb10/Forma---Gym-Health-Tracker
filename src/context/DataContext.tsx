import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { demoData } from "../lib/demo";
import { useAuth } from "./AuthContext";
import type { Collections, Store } from "../types";
const empty: Store = {
  routines: [],
  workouts: [],
  measurements: [],
  bioimpedance: [],
};
const keys = Object.keys(empty) as (keyof Store)[];
type DataState = {
  data: Store;
  loading: boolean;
  error: string;
  save: <K extends keyof Collections>(
    key: K,
    value: Collections[K],
  ) => Promise<void>;
  remove: (key: keyof Store, id: string) => Promise<void>;
};
const Context = createContext<DataState>(null!);
export function DataProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth();
  const [data, setData] = useState<Store>(empty),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    setData(empty);
    setError("");
    setLoading(true);
    if (demo) {
      try {
        const saved = sessionStorage.getItem("forma-demo-v1");
        setData(saved ? JSON.parse(saved) : demoData());
      } catch {
        setData(demoData());
      }
      setLoading(false);
      return;
    }
    if (!user || !db) {
      setLoading(false);
      return;
    }
    const pending = new Set(keys);
    const off = keys.map((key) =>
      onSnapshot(
        collection(db!, "users", user.uid, key),
        (snapshot) => {
          setData((d) => ({
            ...d,
            [key]: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
          }));
          pending.delete(key);
          if (!pending.size) setLoading(false);
        },
        () => {
          setError(
            "No se pudieron cargar los datos. Revisa tu conexión y las reglas de Firestore.",
          );
          setLoading(false);
        },
      ),
    );
    return () => off.forEach((unsubscribe) => unsubscribe());
  }, [user, demo]);
  function updateDemo(next: Store) {
    sessionStorage.setItem("forma-demo-v1", JSON.stringify(next));
    setData(next);
  }
  const save: DataState["save"] = async (key, value) => {
    const clean = JSON.parse(JSON.stringify(value));
    if (demo) {
      updateDemo({
        ...data,
        [key]: [...data[key].filter((v) => v.id !== value.id), clean],
      });
      return;
    }
    if (!db || !user) throw new Error("Debes iniciar sesión.");
    const { id, createdAt, updatedAt, ...payload } = clean;
    const existing = data[key].find((record) => record.id === id);
    await setDoc(doc(db, "users", user.uid, key, id), {
      ...payload,
      createdAt: existing?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };
  const remove: DataState["remove"] = async (key, id) => {
    if (demo) {
      updateDemo({ ...data, [key]: data[key].filter((v) => v.id !== id) });
      return;
    }
    if (!db || !user) throw new Error("Debes iniciar sesión.");
    await deleteDoc(doc(db, "users", user.uid, key, id));
  };
  return (
    <Context.Provider value={{ data, loading, error, save, remove }}>
      {children}
    </Context.Provider>
  );
}
export const useData = () => useContext(Context);
