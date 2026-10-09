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
  inputs: { age, height, weight, sex } | null
  targets: { calories, protein, carbs, fat, resting, maintenance } | null
  sources: { bioId, bioDate, measurementId, measurementDate }
```

`targets: null` indica que no corresponde emitir una recomendación automática. Al desaparecer la evaluación necesaria o quedar fuera del alcance del cálculo se elimina la meta derivada, conservando las preferencias. La UI deriva el resultado con los datos actuales; el documento conserva la última instantánea sincronizada.

Solo el propietario puede leer el documento. Se requiere la misma autorización de suscripción que para los otros registros para escribir; el súper administrador puede gestionar su propio perfil, pero no leer el perfil de salud de otras cuentas. Las reglas validan campos, tipos, intervalos y coherencia energética básica. Las estimaciones se calculan en el cliente y no se usan para permisos, cobros o decisiones clínicas. Las transacciones detectan cambios simultáneos antes de reemplazar una instantánea.

La demostración usa `sessionStorage` (`forma-demo-nutrition-v1`), separado del perfil real.

## Verificación técnica

- `npm test`: cálculo, límites, selección de datos, macros y catálogos.
- `npm run test:e2e -- --workers=1`: interfaz, idiomas, kg/lb, borradores, guardado y actualización de registros en demo.
- `npm run test:rules`: aislamiento, límites y permisos del documento, además de las reglas anteriores.
- `npm run test:integration`: persistencia entre sesiones y recálculo con Auth/Firestore emulados, además de los flujos anteriores.
- `npm run build`: compilación de producción.
