# Suscripciones y súper administrador de Forma

## Activación de esta versión

1. Publicar el contenido completo de `C:\Freelance\gym-health-tracker\firestore.rules` en Firebase → Firestore Database → Reglas → Publicar.
2. Desplegar los cambios del proyecto en Vercel con el flujo habitual. No hay variables de entorno nuevas, índices compuestos, Cloud Functions ni servicios de cobro adicionales.
3. Iniciar sesión con **swebb1732@gmail.com**. Si ese correo aún no está verificado, la app muestra «Enviar verificación». Abrir el enlace recibido y pulsar «Ya verifiqué mi correo».
4. Elegir «Entrar como usuario» o «Entrar como administrador». «Cambiar de modo» permite alternar sin cerrar sesión.
5. Revisar Administración → Configuración. Se reutiliza la cuenta SINPE de FutManager: **8727 3417**, **Sebastián Webb Vargas**. Puede cambiarse desde la app.

Las reglas deben acompañar este despliegue. La versión anterior no crea perfiles de membresía; con las reglas nuevas, una pestaña antigua puede dejar de guardar hasta recargar la aplicación actualizada. No se han publicado cambios en Firebase ni en Vercel desde esta tarea.

## Planes iniciales

| Plan    |   Total | Ahorro respecto al mensual |
| ------- | ------: | -------------------------: |
| 1 mes   |  ₡5.000 |                          — |
| 3 meses | ₡14.250 |                  ₡750 (5%) |
| 1 año   | ₡54.000 |               ₡6.000 (10%) |

Todos incluyen las mismas funciones. Cada pago cubre un periodo completo; no hay cobros automáticos. La pantalla muestra el equivalente mensual y calcula descuentos a partir de los precios vigentes.

## Gestión diaria

- «Mi suscripción»: estado, vencimiento, días restantes, planes, SINPE, enlace al comprobante por WhatsApp e historial propio.
- Administración → Suscripciones: buscar por correo/ID, filtrar por estado, registrar pagos, editar fechas/notas, suspender y reactivar.
- «Registrar SINPE»: seleccionar plan y referencia; confirmar que el dinero llegó al banco. La app no verifica cuentas bancarias. Un mensaje o comprobante por WhatsApp no activa el acceso.
- Se preservan los días restantes al renovar. Una suscripción vencida se renueva desde la fecha actual en Costa Rica. Los meses se ajustan al último día cuando corresponde.
- Las referencias SINPE se normalizan a mayúsculas y aceptan de 4 a 80 letras, números o guiones. Un bloqueo único evita duplicados incluso en confirmaciones simultáneas.
- El identificador de pago hace seguros los reintentos. Si cambió el precio mientras el formulario estaba abierto, hay que volver a abrirlo para revisar el nuevo importe.
- Un ajuste manual de vencimiento requiere motivo, queda auditado y no inventa un pago.
- Suspender conserva datos, pagos y fechas. Reactivar no reinicia la prueba.
- Configuración permite cambiar precios, teléfono y titular. Los pagos anteriores conservan el importe cobrado.
- Pagos muestra los últimos 100 cobros; el resumen de cobros mensuales corresponde a ese historial visible. Actividad muestra los últimos 50 ajustes.

## Prueba y cuentas existentes

Cada cuenta recibe una prueba única de **30 días** desde su primer acceso a esta versión. Las cuentas anteriores se incorporan automáticamente cuando vuelven a entrar, sin modificar sus rutinas, medidas ni entrenamientos. La administración lista los perfiles que ya entraron; no consulta el directorio completo de Firebase Authentication.

Al vencer o suspenderse una cuenta, la interfaz dirige a «Mi suscripción» y Firestore rechaza nuevos registros y modificaciones. El propietario de los datos mantiene permiso de lectura y borrado de su historial en las reglas. La interfaz de esta versión concentra el acceso vencido en la renovación. El súper administrador tiene acceso personal incluido.

## Seguridad y esquema

El permiso de administrador se verifica en Firestore con el correo fijo **swebb1732@gmail.com** y `email_verified == true` del token de Firebase Authentication. No hay un campo de rol editable por el usuario. Este correo corresponde a la identidad propietaria de la aplicación; cambiarla requiere una modificación deliberada de las reglas y del código.

Firebase documenta el significado de [email_verified en request.auth](https://firebase.google.com/docs/reference/rules/rules.firestore.Request#auth) y las [validaciones de transacciones con getAfter](https://firebase.google.com/docs/firestore/security/rules-conditions).

Colecciones nuevas:

- `members/{uid}`: email, active, subscriptionStatus (trial/active), subscriptionEndsAt (Timestamp o null), notes, createdAt y updatedAt. La prueba se calcula desde createdAt + 30 días; el cliente no puede extenderla ni borrar/recrear el perfil.
- `settings/billing`: phone, holder, monthly, quarterly, yearly, updatedAt y updatedBy.
- `subscriptionPayments/{paymentId}`: cuenta, plan, meses, monto, referencia, vencimientos y autor/fecha de verificación. Inmutable.
- `subscriptionPaymentReferences/{REFERENCIA}`: paymentId y memberId. Único e inmutable.
- `subscriptionAudit/{id}`: cambios de membresía, motivo, valores anteriores/nuevos, autor y fecha. Inmutable.
- `billingAudit/{id}`: cambios de precios y datos SINPE, autor y fecha. Inmutable.

El cliente corriente solo consulta su perfil e historial de pagos y los precios públicos para usuarios autenticados. No puede cambiar importes, estatus, vencimientos ni roles. El administrador gestiona los metadatos de suscripción, **sin acceso a los registros de salud de otras personas**.

Los vencimientos pagados se guardan como un instante exclusivo: las 00:00 del día siguiente en Costa Rica. La fecha visible «hasta» es inclusiva. No depende de la zona horaria del dispositivo.

## Código y pruebas

- `src/lib/subscription.ts`: precios, estado, fechas, descuentos y enlace de pago.
- `src/services/subscriptions.ts`: transacciones y auditoría.
- `src/context/SubscriptionContext.tsx`: perfil, configuración, estado y permisos de la sesión.
- `src/pages/Subscription.tsx`, `src/pages/Admin.tsx`: vistas.
- `src/components/admin/BillingForms.tsx`: formularios.
- `src/components/ModeChooser.tsx`, `OwnerVerification.tsx`: acceso del propietario.
- `src/hooks/usePayments.ts`, `PaymentHistory.tsx`: historial.

Comandos:

```
npm test
npm run build
npm run test:e2e
npm run test:rules
npm run test:integration
```

Las pruebas usan el proyecto ficticio demo-forma y emuladores locales. No deben ejecutarse contra datos reales.
