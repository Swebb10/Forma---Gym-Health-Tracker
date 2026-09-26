import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onIdTokenChanged, signOut, reload, type User } from "firebase/auth";
import { auth, configured } from "../lib/firebase";
type AuthState = {
  user: User | null;
  demo: boolean;
  loading: boolean;
  startDemo: () => void;
  leave: () => Promise<void>;
  refresh: () => Promise<void>;
};
const Context = createContext<AuthState>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [demo, setDemo] = useState(!configured),
    [loading, setLoading] = useState(configured);
  const [, setRevision] = useState(0);
  useEffect(
    () =>
      auth
        ? onIdTokenChanged(auth, (u) => {
            setUser(u);
            setRevision((r) => r + 1);
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
        refresh: async () => {
          if (auth?.currentUser) {
            await reload(auth.currentUser);
            await auth.currentUser.getIdToken(true);
            setRevision((r) => r + 1);
          }
        },
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
