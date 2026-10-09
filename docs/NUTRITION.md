# Nutrición: uso y activación

## Activar en la aplicación publicada

1. Abre el proyecto **forma-gym-tracker** en la consola de Firebase.
2. Entra en **Firestore Database → Reglas**.
3. Copia **todo** el archivo `firestore.rules` de este proyecto y reemplaza el contenido del editor. Pulsa **Publicar**. Conserva las reglas de las funcionalidades anteriores; el archivo incluye el bloque nuevo para el perfil nutricional privado.
4. Despliega la versión actual del frontend mediante tu flujo habitual de Vercel.
5. En Forma, abre **Nutrición**, revisa tus datos, elige tu objetivo y actividad, y pulsa **Guardar objetivo y metas**. Recarga y comprueba el resumen de nutrición en **Resumen**.

No necesitas crear documentos a mano, nuevos índices, credenciales, variables de entorno, funciones de Firebase ni servicios de IA. El perfil se crea al guardar por primera vez. Si no publicas las reglas nuevas, la app mostrará un error de acceso al perfil nutricional; no presenta un guardado fallido como exitoso.

## Uso

Cuatro objetivos: volumen, recomposición, definición y mantenimiento. Los números se calculan al cambiar los campos; el botón aplica la preferencia al perfil. Puedes usar datos manuales o la última bioimpedancia por fecha y hora (los registros futuros se excluyen). El peso acepta kg o lb y se guarda normalizado a kg. La edad de una evaluación es la que se registró ese día: no se inventa una fecha de nacimiento. Se avisa si la evaluación tiene más de 90 días.

Al usar bioimpedancia, crear, editar o eliminar una evaluación actualiza la estimación derivada del perfil guardado. Mientras la app está abierta y conectada, la nueva estimación se sincroniza a Firestore. Si cambian los datos mientras la app está cerrada, se recalcula al abrirla; no hay una tarea de servidor en segundo plano. Un fallo de sincronización se muestra con opción de reintentar. Los campos de un borrador no se guardan automáticamente.

Las circunferencias de la última medición y los valores registrados de grasa, músculo esquelético y masa magra se muestran como contexto de progreso. No son variables de la fórmula elegida. No se reinterpretan medidas antiguas sin lado anatómico ni se mezclan mediciones de diferentes fechas como si fueran una sola evaluación.

La Macro-Guía contiene seis ejemplos con porción definida y fuente: huevo, atún, pollo, arroz, frijoles negros y aceite de oliva. Permite buscar y filtrar por nutriente. Destaca un nutriente por tarjeta; no representa la composición completa ni una dieta. El peso escurrido de una lata, la marca y los ingredientes de preparación importan.

Todos los textos del módulo están disponibles en los seis idiomas de Forma.

## Método y límites

