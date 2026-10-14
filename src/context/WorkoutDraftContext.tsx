import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { readDraft } from "../lib/workoutDraft";
import type { Workout } from "../types";
type State = {
  draft: Workout | null;
  error: string;
  remember: (w: Workout) => void;
  clear: (id?: string) => void;
};
const Context = createContext<State>(null!);
export function WorkoutDraftProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth();
  const key = `forma-workout-draft-v1:${demo ? "demo" : user?.uid}`;
  const [draft, setDraft] = useState<Workout | null>(() => {
      try {
        return readDraft(localStorage.getItem(key));
      } catch {
        return null;
      }
    }),
    [error, setError] = useState("");
  const current = useRef(draft);
  const remember = useCallback(
    (w: Workout) => {
      current.current = w;
      setDraft(w);
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, workout: w }));
        setError("");
      } catch {
        setError(
          "No se pudo guardar el borrador en este dispositivo. Mantén esta ventana abierta.",
        );
      }
    },
    [key],
  );
  const clear = useCallback(
    (id?: string) => {
      if (id && current.current?.id !== id) return;
      current.current = null;
      setDraft(null);
      try {
        localStorage.removeItem(key);
        setError("");
      } catch {
        setError("No se pudo eliminar el borrador local.");
      }
    },
    [key],
  );
  return (
    <Context.Provider value={{ draft, error, remember, clear }}>
      {children}
    </Context.Provider>
  );
}
export const useWorkoutDraft = () => useContext(Context);
