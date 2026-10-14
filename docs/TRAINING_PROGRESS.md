# Progreso por serie y notas para la siguiente sesión

En **Entrenamientos → Progreso por series** puedes elegir ejercicio, contexto, sesión y referencia. El historial existente ya contiene pesos y repeticiones individuales: no hay migración ni campos nuevos en Firestore.

## Comparación

- Ejemplo: `100×8, 90×8, 90×8, 90×8` frente a cuatro series de `100×8`. Ambos máximos son 100 kg, pero el volumen pasa de 2960 a 3200 kg·repeticiones (+8,1%) y el objetivo de 100 kg × 8 repeticiones pasa de 1/4 a 4/4 series.
- Se compara serie 1 con serie 1, etc. El peso se normaliza a kg antes del cálculo; cambiar la unidad de visualización no modifica registros. Los registros antiguos sin unidad se interpretan como kg, como en el resto de Forma.
- Una mejora de carga con caída de repeticiones se etiqueta «Cambio mixto». Las series añadidas o ausentes no se contabilizan como cero ni como un retroceso.
- El gráfico permite elegir número de serie y peso/repeticiones. Conserva sesiones del mismo día como puntos distintos y deja huecos cuando falta una serie. Tiene una lista de datos equivalente accesible.
- La identidad usa nombre normalizado y grupo muscular, conservando variantes como «Sentadilla Smith». Bloques repetidos del mismo ejercicio dentro de una sesión se mantienen separados por su orden. No hay emparejamiento difuso entre ejercicios distintos.
- La referencia automática usa una fecha anterior del mismo contexto. Rutinas se identifican por rutina y día; sesiones libres por nombre y lista de ejercicios. Sin horas de sesión no se inventa el orden de dos sesiones en la misma fecha: el usuario puede elegir la referencia.
- Al registrar un entrenamiento aparecen los valores anteriores junto a cada serie cuando hay una sesión comparable. Se muestran como referencia, sin reemplazar el borrador ni los valores de la rutina.

Volumen de carga no equivale por sí solo a fuerza o hipertrofia. Técnica, rango, descansos, calentamientos y equipo afectan a la comparabilidad. Las orientaciones de progreso no prescriben incrementos automáticos ni piden entrenar al fallo.

## IA local gratuita

Se activa con **Analizar notas con IA local**, tanto desde el progreso como desde «Referencia anterior y notas» en el formulario. Analiza las notas disponibles de las tres sesiones más recientes del mismo contexto (hasta 700 caracteres por nota). En el formulario usa sesiones anteriores; en el progreso incluye la sesión seleccionada para preparar la siguiente. No mezcla notas de otros días de rutina o cuentas.

Motor: `@mlc-ai/web-llm` fijado a `0.2.86`. Modelo: `Qwen2.5-1.5B-Instruct-q4f32_1-MLC`, del catálogo oficial MLC, compatible con los idiomas de la interfaz. Requiere navegador/dispositivo con WebGPU y memoria suficiente (el catálogo estima unos 1,9 GB de memoria GPU). La primera descarga de pesos es aproximadamente **869 MB** (más tokenizer y librería; la UI avisa ~1 GB). Se reutiliza la caché del navegador. No hay API keys, cuentas de IA, funciones de servidor ni cobro por consulta; sí se consumen recursos y datos del dispositivo. No se garantiza el funcionamiento en todos los móviles.

La descarga se inicia únicamente con el botón, después de comprobar WebGPU. El SDK y la inferencia viven en un worker; la navegación habitual no carga ese motor ni el modelo. Hay progreso, cancelación y un límite de cinco minutos por intento. Se libera el worker al finalizar, cancelar, salir o cambiar las fuentes/cuenta. Si no hay soporte, falla la descarga o falta memoria, la comparación de series y las notas continúan disponibles con un aviso claro. No se sustituye la IA por reglas presentadas como si fueran un modelo.

El modelo extrae temas (técnica, fatiga, recuperación, molestias, esfuerzo fácil, tiempo o equipo) y una cita literal. Se le indica respetar negaciones y tratar notas como datos, no instrucciones. El cliente valida JSON, temas permitidos, fuente y cita exacta antes de mostrar un consejo revisable de Forma. No se ejecuta texto generado, no se interpreta HTML y no se aceptan diagnósticos o cargas inventadas. Las citas permiten revisar errores semánticos que un modelo pequeño todavía puede cometer. Las respuestas no se guardan en Firebase y no cambian entrenamientos.

**Privacidad:** las notas conservan su persistencia habitual en Firestore. Para la IA se procesan localmente; no se envían a Hugging Face, MLC ni a otro proveedor. Las solicitudes externas de descarga solo buscan archivos públicos del modelo. El resultado vive en memoria de la vista y se descarta al cambiar su contexto.

Fuentes técnicas: [uso de WebLLM](https://webllm.mlc.ai/docs/user/basic_usage.html), [ejecución en workers](https://webllm.mlc.ai/docs/user/advanced_usage.html), [modelo MLC](https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC).

## Activación y comprobación

Solo hace falta desplegar los cambios del proyecto en Vercel. **No cambian `firestore.rules`, índices ni variables de entorno.** Los perfiles y permisos existentes siguen aplicándose. La IA puede activarse después desde el navegador de cada usuario.

- `npm test`: métricas, series ausentes, kg/lb, variantes, contextos de notas, validación de evidencia y ciclo de vida del worker.
- `npm run test:e2e -- --workers=1`: comparación del ejemplo, referencias en el formulario, seis idiomas, móvil y ausencia de descarga automática.
- Las pruebas de respuesta de IA que sustituyen el worker están rotuladas como **modelo simulado**: verifican integración, no calidad real de inferencia.
- `npm run build`: frontend y worker de producción.

La verificación de esta entrega pasó 54 pruebas unitarias, 15 de interfaz y la compilación de producción. El navegador automatizado no ofreció un adaptador WebGPU; por eso no se ejecutó el modelo real en este entorno. Su inferencia y rendimiento deben comprobarse en un dispositivo compatible con el botón de análisis.
