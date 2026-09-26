# Forma — Gym & Health Tracker

Actualización de entrenamiento: [rutinas por días, kg/lb y medidas detalladas](docs/TRAINING-UPDATE.md).

Aplicación en español con React 19, TypeScript, Vite, Tailwind CSS 4, Firebase Authentication, Firestore y Recharts. Preparada para Vercel.

## Ejecutar

Requiere Node.js 22 o superior y npm.

```powershell
cd C:\Freelance\gym-health-tracker
npm install
npm run dev
```

Abre la dirección que muestra Vite. Sin configuración Firebase, inicia en demostración: datos ficticios y cambios almacenados en sessionStorage de esta pestaña, sin enviar información a la nube. Salir de la demo no borra esos datos; cerrar la pestaña finaliza su sesión. La demo nunca se importa automáticamente a una cuenta.

## Arquitectura

```text
src/
  components/
    ui.tsx                 # Campos, diálogo accesible, estados vacíos, acciones
    ExerciseEditor.tsx     # Ejercicios y series editables
    ProgressChart.tsx      # Gráficos reutilizables
    WorkoutForm.tsx        # Formulario de sesión reutilizable
  context/
    AuthContext.tsx        # Sesión Firebase y demostración
    DataContext.tsx        # Suscripciones Firestore, CRUD y adaptador de demo
  lib/
    firebase.ts            # Inicialización y emuladores opcionales
    demo.ts                # Datos ficticios
    fields.ts              # Definición de campos y unidades
    metrics.ts             # Fechas locales, volumen, IMC e historial
    metrics.test.ts        # Pruebas de cálculos
  pages/
    AuthPage.tsx
    Dashboard.tsx
    Routines.tsx
    Workouts.tsx
    Measurements.tsx
    Bioimpedance.tsx
  App.tsx                  # Navegación por hash, tema y shell responsivo
  main.tsx
  styles.css               # Tailwind y sistema visual claro/oscuro
docs/
  FIRESTORE.md             # Modelo, ejemplos, restricciones y decisiones
tests/
  firestore.test.mjs       # Seguridad: dueño, anónimo y otro usuario
  app.spec.ts              # Flujos de interfaz y adaptación móvil
firestore.rules
firestore.indexes.json
firebase.json
vercel.json
.env.example
```

## Conectar Firebase

1. Crea un proyecto en Firebase y registra una aplicación web.
2. En Authentication → Sign-in method, habilita Email/Password.
3. Crea Cloud Firestore en modo producción y elige su región.
4. Copia `.env.example` a `.env.local` y completa los valores de la configuración web del proyecto.
5. Publica las reglas antes de utilizar datos reales:
   ```powershell
   npx firebase login
   npx firebase deploy --only firestore:rules,firestore:indexes --project TU_PROJECT_ID
   ```
6. En Authentication → Settings → Authorized domains, añade localhost para desarrollo y el dominio de Vercel para producción.
7. Reinicia Vite tras modificar variables de entorno.

No agregues claves de servicio ni credenciales Admin SDK al frontend. Los valores VITE_FIREBASE_* son configuración pública del SDK web; las reglas y Firebase Auth controlan el acceso. El registro de cuenta no necesita un documento de perfil: sus subcolecciones se crean con el primer registro.

## Vercel

1. Sube este proyecto a tu repositorio e impórtalo en Vercel, o ejecuta `npx vercel` desde esta carpeta.
2. Preset Vite; instalación `npm ci`; build `npm run build`; output `dist`.
3. Añade las seis variables VITE_FIREBASE_* en Project Settings → Environment Variables. Mantén VITE_USE_FIREBASE_EMULATORS=false.
4. Despliega y añade el dominio final a los dominios autorizados de Firebase.
5. Verifica un registro, un inicio de sesión y una lectura/escritura real en ese proyecto.

Los valores VITE_* se incorporan durante la compilación: después de cambiarlos debes volver a desplegar. El repositorio contiene la configuración, pero no crea cuentas ni proyectos remotos por sí solo.

## Funcionalidades