- Mifflin–St Jeor: `10 × kg + 6.25 × cm − 5 × edad + s`, con `s = +5` (masculino) o `−161` (femenino). La selección se confirma en el formulario y no cambia el género registrado en la evaluación. [Estudio original](https://pubmed.ncbi.nlm.nih.gov/2305711/).
- Actividad: factores orientativos `1.2`, `1.375`, `1.55`, `1.725`. Incluyen trabajo y movimiento cotidiano, además de entrenamiento; no se suman nuevamente calorías de ejercicios. Son aproximaciones del producto, no mediciones de gasto energético.
- Ajustes iniciales del producto sobre mantenimiento: volumen `+10%`, recomposición `−5%`, definición `−15%`, mantenimiento `0%`. No forman parte de Mifflin–St Jeor, no garantizan recomposición o aumento muscular y requieren revisión según evolución.
- Proteína por objetivo: volumen `1.8 g/kg`; recomposición y definición `2 g/kg`; mantenimiento `1.6 g/kg`. Se limita a aproximadamente 35% de la energía para evitar asignaciones desproporcionadas con pesos elevados. [Posición de ISSN](https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/).
- Grasas: 30% de las calorías, dentro del intervalo de referencia de 20–35% para adultos. Carbohidratos: energía restante después de proteína y grasa, usando 4/4/9 kcal por gramo. Calorías redondeadas a decenas, macros a gramos. [Referencias de macronutrientes](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-macronutrients.html).
- No se presentan metas automáticas para menores de 18, mayores de 100, embarazo/lactancia o dieta médica indicada. No se propone déficit con IMC inferior a 18.5. También se descartan entradas no finitas o fuera de rango y resultados fuera de 1200–6000 kcal. Estos son límites conservadores de esta herramienta, no umbrales universales ni una indicación de que toda cifra dentro de ese intervalo sea adecuada. [Alcance de herramientas de planificación para adultos, NIDDK](https://www.niddk.nih.gov/bwp).

## Datos y seguridad

Documento privado `users/{uid}`:

```text
createdAt: timestamp del servidor
updatedAt: timestamp del servidor
nutrition:
  version: 1
  preferences:
    goal: bulk | recomp | cut | maintain
    activity: sedentary | light | moderate | high
    source: bio | manual
    sex: male | female
    manual: { age, height (cm), weight (kg) } | null
    specialCase: boolean
    bodyContext?: { priorities: RegionId[], comparable: boolean }
  inputs: { age, height, weight, sex } | null
  targets: { calories, protein, carbs, fat, resting, maintenance } | null
  sources: { bioId, bioDate, measurementId, measurementDate }
```

`targets: null` indica que no corresponde emitir una recomendación automática. Al desaparecer la evaluación necesaria o quedar fuera del alcance del cálculo se elimina la meta derivada, conservando las preferencias. La UI deriva el resultado con los datos actuales; el documento conserva la última instantánea sincronizada.

Solo el propietario puede leer el documento. Se requiere la misma autorización de suscripción que para los otros registros para escribir; el súper administrador puede gestionar su propio perfil, pero no leer el perfil de salud de otras cuentas. Las reglas validan campos, tipos, intervalos y coherencia energética básica. Las estimaciones se calculan en el cliente y no se usan para permisos, cobros o decisiones clínicas. Las transacciones detectan cambios simultáneos antes de reemplazar una instantánea.

La demostración usa `sessionStorage` (`forma-demo-nutrition-v1`), separado del perfil real.

## Explorador corporal y orientación por evolución

El mapa SVG interactivo muestra diez zonas en vista frontal/posterior, con animación al girar o seleccionar. Funciona con ratón, toque, teclado y selector de zonas. Respeta `prefers-reduced-motion`. Es una figura ilustrativa, no una reconstrucción del usuario ni una comparación con proporciones ideales.

Cada zona muestra las últimas medidas disponibles **por campo**, con fecha individual, cambio respecto al registro más reciente separado al menos 28 días (y no más de 180) y aviso cuando el dato tiene más de 90 días. Excluye fechas futuras. No mezcla brazos relajados/contraídos, muslos altos/medios ni lados. Las diferencias entre lados proceden de una misma sesión. Los registros antiguos sin lado conservan su etiqueta; no se convierten en izquierda/derecha. No hay una circunferencia específica para la espalda.

El resumen de todas las zonas muestra series de los últimos 28 días según el grupo explícito de cada ejercicio, sin adjudicar trabajo indirecto. Los grupos antiguos General/Brazos/Piernas quedan señalados como no clasificados. Cero registros no significa ausencia de entrenamiento. Una medida sin aumento no prueba un músculo rezagado: puede reflejar grasa, agua, técnica o evolución normal. El usuario elige sus prioridades; no se diagnostican deficiencias por tamaños absolutos ni se prescribe comida para hacer crecer un músculo concreto.

La lectura conjunta requiere confirmación del mismo equipo y condiciones, medidas recientes y dos evaluaciones separadas 28–180 días. Peso, grasa, músculo y agua deben compartir ambos informes de bioimpedancia; cintura debe estar a no más de 7 días de cada extremo. Sin datos suficientes muestra qué falta. Un cambio de agua de al menos 2 puntos porcentuales detiene las sugerencias de objetivo. Las comparaciones se calculan en el cliente con los registros actuales; no se guardan inferencias como diagnósticos.

Reglas orientativas del producto, **no umbrales clínicos validados**:

- En volumen, aumento simultáneo de peso ≥1%, grasa estimada ≥1 kg y cintura ≥1 cm: invita a revisar el superávit y permite previsualizar mantenimiento.
- En déficit/recomposición, descenso de peso ≥1 kg, músculo estimado ≥1 kg y masa magra ≥1 kg: invita a revisar recuperación, fuerza y déficit, con la misma opción de previsualización. La masa magra debe pertenecer a ambos informes.
- Grasa estimada ≤−1 kg, cintura con cambio absoluto <1 cm y músculo estimado ≥−0,5 kg: invita a seguir observando, sin afirmar ganancia muscular.
- Cuando el índice visceral aumenta en los mismos informes y también suben cintura ≥1 cm y grasa estimada ≥1 kg, muestra una observación adicional para revisar con el nutricionista y los rangos del equipo. No clasifica el índice como sano/peligroso por su valor absoluto ni cambia metas por sí solo.

Grasa y músculo esquelético estimados se calculan con peso × el porcentaje correspondiente en el mismo informe. La masa magra registrada se mantiene separada. La grasa segmentaria **nunca se interpreta como músculo**. Índice visceral, contenido óseo, metabolismo del informe y otras proporciones permanecen visibles en el desglose; no se inventan rangos universales de aparatos ni diagnósticos de densidad ósea o dosis de nutrientes. [Limitaciones de la medición de masa muscular](https://pubmed.ncbi.nlm.nih.gov/29349935/).

La orientación alimentaria depende del objetivo y propone repartir la proteína ya calculada, sin añadir proteína adicional. La ecuación Mifflin no recibe coeficientes de circunferencias o de índices de báscula. La acción de previsualizar cambia el borrador; **solo Guardar objetivo y metas aplica el cambio**. Se mantienen los límites para menores, condiciones especiales y entradas no válidas. [Proteína y ejercicio, ISSN](https://pubmed.ncbi.nlm.nih.gov/28642676/).

`bodyContext` es opcional para compatibilidad con perfiles existentes. Sus prioridades admiten exclusivamente `neck`, `shoulders`, `chest`, `back`, `arms`, `forearms`, `core`, `glutes`, `thighs`, `calves`, sin duplicados. Se guarda dentro del perfil nutricional privado y utiliza los mismos permisos por usuario. Para activar esta ampliación, publica el **archivo completo actualizado `firestore.rules`** antes de desplegar el frontend; no requiere colecciones, índices, Cloud Functions, claves ni migraciones nuevas.

## Verificación técnica

- `npm test`: cálculo, límites, selección de datos, macros y catálogos.
- `npm run test:e2e -- --workers=1`: interfaz, idiomas, kg/lb, borradores, guardado y actualización de registros en demo.
- `npm run test:rules`: aislamiento, límites y permisos del documento, además de las reglas anteriores.
- `npm run test:integration`: persistencia entre sesiones y recálculo con Auth/Firestore emulados, además de los flujos anteriores.
- `npm run build`: compilación de producción.
