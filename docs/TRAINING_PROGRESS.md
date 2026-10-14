# Progreso por serie y notas para la siguiente sesión

En **Entrenamientos → Progreso por series** puedes elegir ejercicio, contexto, sesión y referencia. El historial existente ya contiene pesos y repeticiones individuales: no hay migración de registros históricos. La [actualización de coherencia](COHERENCE.md) añade borradores locales y posiciones explícitas para las series nuevas.

## Comparación

- Ejemplo: `100×8, 90×8, 90×8, 90×8` frente a cuatro series de `100×8`. Ambos máximos son 100 kg, pero el volumen pasa de 2960 a 3200 kg·repeticiones (+8,1%) y el objetivo de 100 kg × 8 repeticiones pasa de 1/4 a 4/4 series.
- Se compara serie 1 con serie 1, etc. El peso se normaliza a kg antes del cálculo; cambiar la unidad de visualización no modifica registros. Los registros antiguos sin unidad se interpretan como kg, como en el resto de Forma.
- Una mejora de carga con caída de repeticiones se etiqueta «Cambio mixto». Las series añadidas o ausentes no se contabilizan como cero ni como un retroceso.
- El gráfico permite elegir número de serie y muestra **peso y repeticiones simultáneamente**. Peso: línea azul y eje izquierdo en kg/lb. Repeticiones: línea verde discontinua y eje derecho entero. Cada eje tiene su propia escala. El detalle al señalar una fecha muestra ambos valores; la lista accesible muestra `100 kg × 8 rep`. Conserva sesiones del mismo día como puntos distintos y deja huecos en ambas métricas cuando falta una serie. Cambiar unidades convierte solo el peso.
- La identidad usa el catálogo multilingüe para ejercicios conocidos y nombre normalizado con grupo muscular para los personalizados, conservando variantes como «Sentadilla Smith». Bloques repetidos del mismo ejercicio dentro de una sesión se mantienen separados por su orden. No hay emparejamiento difuso entre ejercicios distintos.
- La referencia automática usa una fecha anterior del mismo contexto. Rutinas se identifican por rutina y día; sesiones libres por nombre y lista de ejercicios. Sin horas de sesión no se inventa el orden de dos sesiones en la misma fecha: el usuario puede elegir la referencia.
- Al registrar un entrenamiento aparecen los valores anteriores junto a cada serie cuando hay una sesión comparable. Se muestran como referencia, sin reemplazar el borrador ni los valores de la rutina.

Volumen de carga no equivale por sí solo a fuerza o hipertrofia. Técnica, rango, descansos, calentamientos y equipo afectan a la comparabilidad. Las orientaciones de progreso no prescriben incrementos automáticos ni piden entrenar al fallo.

## Asistente ligero de notas

Se activa con **Revisar mis notas**, tanto desde el progreso como desde «Referencia anterior y notas» en el formulario. Revisa las notas disponibles de las tres sesiones más recientes del mismo contexto (hasta 700 caracteres por nota). En el formulario usa sesiones anteriores; en el progreso incluye la sesión seleccionada para preparar la siguiente. No mezcla notas de otros días de rutina o cuentas.

**Es un asistente basado en reglas, no una IA.** Reconoce frases comunes en español, inglés, alemán, ruso, portugués y francés. Puede sugerir revisar técnica, cansancio, recuperación, molestias, esfuerzo fácil, tiempo, equipo o pausas dentro de una serie. Por ejemplo, «tuve que parar un momento para seguir» activa el consejo de distinguir repeticiones seguidas de series con pausas.

El motor WebLLM, el worker y la dependencia del modelo se eliminaron tras un bloqueo del equipo reportado al ejecutar el modelo anterior. La revisión nueva funciona sobre texto acotado, sin GPU, descargas, llamadas a proveedores, claves ni cuentas adicionales. Funciona sin conexión una vez que la app y las notas están cargadas. Los archivos de modelo que una versión anterior haya guardado en la caché del navegador no se ejecutan ni se vuelven a descargar; esta actualización no borra otros datos del navegador.

Cada sugerencia conserva una cita literal de la nota. Se omiten cláusulas con negaciones o hipótesis reconocidas; se limita la salida a tres temas distintos. Las reglas no comprenden todos los matices: pueden omitir observaciones o reconocer una frase fuera de contexto. No encontrar coincidencias no significa que todo esté bien. No hay diagnósticos, prescripciones de carga ni cambios automáticos en entrenamientos.

**Privacidad:** las notas conservan su persistencia habitual en Firestore. La revisión ocurre en el dispositivo sin solicitudes de red. Los consejos solo viven en memoria y se descartan al cambiar las fuentes o la cuenta.

## Activación y comprobación

Para la versión actual, publica primero el archivo completo `firestore.rules` y después el frontend en Vercel. Consulta [la guía de activación actual](COHERENCE.md). No cambian los índices ni las variables de entorno. La versión anterior ya publicada conserva su botón de IA hasta que se actualice: no debe usarse mientras tanto.

- `npm test`: métricas simultáneas, series ausentes, kg/lb, variantes, contextos, citas y reglas de notas con negaciones en seis idiomas.
- `npm run test:e2e -- --workers=1`: comparación del ejemplo, ambos datos en el gráfico y su detalle, referencias en el formulario, idiomas, móvil y revisión sin conexión con acceso a GPU y workers bloqueado deliberadamente.
- `npm run build`: frontend sin motor ni worker de IA.
