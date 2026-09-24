import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, configured } from "../lib/firebase";
type AuthState = {
  user: User | null;
  demo: boolean;
  loading: boolean;
  startDemo: () => void;
  leave: () => Promise<void>;
};
const Context = createContext<AuthState>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [demo, setDemo] = useState(!configured),
    [loading, setLoading] = useState(configured);
  useEffect(
    () =>
      auth
        ? onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
          })
        : undefined,
    [],
  );
  return (
    <Context.Provider
      value={{
        user,
        demo,
        loading,
        startDemo: () => setDemo(true),
        leave: async () => {
          if (auth) await signOut(auth);
          setDemo(false);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