- Autenticación por correo/contraseña, registro, recuperación y cierre de sesión.
- Rutinas con ejercicios personalizados, series, repeticiones, peso y grupo muscular; crear, editar, eliminar e iniciar sesión de entrenamiento.
- Entrenamientos fechados con duración, notas, ejercicios y series independientes de la rutina original; edición, borrado, filtro mensual y volumen.
- Circunferencias de bíceps, pecho, cintura, muslos y pantorrillas con gráficos individuales.
- Todas las secciones solicitadas de bioimpedancia, incluida grasa segmentaria en kg y %, consulta completa, edición y borrado.
- Dashboard con peso, grasa, músculo esquelético estimado, sesiones semanales, curvas y máximos diarios por ejercicio.
- Tema claro/oscuro persistente, navegación móvil, foco de teclado y diálogos nativos con Escape y contención de foco.

## Semántica de datos

- Pesos de ejercicios en kg o lb (según `unit`); datos de bioimpedancia en kg; circunferencias y altura en cm, duración en minutos y energía en kcal.
- No se reemplazan mediciones ausentes por cero.
- IMC opcional en el formulario: se calcula como kg / metros² si se deja vacío.
- Músculo esquelético estimado = peso × porcentaje / 100; no equivale a masa corporal magra.
- Índices del informe se transcriben tal como aparecen; no se emiten diagnósticos ni categorías clínicas.
- `normalMuscle/Fat/Skeleton/Other` y `fatProportion` se almacenan como porcentajes, según las etiquetas del formulario. Comprueba las unidades del informe.
- Fecha y hora son valores locales de la prueba; createdAt y updatedAt son marcas de tiempo del servidor.
- Los gráficos usan fechas históricas, no fechas de creación de los documentos. Las evaluaciones del mismo día mantienen registros separados.

## Verificación

```powershell
npm run build
npm test
npm run test:rules
npm run test:e2e
npm run test:integration
npm run format:check
```

Las pruebas de reglas usan proyecto demo y emulador Firestore: requieren Java 21+, descarga inicial del emulador y el puerto 8080 libre. Las pruebas de interfaz usan Chromium; instala una vez con `npx playwright install chromium`. Para probar la aplicación manualmente con ambos emuladores, usa configuración de un proyecto demo y VITE_USE_FIREBASE_EMULATORS=true, y ejecuta `npx firebase emulators:start --only auth,firestore --project demo-forma`.

## Alcance y evolución

Las suscripciones cargan las colecciones personales completas, apropiado para un tracker individual inicial. Para historiales muy extensos, incorporar consultas paginadas y agregados antes de escalar. Firestore valida propietario, campos permitidos, tipos de métricas y límites principales; la estructura interna de las listas de ejercicios y series se valida en el cliente. Si se requiere validación inviolable por serie, normalizar series en documentos o usar un backend validado. No se activa caché persistente de Firestore en el dispositivo. No hay sincronización offline garantizada.

### Emuladores en Windows

Si Java informa `Unable to establish loopback connection`, usa una ruta temporal corta sin alias 8.3 antes de ejecutar los emuladores:

```powershell
$env:JAVA_TOOL_OPTIONS='-Djdk.net.unixdomain.tmpdir=C:\Freelance\gym-health-tracker'
npm run test:rules
npm run test:integration
```

La propiedad solo se aplica a los procesos iniciados desde esa terminal. Referencia: [propiedades de red de Java](https://docs.oracle.com/en/java/javase/17/core/java-networking.html).

### Comprobaciones realizadas

- 6 pruebas de cálculos de métricas.
- 3 pruebas de reglas: permisos por propietario, rechazo de datos inválidos y aceptación de una evaluación completa.
- 2 pruebas de interfaz: flujos de demostración y adaptación móvil/tema.
- 1 prueba integrada con Auth + Firestore emulados: registro, login, edición, borrado de campos opcionales, preservación del historial y separación entre cuentas.
- Revisión visual en escritorio (1440 px) y móvil (390 px), tema claro y oscuro.

La conexión a un proyecto Firebase real y el despliegue remoto quedan pendientes de tu configuración.
