import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import {
  DEFAULT_BILLING,
  PLANS,
  renewalEnd,
  membership,
  validateBilling,
  type Billing,
  type Member,
  type PlanId,
} from "../lib/subscription";

export async function ensureMember(user: User) {
  if (!db) throw new Error("Firebase no está conectado.");
  await runTransaction(db, async (tx) => {
    const ref = doc(db!, "members", user.uid);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists())
      tx.set(ref, {
        email: user.email ?? "",
        active: true,
        subscriptionStatus: "trial",
        subscriptionEndsAt: null,
        notes: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    else if (snapshot.data().email !== user.email)
      tx.update(ref, { email: user.email ?? "", updatedAt: serverTimestamp() });
  });
}
export const newPaymentId = () => {
  if (!db) throw new Error("Firebase no está conectado.");
  return doc(collection(db, "subscriptionPayments")).id;
};
export async function registerPayment(
  memberId: string,
  planId: PlanId,
  reference: string,
  paymentId: string,
  quotedAmount: number,
) {
  if (!db || !auth?.currentUser) throw new Error("Debes iniciar sesión.");
  const normalized = reference.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,80}$/.test(normalized))
    throw new Error(
      "Usa la referencia SINPE de 4 a 80 caracteres (letras, números o guiones).",
    );
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("Selecciona un plan válido.");
  await runTransaction(db, async (tx) => {
    const memberRef = doc(db!, "members", memberId);
    const receiptRef = doc(db!, "subscriptionPayments", paymentId);
    const referenceRef = doc(db!, "subscriptionPaymentReferences", normalized);
    const receipt = await tx.get(receiptRef);
    if (receipt.exists()) {
      const previous = receipt.data();
      if (
        previous.memberId !== memberId ||
        previous.plan !== planId ||
        previous.reference !== normalized
      )
        throw new Error(
          "Este registro ya se usó para otro pago. Cierra el formulario y vuelve a abrirlo.",
        );
      return;
    }
    const existing = await tx.get(referenceRef);
    const memberDoc = await tx.get(memberRef);
    const billingDoc = await tx.get(doc(db!, "settings", "billing"));
    if (existing.exists())
      throw new Error("Esta referencia SINPE ya fue registrada.");
    if (!memberDoc.exists()) throw new Error("La cuenta ya no existe.");
    const member = { ...memberDoc.data(), id: memberId } as Member;
    if (!member.active)
      throw new Error("Reactiva la cuenta antes de registrar el pago.");
    const billing = { ...DEFAULT_BILLING, ...billingDoc.data() } as Billing;
    validateBilling(billing);
    if (billing[planId] !== quotedAmount)
      throw new Error(
        "El precio cambió. Cierra el formulario y revisa el monto actualizado.",
      );
    const end = Timestamp.fromMillis(renewalEnd(member, plan.months));
    tx.update(memberRef, {
      subscriptionStatus: "active",
      subscriptionEndsAt: end,
      updatedAt: serverTimestamp(),
    });
    tx.set(receiptRef, {
      memberId,
      email: member.email,
      plan: planId,
      months: plan.months,
      amount: billing[planId],
      reference: normalized,
      previousEnd: membership(member).end
        ? Timestamp.fromMillis(membership(member).end)
        : null,
      subscriptionEndsAt: end,
      verifiedBy: auth!.currentUser!.uid,
      verifiedAt: serverTimestamp(),
    });
    tx.set(referenceRef, { paymentId, memberId });
  });
}
export async function changeMember(
  member: Member,
  changes: {
    active?: boolean;
    subscriptionEndsAt?: Timestamp;
    subscriptionStatus?: "active";
    notes?: string;
  },
  reason: string,
) {
  if (!db || !auth?.currentUser) throw new Error("Debes iniciar sesión.");
  if (!reason.trim() || reason.length > 500)
    throw new Error("Indica el motivo del cambio (máximo 500 caracteres).");
  const logRef = doc(collection(db, "subscriptionAudit"));
  await runTransaction(db, async (tx) => {
    const ref = doc(db!, "members", member.id);
    const latest = await tx.get(ref);
    if (!latest.exists()) throw new Error("La cuenta ya no existe.");
    tx.update(ref, { ...changes, updatedAt: serverTimestamp() });
    tx.set(logRef, {
      memberId: member.id,
      email: latest.data().email,
      reason: reason.trim(),
      before: {
        active: latest.data().active,
        subscriptionStatus: latest.data().subscriptionStatus,
        subscriptionEndsAt: latest.data().subscriptionEndsAt,
        notes: latest.data().notes,
      },
      after: changes,
      changedBy: auth!.currentUser!.uid,
      changedAt: serverTimestamp(),
    });
  });
}
export async function saveBilling(billing: Billing) {
  if (!db || !auth?.currentUser) throw new Error("Debes iniciar sesión.");
  validateBilling(billing);
  await runTransaction(db, async (tx) => {
    const ref = doc(db!, "settings", "billing");
    const previous = await tx.get(ref);
    tx.set(ref, {
      ...billing,
      holder: billing.holder.trim(),
      updatedAt: serverTimestamp(),
      updatedBy: auth!.currentUser!.uid,
    });
    tx.set(doc(collection(db!, "billingAudit")), {
      before: previous.exists() ? previous.data() : DEFAULT_BILLING,
      after: billing,
      changedAt: serverTimestamp(),
      changedBy: auth!.currentUser!.uid,
    });
  });
}
