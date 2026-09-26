import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import {
  DEFAULT_BILLING,
  isSuperAdmin,
  membership,
  type Billing,
  type Member,
} from "../lib/subscription";
import { ensureMember } from "../services/subscriptions";
type State = {
  member: Member | null;
  billing: Billing;
  loading: boolean;
  error: string;
  isAdmin: boolean;
  canWrite: boolean;
  now: number;
  retry: () => void;
};
const Context = createContext<State>(null!);
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [billing, setBilling] = useState(DEFAULT_BILLING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setMember(null);
    setBilling(DEFAULT_BILLING);
    setError("");
    setLoading(true);
    if (demo) {
      const demoNow = Date.now();
      setNow(demoNow);
      setMember({
        id: "demo",
        email: "demo@forma.app",
        active: true,
        subscriptionStatus: "trial",
        subscriptionEndsAt: null,
        notes: "",
        createdAt: { toMillis: () => demoNow - 5 * 86400000 },
      });
      setLoading(false);
      return;
    }
    if (!user || !db) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const off: (() => void)[] = [];
    ensureMember(user)
      .then(() => {
        if (cancelled) return;
        const pending = new Set(["member", "billing"]);
        const ready = (key: string) => {
          pending.delete(key);
          if (!pending.size) setLoading(false);
        };
        const fail = () => {
          setError(
            "No se pudo cargar la suscripción. Revisa tu conexión y que las reglas de Firestore estén actualizadas.",
          );
          setLoading(false);
        };
        off.push(
          onSnapshot(
            doc(db!, "members", user.uid),
            (s) => {
              setMember(
                s.exists() ? ({ ...s.data(), id: s.id } as Member) : null,
              );
              ready("member");
            },
            fail,
          ),
        );
        off.push(
          onSnapshot(
            doc(db!, "settings", "billing"),
            (s) => {
              setBilling({ ...DEFAULT_BILLING, ...s.data() });
              ready("billing");
            },
            fail,
          ),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "No se pudo preparar tu cuenta. Revisa la conexión y publica las reglas de Firestore de esta versión.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      off.forEach((f) => f());
    };
  }, [user?.uid, user?.email, demo, attempt]);
  const isAdmin = !demo && isSuperAdmin(user);
  return (
    <Context.Provider
      value={{
        member,
        billing,
        loading,
        error,
        isAdmin,
        canWrite:
          demo || isAdmin || (!error && membership(member, now).allowed),
        now,
        retry: () => setAttempt((x) => x + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useSubscription = () => useContext(Context);
