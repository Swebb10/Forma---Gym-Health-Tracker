export type WeightUnit = "kg" | "lb";
export type SetEntry = { reps: number; weight: number };
export type Exercise = {
  id: string;
  name: string;
  group: string;
  /** Missing on legacy records means kilograms. */
  unit?: WeightUnit;
  sets: SetEntry[];
};
export type RoutineDay = {
  id: string;
  name: string;
  weekday: string;
  exercises: Exercise[];
};
export type Routine = {
  id: string;
  name: string;
  description: string;
  days?: RoutineDay[];
  exercises: Exercise[];
  createdAt?: unknown;
  updatedAt?: unknown;
};
export type Workout = {
  id: string;
  date: string;
  routineId: string | null;
  routineDayId?: string | null;
  name: string;
  duration: number;
  notes: string;
  exercises: Exercise[];
  createdAt?: unknown;
  updatedAt?: unknown;
};
export type Measurement = {
  id: string;
  date: string;
  neck?: number;
  shoulders?: number;
  leftArmRelaxed?: number;
  leftArmFlexed?: number;
  rightArmRelaxed?: number;
  rightArmFlexed?: number;
  leftForearm?: number;
  rightForearm?: number;
  hips?: number;
  leftThighHigh?: number;
  leftThighMid?: number;
  rightThighHigh?: number;
  rightThighMid?: number;
  leftCalf?: number;
  rightCalf?: number;
  /** Legacy measurements without a recorded side. */
  biceps?: number;
  chest?: number;
  waist?: number;
  thighs?: number;
  calves?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};
export type BioRecord = {
  id: string;
  date: string;
  time: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  bmi: number;
  visceralFat?: number;
  water?: number;
  skeletalMuscle?: number;
  boneMass?: number;
  bmr?: number;
  normalMuscle?: number;
  normalFat?: number;
  normalSkeleton?: number;
  normalOther?: number;
  fatMass?: number;
  fatIndex?: number;
  leanMass?: number;
  fatLossIndex?: number;
  fatProportion?: number;
  leftArmKg?: number;
  leftArmPct?: number;
  rightArmKg?: number;
  rightArmPct?: number;
  torsoKg?: number;
  torsoPct?: number;
  leftLegKg?: number;
  leftLegPct?: number;
  rightLegKg?: number;
  rightLegPct?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};
export type Collections = {
  routines: Routine;
  workouts: Workout;
  measurements: Measurement;
  bioimpedance: BioRecord;
};
export type Store = { [K in keyof Collections]: Collections[K][] };
export type Page =
  | "dashboard"
  | "workouts"
  | "routines"
  | "measurements"
  | "bioimpedance"
  | "subscription"
  | "admin";
