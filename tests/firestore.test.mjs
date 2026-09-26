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
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-forma",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  await env.withSecurityRulesDisabled(async (context) => {
    for (const id of ["alice", "full", "days", "measure"])
      await setDoc(doc(context.firestore(), "members", id), {
        email: id + "@example.com",
        active: true,
        subscriptionStatus: "trial",
        subscriptionEndsAt: null,
        notes: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  });
});
after(async () => {
  await env?.cleanup();
});
const audit = () => ({
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
test("el dueño puede crear, leer, editar y eliminar; terceros y anónimos no acceden", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();
  const anon = env.unauthenticatedContext().firestore();
  for (const [key, value] of Object.entries({
    routines: {
      name: "Fuerza",
      description: "",
      exercises: [
        {
          id: "x",
          name: "Press",
          group: "Pecho",
          sets: [{ reps: 8, weight: 50 }],
        },
      ],
    },
    workouts: {
      name: "Sesión",
      date: "2026-09-24",
      routineId: null,
      duration: 45,
      notes: "",
      exercises: [
        {
          id: "x",
          name: "Press",
          group: "Pecho",
          sets: [{ reps: 8, weight: 50 }],
        },
      ],
    },
    measurements: { date: "2026-09-24", waist: 82 },
    bioimpedance: {
      date: "2026-09-24",
      time: "08:30",
      gender: "unspecified",
      age: 29,
      height: 178,
      weight: 80,
      bodyFat: 20,
      bmi: 25.2,
    },
  })) {
    const path = "users/alice/" + key + "/one";
    await assertSucceeds(setDoc(doc(alice, path), { ...value, ...audit() }));
    await assertSucceeds(getDoc(doc(alice, path)));
    await assertSucceeds(
      updateDoc(doc(alice, path), { updatedAt: serverTimestamp() }),
    );
    await assertFails(getDoc(doc(bob, path)));
    await assertFails(getDoc(doc(anon, path)));
    await assertFails(setDoc(doc(bob, path), { ...value, ...audit() }));
    await assertFails(setDoc(doc(anon, path), { ...value, ...audit() }));
    await assertFails(deleteDoc(doc(bob, path)));
    await assertSucceeds(deleteDoc(doc(alice, path)));
  }
});
test("rechaza datos inválidos, campos extra, rutas desconocidas y cambios de creación", async () => {
  const db = env.authenticatedContext("alice").firestore();
  const path = doc(db, "users/alice/measurements/invalid");
  await assertFails(
    setDoc(path, { date: "2026-09-24", waist: -3, ...audit() }),
  );
  await assertFails(setDoc(path, { date: "2026-09-24", ...audit() }));
  await assertFails(
    setDoc(path, { date: "2026-09-24", waist: 82, admin: true, ...audit() }),
  );
  await assertSucceeds(
    setDoc(path, { date: "2026-09-24", waist: 82, ...audit() }),
  );
  await assertFails(
    updateDoc(path, {
      createdAt: Timestamp.fromMillis(0),
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/alice/secrets/x"), { anything: true }),
  );
  await assertFails(
    setDoc(doc(db, "users/alice/bioimpedance/invalid"), {
      date: "2026-09-24",
      time: "25:90",
      gender: "male",
      age: 29,
      height: 178,
      weight: 80,
      bodyFat: 120,
      bmi: 25,
      ...audit(),
    }),
  );
});

test("acepta una evaluación completa con todos los campos opcionales", async () => {
  const db = env.authenticatedContext("full").firestore();
  const values = {
    date: "2026-09-24",
    time: "08:30",
    gender: "male",
    age: 30,
    height: 180,
    weight: 80,
    bodyFat: 20,
    bmi: 24.7,
  };
  for (const key of [
    "visceralFat",
    "water",
    "skeletalMuscle",
    "boneMass",
    "bmr",
    "normalMuscle",
    "normalFat",
    "normalSkeleton",
    "normalOther",
    "fatMass",
    "fatIndex",
    "leanMass",
    "fatLossIndex",
    "fatProportion",
    "leftArmKg",
    "leftArmPct",
    "rightArmKg",
    "rightArmPct",
    "torsoKg",
    "torsoPct",
    "leftLegKg",
    "leftLegPct",
    "rightLegKg",
    "rightLegPct",
  ])
    values[key] = 1;
  await assertSucceeds(
    setDoc(doc(db, "users/full/bioimpedance/all"), { ...values, ...audit() }),
  );
});

test("guarda planes por días y sesiones en libras; rechaza planes vacíos", async () => {
  const db = env.authenticatedContext("days").firestore();
  const exercises = [
    {
      id: "curl",
      name: "Curl",
      group: "Bíceps",
      unit: "lb",
      sets: [{ reps: 10, weight: 25 }],
    },
  ];
  const days = [{ id: "mon", name: "Push", weekday: "Lunes", exercises }];
  await assertSucceeds(
    setDoc(doc(db, "users/days/routines/plan"), {
      name: "PPL",
      description: "",
      exercises,
      days,
      ...audit(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(db, "users/days/workouts/session"), {
      date: "2026-09-26",
      routineId: "plan",
      routineDayId: "mon",
      name: "PPL · Push",
      duration: 45,
      notes: "",
      exercises,
      ...audit(),
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/days/routines/empty"), {
      name: "Vacío",
      description: "",
      exercises,
      days: [],
      ...audit(),
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/days/routines/too-many"), {
      name: "Exceso",
      description: "",
      exercises,
      days: Array(15).fill(days[0]),
      ...audit(),
    }),
  );
});
test("acepta las 17 circunferencias junto a valores históricos y valida rangos", async () => {
  const db = env.authenticatedContext("measure").firestore();
  const value = { date: "2026-09-26" };
  for (const key of [
    "neck",
    "shoulders",
    "chest",
    "leftArmRelaxed",
    "leftArmFlexed",
    "rightArmRelaxed",
    "rightArmFlexed",
    "leftForearm",
    "rightForearm",
    "waist",
    "hips",
    "leftThighHigh",
    "leftThighMid",
    "rightThighHigh",
    "rightThighMid",
    "leftCalf",
    "rightCalf",
    "biceps",
    "thighs",
    "calves",
  ])
    value[key] = 40;
  await assertSucceeds(
    setDoc(doc(db, "users/measure/measurements/full"), {
      ...value,
      ...audit(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(db, "users/measure/measurements/one"), {
      date: "2026-09-26",
      leftArmRelaxed: 31.2,
      ...audit(),
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/measure/measurements/negative"), {
      ...value,
      leftArmFlexed: -1,
      ...audit(),
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/measure/measurements/oversized"), {
      ...value,
      leftThighHigh: 151,
      ...audit(),
    }),
  );
});
