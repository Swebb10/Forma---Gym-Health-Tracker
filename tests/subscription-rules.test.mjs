import { readFileSync } from "node:fs";
import { test, before, after } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
let env;
const profile = () => ({
  email: "member@example.com",
  active: true,
  subscriptionStatus: "trial",
  subscriptionEndsAt: null,
  notes: "",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
const root = () =>
  env
    .authenticatedContext("root", {
      email: "swebb1732@gmail.com",
      email_verified: true,
    })
    .firestore();
const member = (uid) =>
  env
    .authenticatedContext(uid, {
      email: "member@example.com",
      email_verified: true,
    })
    .firestore();
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-forma-subscriptions",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});
after(async () => {
  await env?.cleanup();
});
test("un usuario solo crea su prueba una vez y no puede alterar permisos, plazos ni precios", async () => {
  const db = member("normal"),
    ref = doc(db, "members/normal");
  await assertSucceeds(setDoc(ref, profile()));
  await assertFails(
    updateDoc(ref, {
      subscriptionStatus: "active",
      subscriptionEndsAt: Timestamp.fromMillis(Date.now() + 99999999),
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(ref, { active: false, updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(ref, { role: "superadmin", updatedAt: serverTimestamp() }),
  );
  await assertFails(deleteDoc(ref));
  await assertFails(setDoc(doc(db, "members/other"), profile()));
  await assertFails(getDocs(collection(db, "members")));
  await assertFails(getDoc(doc(db, "members/other")));
  await assertFails(setDoc(doc(db, "settings/billing"), { monthly: 1 }));
  await assertFails(
    setDoc(doc(db, "subscriptionPayments/forged"), {
      memberId: "normal",
      amount: 1,
    }),
  );
  await assertFails(
    setDoc(doc(db, "members/role"), { ...profile(), role: "superadmin" }),
  );
});
test("solo el correo verificado del propietario permite administrar; conserva aislamiento de salud", async () => {
  const admin = root(),
    unverified = env
      .authenticatedContext("fake", {
        email: "swebb1732@gmail.com",
        email_verified: false,
      })
      .firestore();
  await assertFails(getDocs(collection(unverified, "members")));
  await assertFails(getDocs(collection(member("other"), "members")));
  await assertSucceeds(getDocs(collection(admin, "members")));
  await assertSucceeds(
    updateDoc(doc(admin, "members/normal"), {
      active: false,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(admin, "settings/billing"), {
      phone: "87273417",
      holder: "Sebastián Webb Vargas",
      monthly: 5000,
      quarterly: 14250,
      yearly: 54000,
      updatedBy: "root",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDoc(doc(admin, "users/normal/measurements/private")));
  await assertSucceeds(
    setDoc(doc(admin, "users/root/measurements/own"), {
      date: "2026-09-26",
      waist: 80,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    getDoc(doc(member("normal"), "users/root/measurements/own")),
  );
});
test("el vencimiento y suspensión se aplican en Firestore, la historia permanece privada", async () => {
  const db = member("expired");
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "members/expired"), {
      ...profile(),
      subscriptionStatus: "active",
      subscriptionEndsAt: Timestamp.fromMillis(Date.now() - 10000),
    });
    await setDoc(
      doc(context.firestore(), "users/expired/measurements/history"),
      {
        date: "2026-09-26",
        waist: 80,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    );
  });
  const data = {
    date: "2026-09-26",
    waist: 80,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await assertFails(setDoc(doc(db, "users/expired/measurements/new"), data));
  await assertSucceeds(getDoc(doc(db, "users/expired/measurements/history")));
  await assertSucceeds(
    deleteDoc(doc(db, "users/expired/measurements/history")),
  );
  await assertFails(
    setDoc(doc(member("normal"), "users/normal/measurements/new"), data),
  );
  await assertFails(
    setDoc(doc(member("missing"), "users/missing/measurements/new"), data),
  );
});
test("la prueba usa tiempo del servidor y no puede reiniciarse o crear roles extras", async () => {
  const db = member("trial");
  await assertFails(
    setDoc(doc(db, "members/trial"), {
      ...profile(),
      createdAt: Timestamp.fromMillis(Date.now() + 86400000),
    }),
  );
  await assertFails(
    setDoc(doc(db, "members/trial"), { ...profile(), role: "superadmin" }),
  );
  await assertSucceeds(setDoc(doc(db, "members/trial"), profile()));
  await assertSucceeds(
    setDoc(doc(db, "users/trial/measurements/new"), {
      date: "2026-09-26",
      waist: 80,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(doc(db, "members/trial"), {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
  await env.withSecurityRulesDisabled(async (c) => {
    await updateDoc(doc(c.firestore(), "members/trial"), {
      createdAt: Timestamp.fromMillis(Date.now() - 31 * 86400000),
    });
  });
  await assertFails(
    setDoc(doc(db, "users/trial/measurements/late"), {
      date: "2026-09-26",
      waist: 80,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});
test("pago y referencia son atómicos e inmutables; cada usuario solo consulta su historial", async () => {
  const admin = root(),
    end = Timestamp.fromMillis(Date.now() + 40 * 86400000);
  const payment = {
    memberId: "normal",
    email: "member@example.com",
    plan: "monthly",
    months: 1,
    amount: 5000,
    reference: "SINPE-1001",
    previousEnd: null,
    subscriptionEndsAt: end,
    verifiedAt: serverTimestamp(),
    verifiedBy: "root",
  };
  await assertFails(
    setDoc(doc(admin, "subscriptionPayments/receipt"), payment),
  );
  const batch = writeBatch(admin);
  batch.update(doc(admin, "members/normal"), {
    active: true,
    subscriptionStatus: "active",
    subscriptionEndsAt: end,
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(admin, "subscriptionPayments/receipt"), payment);
  batch.set(doc(admin, "subscriptionPaymentReferences/SINPE-1001"), {
    paymentId: "receipt",
    memberId: "normal",
  });
  await assertSucceeds(batch.commit());
  await assertFails(
    updateDoc(doc(admin, "subscriptionPayments/receipt"), { amount: 9999 }),
  );
  await assertFails(deleteDoc(doc(admin, "subscriptionPayments/receipt")));
  await assertFails(
    updateDoc(doc(admin, "subscriptionPaymentReferences/SINPE-1001"), {
      paymentId: "another",
    }),
  );
  await assertSucceeds(
    getDoc(doc(member("normal"), "subscriptionPayments/receipt")),
  );
  await assertFails(
    getDoc(doc(member("other"), "subscriptionPayments/receipt")),
  );
  await assertSucceeds(
    getDocs(
      query(
        collection(member("normal"), "subscriptionPayments"),
        where("memberId", "==", "normal"),
      ),
    ),
  );
  await assertFails(
    getDocs(collection(member("normal"), "subscriptionPayments")),
  );
  await assertFails(
    getDoc(doc(member("normal"), "subscriptionPaymentReferences/SINPE-1001")),
  );
});
test("auditoría solo administrativa e inmutable", async () => {
  const admin = root(),
    data = {
      memberId: "normal",
      email: "member@example.com",
      reason: "Ajuste",
      before: { active: true },
      after: { active: false },
      changedAt: serverTimestamp(),
      changedBy: "root",
    };
  await assertSucceeds(setDoc(doc(admin, "subscriptionAudit/change"), data));
  await assertFails(getDoc(doc(member("normal"), "subscriptionAudit/change")));
  await assertFails(
    updateDoc(doc(admin, "subscriptionAudit/change"), { reason: "Reescrito" }),
  );
  await assertFails(deleteDoc(doc(admin, "subscriptionAudit/change")));
  await assertFails(
    setDoc(doc(member("normal"), "subscriptionAudit/forged"), data),
  );
});
