# Idiomas de Forma

La aplicación admite español, inglés, alemán, ruso, portugués de Brasil y francés. El español es el idioma inicial.

El selector está disponible antes de iniciar sesión, en la barra superior y dentro de los cuadros de diálogo. El cambio es inmediato y conserva los formularios abiertos. La preferencia se guarda en este navegador con la clave `forma-language`; no se sincroniza entre dispositivos. Las otras pestañas del mismo navegador reciben el cambio.

Se traducen navegación, paneles, formularios, grupos musculares, medidas, suscripciones y administración. Las fechas y los números utilizan el formato del idioma seleccionado. Los precios siguen siendo en colones costarricenses y los vencimientos conservan la zona horaria de Costa Rica. Los nombres, descripciones y notas escritos por los usuarios no se traducen ni se modifican.

No se requieren cambios en Firebase, reglas de Firestore ni variables de entorno. Para que aparezca en la web pública hay que desplegar la nueva versión del frontend mediante el flujo habitual de Vercel.

## Desarrollo

- `src/lib/i18n.ts`: idioma activo, persistencia, suscripciones React e interpolación de mensajes.
- `src/lib/locales/`: catálogos completos de los cinco idiomas adicionales. La clave es el texto original en español.
- `src/components/LanguageSelector.tsx`: selector compartido, con nombres nativos de los idiomas.
- Usar `useLanguage()` en componentes que presenten traducciones y `t("Texto en español")` para mensajes. Interpolar valores con `{0}`, `{1}`, etc., pasando un objeto como segundo argumento.
- Mantener identificadores de datos y valores de formularios separados de las etiquetas traducidas. Los días de la semana y grupos musculares existentes conservan sus valores originales en Firestore.
- Para nuevas frases, añadir la misma clave a los cinco catálogos; la prueba de catálogos comprueba paridad y marcadores de interpolación.

## Verificación

`npm test` cubre catálogos, interpolación, formatos y compatibilidad con los datos. `npm run test:e2e -- --workers=1` comprueba los seis idiomas, persistencia, borradores, formularios y vistas móviles. `npm run test:integration` valida autenticación, suscripciones y administración con los emuladores locales.
