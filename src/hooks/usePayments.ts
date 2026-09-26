import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Payment } from "../lib/subscription";
export function usePayments(memberId?: string, demo = false) {
  const [payments, setPayments] = useState<Payment[]>([]),
    [loading, setLoading] = useState(!demo),
    [error, setError] = useState("");
  useEffect(() => {
    setPayments([]);
    setError("");
    if (demo || !db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = collection(db, "subscriptionPayments");
    // Own history needs only the automatic single-field memberId index.
    const source = memberId
      ? query(ref, where("memberId", "==", memberId))
      : query(ref, orderBy("verifiedAt", "desc"), limit(100));
    return onSnapshot(
      source,
      (s) => {
        setPayments(
          s.docs
            .map((d) => ({ ...d.data(), id: d.id }) as Payment)
            .sort(
              (a, b) =>
                (b.verifiedAt?.toMillis() ?? 0) -
                (a.verifiedAt?.toMillis() ?? 0),
            ),
        );
        setLoading(false);
      },
      () => {
        setError("No se pudo cargar el historial de pagos.");
        setLoading(false);
      },
    );
  }, [memberId, demo]);
  return { payments, loading, error };
}
