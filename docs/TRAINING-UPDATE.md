# Mejoras de entrenamiento — 26 de septiembre de 2026

## Entregado

- Pesos de gimnasio en kg o lb por ejercicio, tanto en rutinas como en entrenamientos.
- Historial conserva la unidad ingresada; volumen y gráficos convierten los valores antes de compararlos. Cambiar la unidad en el formulario conserva el número ingresado; selecciona la unidad de la máquina o pesa.
- 14 grupos musculares agrupados en Tren Superior, Tren Inferior y Zona Media.
- 17 medidas corporales con lado y punto anatómico, agrupadas por zona. Gráficos individuales, historial compacto, consulta de cada evaluación y edición.
- Planes con varios días bajo una sola rutina; cada día tiene nombre, día de semana y ejercicios propios. Permite reordenar y eliminar días, e iniciar únicamente la sesión elegida.

## Compatibilidad

- Un ejercicio sin `unit` se interpreta como kg. No se convierten ni reescriben documentos existentes automáticamente.
- Una rutina sin `days` aparece como una sesión general sin día asignado. Solo al guardarla se incorpora la nueva organización.
- Los valores antiguos `biceps`, `thighs` y `calves` aparecen como registros anteriores, sin asignarlos artificialmente a un lado. Se pueden consultar y editar.
- Las sesiones guardadas mantienen una copia de sus ejercicios y pesos, aunque se modifique o elimine la rutina o uno de sus días.
- La bioimpedancia mantiene las unidades de su informe. La selección kg/lb añadida corresponde a los pesos de ejercicios del gimnasio.

## Modelo

```typescript
Exercise = {
  id, name, group,
  unit?: "kg" | "lb", // ausencia = kg
  sets: [{ reps, weight }] // valores originales de la unidad seleccionada
}

RoutineDay = {
  id,
  name: "Push",
  weekday: "Lunes", // también admite Sin asignar
  exercises: Exercise[]
}

Routine = {
  id, name: "Push, Pull & Legs", description,
  days: RoutineDay[],
  exercises: Exercise[] // lista consolidada para compatibilidad
}

Workout = {
  // campos anteriores
  routineDayId?: string | null,
  exercises: Exercise[] // copia independiente de un solo día
}
```

La rutina admite hasta 14 sesiones y 100 ejercicios totales. Las medidas nuevas son:

- Superior: neck, shoulders, chest, leftArmRelaxed, leftArmFlexed, rightArmRelaxed, rightArmFlexed, leftForearm, rightForearm.
- Media: waist, hips.
- Inferior: leftThighHigh, leftThighMid, rightThighHigh, rightThighMid, leftCalf, rightCalf.
- Históricas: biceps, thighs, calves.

Todos los valores corporales siguen en cm; solo se exige una medida por registro.

## Reglas y publicación

El archivo `firestore.rules` del proyecto se adaptó para permitir `days`, `routineDayId` y las nuevas circunferencias, manteniendo el aislamiento por usuario y las validaciones de rangos.

**Antes de usar esta versión en producción deben publicarse esas reglas.** Las reglas anteriores rechazan esos campos nuevos. No se modificaron credenciales, proyectos remotos ni configuración de Vercel, y no se ejecutó ningún despliegue. Publica las reglas junto con esta versión cuando decidas actualizar producción.

No se implementaron todavía suscripciones, cobros ni administración.

## Verificación de esta entrega

- Compilación de producción correcta.
- 14 pruebas unitarias: conversiones, volumen, progreso, compatibilidad y catálogos.
- 4 pruebas de navegador: flujos existentes, tres días bajo una rutina, unidades, medidas y vista móvil.
- 5 pruebas de reglas de seguridad, incluyendo nuevos campos y registros antiguos.
- 2 pruebas integradas con Auth y Firestore emulados: persistencia, edición, eliminación de campos y aislamiento de cuentas.
- Revisión visual a 1440 px y 390 px, sin errores de ejecución ni desbordamientos.

Total: 25 pruebas aprobadas. La vista previa local usa datos de demostración y no accede a registros reales.
