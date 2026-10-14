# Forma: flujos unificados y activación

## Publicar esta actualización

1. Abre `C:\Freelance\gym-health-tracker\firestore.rules` y copia **todo** su contenido.
2. En Firebase, proyecto **forma-gym-tracker**, entra en **Firestore Database → Reglas**, reemplaza el contenido y pulsa **Publicar**.
3. Después publica estos cambios de código en Vercel con tu flujo habitual y recarga Forma.
4. En **Mi cuerpo → Perfil y evolución**, confirma los datos personales y registra tu peso cuando tengas una medición nueva. En **Nutrición**, revisa y guarda tu objetivo. En **Mis rutinas**, elige la rutina activa si tienes varias.

Esta versión sí necesita las reglas nuevas: incorpora `users/{uid}/weights` y campos privados de perfil. Vercel no publica las reglas de Firebase. No hace falta crear documentos manualmente, cambiar variables de entorno ni activar servicios o índices nuevos. No se ejecuta una migración de datos históricos.

## Qué hace cada sección

- **Resumen:** peso actualizado, composición de la última evaluación con su fecha, metas nutricionales, últimos entrenamientos y próxima sesión. Los filtros de composición y fuerza son independientes. Cada entrenamiento abre su ficha; comparar series abre el ejercicio elegido.
- **Mis rutinas:** planificación por días y selección de la rutina activa. Si solo hay una rutina, se usa como predeterminada. Con varias, se solicita seleccionar una. Los días con calendario usan la siguiente fecha disponible y omiten sesiones ya registradas hoy. Los planes sin días de semana rotan después de la última sesión guardada.
- **Entrenamientos:** resultados realmente completados. Al iniciar una sesión, las series del plan aparecen pendientes y la duración está vacía. Confirma cada serie realizada antes de guardar. Se conservan los números originales aunque omitas una serie intermedia; los gráficos muestran el hueco, no un cero.
- **Mi cuerpo:** datos personales, peso independiente, figura corporal y contexto, medidas en centímetros y evaluaciones de bioimpedancia. Las métricas avanzadas del formulario de evaluación están agrupadas en secciones desplegables. El informe muestra los valores registrados.
- **Nutrición:** objetivo, actividad habitual, metas y Macro-Guía. Los datos para la fórmula vienen del mismo perfil y peso usados por Resumen. Las sugerencias del contexto corporal enlazan aquí para revisar el objetivo; no lo cambian automáticamente.
- **Mi suscripción:** acceso, planes e historial de pagos. Con acceso vencido o suspendido se conserva la consulta de los propios datos, bloqueando crear, editar y eliminar. El propietario verificado mantiene el acceso a sus datos personales y a administración.

## Peso y datos existentes

El peso actual se obtiene de los registros independientes y las evaluaciones de bioimpedancia por fecha y hora, excluyendo fechas futuras. En empate exacto tiene prioridad el registro independiente. Todos los cálculos usan kg; cambiar kg/lb convierte la presentación. La unidad corporal preferida se recuerda en este navegador.

Si antes usabas datos manuales de Nutrición sin fecha, se mantienen como alternativa explícita hasta que registres un peso fechado. No se inventa una fecha histórica para ese peso. Confirmar edad y altura no cambia ese peso por otro antiguo. Al eliminar los registros independientes, la alternativa manual anterior puede volver a aplicarse y se identifica como tal.

Edad, altura y coeficiente para la fórmula se toman del perfil confirmado; antes de confirmarlo se aprovechan los datos manuales anteriores o la última bioimpedancia. La edad no aumenta automáticamente: no hay fecha de nacimiento registrada. El peso de cada bioimpedancia sigue asociado a su propio informe para estimar grasa/músculo; nunca se multiplica un peso nuevo por porcentajes antiguos como si fueran una evaluación nueva.

Los ejercicios conocidos del catálogo usan una identidad estable entre idiomas. Los personalizados se agrupan por nombre y grupo muscular normalizados; las variantes y los bloques repetidos permanecen separados. No se reclasifican silenciosamente registros antiguos que tengan un grupo distinto.

## Borradores

`localStorage` guarda un borrador de entrenamiento por UID en este navegador (`forma-workout-draft-v1:{uid}`). En demostración utiliza una clave distinta. Cerrar el formulario conserva el borrador; **Retomar borrador** lo recupera y **Descartar borrador** lo elimina con confirmación. Al guardar el entrenamiento se elimina el borrador. No se sincroniza entre dispositivos y borrar los datos del navegador también lo elimina. Un fallo del almacenamiento local se muestra en el formulario.

Las series históricas sin marcador de completado se siguen interpretando como realizadas. No se cambia ningún resultado guardado automáticamente. El asistente de notas sigue siendo ligero y basado en reglas, sin modelos descargables, GPU ni servicios de IA.

## Esquema añadido

```text
users/{uid}
  bodyProfile?: { age, height (cm), sex: male | female | "", date }
  activeRoutineId?: string | null
  nutrition?: ... (formato anterior compatible)
  createdAt, updatedAt: Timestamp

users/{uid}/weights/{id}
  date: YYYY-MM-DD
  time: HH:mm
  weight: number (kg)
  createdAt, updatedAt: Timestamp

workouts/{id}.exercises[].sets[]
  reps, weight
  position?: number (1–100; ordinal original)

workouts/{id}.exercises[], routines/{id}.exercises[], routines/{id}.days[].exercises[]
  movementId?: string (catálogo)
```

`completed` es solo estado local del formulario, no se almacena en Firestore. El perfil y las nuevas colecciones siguen siendo privados por UID; administrar suscripciones no da acceso a la salud de otras personas. Las preferencias antiguas `nutrition.preferences.source/manual` se conservan para compatibilidad; el cálculo compartido resuelve los datos actuales sin exigir que el usuario mantenga dos formularios.

## Verificación local

```powershell
npm test
npm run test:e2e -- --workers=1
npm run test:rules
npm run test:integration
npm run build
npm run format:check
```

Las pruebas de Firebase usan exclusivamente los emuladores y proyectos `demo-*`. En Windows, si Java 21 no inicia por un error de socket local, se puede fijar `jdk.net.unixdomain.tmpdir` a un directorio existente con ruta corta mediante `JAVA_TOOL_OPTIONS`, solo para ese proceso. No cambies las variables del frontend para esta comprobación.
