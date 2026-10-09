import { readFileSync } from "node:fs";
import { before, after, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
let env;
const nutrition = () => ({
  version: 1,
  preferences: {
    goal: "maintain",
    activity: "moderate",
    source: "manual",
    sex: "male",
    manual: { age: 30, height: 180, weight: 80 },
    specialCase: false,
  },
  inputs: { age: 30, height: 180, weight: 80, sex: "male" },
  targets: {
    calories: 2760,
    protein: 128,
    carbs: 355,
    fat: 92,
    resting: 1780,
    maintenance: 2759,
  },
  sources: {
    bioId: null,
    bioDate: null,
    measurementId: null,
    measurementDate: null,
  },
});
const payload = () => ({
  nutrition: nutrition(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-forma-nutrition",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const uid of ["owner", "other", "expired", "priorities"])
      await setDoc(doc(ctx.firestore(), "members", uid), {
        active: true,
        subscriptionStatus: "trial",
        createdAt: Timestamp.fromMillis(
          Date.now() - (uid === "expired" ? 40 : 0) * 86400000,
        ),
      });
  });
});
after(async () => {
  await env?.cleanup();
});
test("las prioridades son opcionales, privadas y restringidas a zonas válidas", async () => {
  const db = env.authenticatedContext("priorities").firestore();
  const ref = doc(db, "users", "priorities");
  const data = payload();
  data.nutrition.preferences.bodyContext = {
    priorities: ["arms", "back", "glutes"],
    comparable: true,
  };
  await assertSucceeds(setDoc(ref, data));
  for (const bodyContext of [
    { priorities: ["arms", "arms"], comparable: true },
    { priorities: ["brain"], comparable: true },
    { priorities: "arms", comparable: true },
    { priorities: ["arms"], comparable: "yes" },
    { priorities: ["arms"], comparable: true, role: "admin" },
    { priorities: [], comparable: false, diagnosis: "low muscle" },
    null,
  ])
    await assertFails(
      updateDoc(ref, {
        "nutrition.preferences.bodyContext": bodyContext,
        updatedAt: serverTimestamp(),
      }),
    );
  await assertFails(
    getDoc(
      doc(env.authenticatedContext("other").firestore(), "users", "priorities"),
    ),
  );
});
test("el perfil nutricional es privado, incluso frente a otro administrador", async () => {
  const owner = env.authenticatedContext("owner").firestore();
  await assertSucceeds(setDoc(doc(owner, "users", "owner"), payload()));
  await assertSucceeds(getDoc(doc(owner, "users", "owner")));
  for (const ctx of [
    env.authenticatedContext("other"),
    env.unauthenticatedContext(),
    env.authenticatedContext("root", {
      email: "swebb1732@gmail.com",
      email_verified: true,
    }),
  ]) {
    await assertFails(getDoc(doc(ctx.firestore(), "users", "owner")));
    await assertFails(
      setDoc(doc(ctx.firestore(), "users", "owner"), payload()),
    );
    await assertFails(getDocs(collection(ctx.firestore(), "users")));
  }
  await assertSucceeds(
    updateDoc(doc(owner, "users", "owner"), {
      "nutrition.preferences.goal": "bulk",
      updatedAt: serverTimestamp(),
    }),
  );
});
test("rechaza formas inválidas, metas negativas y campos de privilegios", async () => {
  const db = env.authenticatedContext("owner").firestore(),
    ref = doc(db, "users", "owner");
  for (const patch of [
    { "nutrition.preferences.goal": "anything" },
    { "nutrition.preferences.activity": "extreme" },
    { "nutrition.inputs.weight": -1 },
    { "nutrition.inputs.age": 30.5 },
    { "nutrition.targets.protein": -10 },
    { "nutrition.targets.calories": 100 },
    { "nutrition.targets.carbs": 0 },
    {
      "nutrition.preferences.manual": {
        age: 30,
        height: 180,
        weight: 80,
        role: "admin",
      },
    },
    { "nutrition.targets.admin": true },
    { role: "admin" },
    { nutrition: { preferences: { goal: "cut" } } },
  ])
    await assertFails(
      updateDoc(ref, { ...patch, updatedAt: serverTimestamp() }),
    );
});
test("suscripción vencida no guarda; dueño verificado conserva acceso propio", async () => {
  const expired = env.authenticatedContext("expired").firestore();
  await assertFails(setDoc(doc(expired, "users", "expired"), payload()));
  const root = env
    .authenticatedContext("root", {
      email: "swebb1732@gmail.com",
      email_verified: true,
    })
    .firestore();
  await assertSucceeds(setDoc(doc(root, "users", "root"), payload()));
});
test("no permite metas para menores ni condiciones especiales, pero conserva el objetivo sin recomendación", async () => {
  const db = env.authenticatedContext("other").firestore(),
    ref = doc(db, "users", "other"),
    data = payload();
  data.nutrition.inputs.age = 17;
  data.nutrition.preferences.manual.age = 17;
  await assertFails(setDoc(ref, data));
  data.nutrition.targets = null;
  await assertSucceeds(setDoc(ref, data));
  const updated = nutrition();
  updated.preferences.specialCase = true;
  await assertFails(
    updateDoc(ref, { nutrition: updated, updatedAt: serverTimestamp() }),
  );
  updated.targets = null;
  await assertSucceeds(
    updateDoc(ref, { nutrition: updated, updatedAt: serverTimestamp() }),
  );
});
