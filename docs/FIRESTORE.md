# Esquema de Firestore

> Para rutinas por días, unidades kg/lb y las 17 medidas corporales, consulta [la actualización del modelo](TRAINING-UPDATE.md). Los ejemplos siguientes describen el formato anterior, que sigue siendo compatible.

## Colecciones

```text
users/{uid}/
  routines/{routineId}
  workouts/{workoutId}
  measurements/{measurementId}
  bioimpedance/{evaluationId}
```

uid es el identificador de Firebase Authentication. No se necesita un documento padre users/{uid}; no se almacena correo ni contraseña en Firestore. IDs generados con crypto.randomUUID. El ID se agrega a los objetos de UI al leer y no se duplica dentro del documento.

Cada documento incluye createdAt y updatedAt (Timestamp de servidor). Las actualizaciones preservan createdAt. Un usuario solo puede consultar y escribir sus propias subcolecciones. Las demás rutas se deniegan.

## routines/{id}

```typescript
{
  name: "Tren superior",
  description: "Fuerza",
  exercises: [
    { id: "uuid", name: "Press de banca", group: "Pecho",
      sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }] }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## workouts/{id}

```typescript
{
  date: "2026-09-24",
  routineId: "uuid" | null,
  name: "Tren superior",
  duration: 50,
  notes: "Buena sesión",
  exercises: [ /* copia independiente de ejercicios y series realizadas */ ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

No se hace join con la rutina para reconstruir sesiones. Eliminar o editar una rutina no modifica entrenamientos guardados. La evolución del ejercicio se agrupa por nombre normalizado (espacios externos y mayúsculas), tomando el mayor peso por fecha; conviene mantener nombres consistentes.

## measurements/{id}

```typescript
{
  date: "2026-09-24",
  biceps: 35.2,
  chest: 103,
  waist: 82,
  thighs: 57,
  calves: 38,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Todos los valores son cm. Se requiere al menos una circunferencia; las demás se omiten.

## bioimpedance/{id}

| Sección                | Campos                                                   | Unidad                            |
| ---------------------- | -------------------------------------------------------- | --------------------------------- |
| Generales              | date, time, gender, age, height                          | YYYY-MM-DD, HH:mm, enum, años, cm |
| Principales            | weight, bodyFat, bmi                                     | kg, %, kg/m²                      |
| Principales opcionales | visceralFat, water, skeletalMuscle                       | índice, %, %                      |
| Avanzada               | boneMass, bmr                                            | kg, kcal                          |
| Proporciones normales  | normalMuscle, normalFat, normalSkeleton, normalOther     | %                                 |
| Grasa y masa           | fatMass, fatIndex, leanMass, fatLossIndex, fatProportion | kg, índice, kg, índice, %         |
| ESI                    | leftArmKg, leftArmPct                                    | kg, %                             |
| ESD                    | rightArmKg, rightArmPct                                  | kg, %                             |
| Torso                  | torsoKg, torsoPct                                        | kg, %                             |
| EII                    | leftLegKg, leftLegPct                                    | kg, %                             |
| EID                    | rightLegKg, rightLegPct                                  | kg, %                             |

Campos requeridos: date, time, gender, age, height, weight, bodyFat, bmi y timestamps. Gender: male, female, other, unspecified. El IMC se calcula en el cliente cuando no se transcribe del informe. Los demás valores son opcionales y se omiten si no se midieron. No se introducen valores 0 artificiales.

La fecha y hora se registran en horario local de la prueba; no se convierten a UTC. Para consultas internacionales futuras, agregar un campo timezone explícito sin reinterpretar los registros anteriores.

## Consultas e índices

El adaptador escucha cada colección en users/{uid} y ordena/filtra en memoria. No necesita índices compuestos inicialmente. firestore.indexes.json está preparado para incorporarlos. Para paginar por date: orderBy('date', 'desc'), limit(n), startAfter(lastDoc); para consultas de ejercicios a gran escala, crear una colección normalizada de resultados por ejercicio con índice exerciseId/date.

## Seguridad y límites

- Reglas version 2, autenticación obligatoria y UID de ruta igual a request.auth.uid.
- Listas de campos permitidos por colección; límites de tamaño para nombre, notas y número de ejercicios.
- Tipos y rangos numéricos de medidas y bioimpedancia.
- updatedAt debe coincidir con request.time; createdAt no puede cambiar tras crear.
- Las listas anidadas se validan en el cliente; las reglas solo validan el tamaño de exercises, no cada elemento. Esta es una limitación explícita del esquema inicial, no una barrera entre usuarios.
- Las reglas no se despliegan automáticamente al compilar el frontend.

## Referencias oficiales

- [Condiciones en reglas de Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite)
