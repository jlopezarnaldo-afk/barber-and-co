# Informe Consolidado de Auditoría Pre-Deploy

**Proyecto**: Barber & Co. — Grooming Studio  
**Entorno de Destino**: Deploy abierto en Vercel (Preview demo para cliente/dueño)  
**Modo Operativo**: SOLO LECTURA estricto (auditoría previa a correcciones)  
**Fecha de Emisión**: 15 de Septiembre de 2026  
**Coordinación**: Líder de Calidad de Software  

---

## 1. Resumen Ejecutivo

Se coordinaron 3 agentes auditores especializados para analizar la totalidad del código, flujo funcional, seguridad y preparación para despliegue en Vercel.

> **Nota Informativa de Contexto (Bajo Impacto)**:  
> El PIN de acceso (`1111` para Staff, `9999` para Dueño) implementado en `PinLockModal.tsx` y `storageService.ts` es deliberadamente una barrera de fricción de UX para ordenar la demostración. Al ser una Single Page Application estática cliente sin backend, cualquier persona técnica puede inspeccionar o forzar el rol desde DevTools (`localStorage.setItem('barber_session_role', 'admin')`). Esto es plenamente esperado y aceptable para este demo.

### Cuadro de Hallazgos por Severidad

| Auditoría Especializada | Crítico | Alto | Medio | Bajo / Informativo | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Agente 1: Auditoría de Seguridad** | 0 | 0 | 2 | 4 | **6** |
| **Agente 2: QA y Pruebas Funcionales** | 0 | 3 | 2 | 2 | **7** |
| **Agente 3: Rendimiento & Deploy (Vercel)** | 1 | 0 | 2 | 3 | **6** |
| **TOTAL CONSOLIDADO** | **1** | **3** | **6** | **9** | **19** |

---

## 2. Sección por Agente Auditor

---

### AGENTE 1 — AUDITOR DE SEGURIDAD
*(Audiencia controlada: Demostración al dueño / Acceso público en Vercel)*

#### Hallazgo 1.1: Ausencia de `ErrorBoundary` global en el árbol de componentes React
- **Severidad**: Medio
- **Ubicación**: `src/main.tsx:6-10`
- **Impacto**: Cualquier excepción inesperada en el ciclo de vida de React desmonta la aplicación completa y deja una pantalla blanca sin mensaje explicativo ni botón de recuperación frente al cliente.
- **Detalle**: El componente raíz `<App />` se monta sin un envoltorio de captura de errores (`componentDidCatch` o `react-error-boundary`).

#### Hallazgo 1.2: Métodos de lectura en `localStorage` sin bloque `try / catch` (`SyntaxError`)
- **Severidad**: Medio
- **Ubicación**: `src/services/storageService.ts:173, 190, 201, 488`
- **Impacto**: Si alguna clave en el `localStorage` del navegador se corrompe o contiene texto JSON inválido, la aplicación crashea en el arranque (`useState` inicial) de forma irrecuperable sin poder reinicializarse sola.
- **Detalle**: Mientras que `getServices()` contiene un `try/catch` de fallback, los métodos `getSettings()`, `getBranches()`, `getStaff()` y `getAppointments()` invocan `JSON.parse(...)` directamente.

#### Hallazgo 1.3: Potencial inyección de fórmulas de hoja de cálculo en la exportación CSV
- **Severidad**: Bajo
- **Ubicación**: `src/services/storageService.ts:563-576`
- **Impacto**: Si se exporta el archivo CSV y se abre en Microsoft Excel, notas de cliente que inicien con caracteres de fórmula (`=`, `+`, `-`, `@`) podrían disparar advertencias de seguridad al dueño.
- **Detalle**: La función exportadora escapa comillas dobles (`replace(/"/g, '""')`), pero no antepone una comilla simple (`'`) para neutralizar fórmulas dinámicas.

#### Hallazgo 1.4: Omisión de atributo `maxLength` en campos de texto del Wizard
- **Severidad**: Bajo
- **Ubicación**: `src/components/BookingWizard.tsx:740-780`
- **Impacto**: Permite ingresar cadenas de texto arbitrariamente extensas que pueden desbordar visualmente las tarjetas de agenda y saturar la cuota de almacenamiento del navegador.
- **Detalle**: Los campos `clientName`, `clientPhone` y el área de texto `clientNotes` carecen del atributo `maxLength`.

#### Hallazgo 1.5: Evaluación de Inyección HTML / XSS en campos libres
- **Severidad**: Bajo / Informativo (Conforme)
- **Ubicación**: `src/components/BookingWizard.tsx:861`, `src/components/StaffPanel.tsx:470`
- **Impacto**: No existe riesgo de ejecución de script malicioso; la salida es segura.
- **Detalle**: No se utiliza `dangerouslySetInnerHTML`, `innerHTML` ni `document.write` en todo el proyecto. React neutraliza e inserta las notas y nombres como nodos de texto plano. La URL de WhatsApp usa `encodeURIComponent(message)`, protegiendo los parámetros de query.

#### Hallazgo 1.6: Escaneo de Secretos, API Keys y Datos Mock de Clientes
- **Severidad**: Bajo / Informativo (Conforme)
- **Ubicación**: `src/data/initialData.ts:254-360`
- **Impacto**: No hay claves privadas, credenciales de terceros ni datos residuales de otros proyectos expuestos al público.
- **Detalle**: 
  - Búsqueda exhaustiva de patrones `sk_`, `secret`, `token`, `bearer` arrojó 0 resultados.
  - No existen referencias a proyectos anteriores ("Reino Duelista", "Listorti", etc.).
  - Todos los clientes precargados son ficticios y sobrios ("Alejandro Rossi", "Santiago Vidal", "Esteban Morales") con numeración genérica `+54 9 11 ...`.

---

### AGENTE 2 — AUDITOR FUNCIONAL / QA

#### Hallazgo 2.1: El horario seleccionado persiste y elude validaciones al cambiar servicio o barbero en el Paso 2
- **Severidad**: Alto
- **Pasos para Reproducir**:
  1. En el Wizard, seleccionar la sede "Palermo Soho" (cierre: 20:00 hs).
  2. En el Paso 2, seleccionar un servicio de 20 minutos (ej. "Limpieza Facial Express").
  3. En el Paso 3, elegir las `19:30` hs (finaliza 19:50 hs, horario válido).
  4. Presionar "Atrás" hacia el Paso 2.
  5. Cambiar el servicio por "Alisado Progresivo" (60 min) o cambiar el barbero por uno ya ocupado a las 19:30 hs.
  6. Avanzar al Paso 3.
- **Comportamiento Actual**:
  El estado `selectedTimeSlot` conserva `'19:30'`. Aunque el slot aparezca deshabilitado en la grilla visual, el botón de navegación inferior valida únicamente `disabled={!selectedTimeSlot}` (`BookingWizard.tsx:671`) y permanece habilitado. El usuario puede pasar al Paso 4 y confirmar una reserva que concluye a las 20:30 hs (fuera del horario comercial) o que se solapa con otro turno del barbero.
- **Comportamiento Esperado**:
  Al modificar el servicio (`BookingWizard.tsx:395`) o el barbero (`BookingWizard.tsx:439, 460`), debe ejecutarse inmediatamente `setSelectedTimeSlot('')`. Además, `handleConfirmBooking` (`BookingWizard.tsx:130`) debe verificar que el slot seleccionado esté presente y activo en `availableSlots`.

#### Hallazgo 2.2: Creación de turnos superpuestos por ausencia de validación concurrente en `saveAppointment`
- **Severidad**: Alto
- **Pasos para Reproducir**:
  1. Abrir la web en dos dispositivos o pestañas al mismo tiempo.
  2. En ambas ventanas, iniciar el wizard para el mismo barbero, fecha y franja horaria.
  3. Confirmar la reserva en la ventana A.
  4. Confirmar la reserva en la ventana B.
- **Comportamiento Actual**:
  La función `storageService.saveAppointment()` guarda directamente el turno en `localStorage` sin chequear colisiones mediante `doIntervalsOverlap()`. Ambas reservas quedan registradas para el mismo profesional al mismo tiempo.
- **Comportamiento Esperado**:
  `saveAppointment()` debe validar la disponibilidad del profesional y de la capacidad del salón antes de persistir, arrojando un error controlado si el turno fue tomado instantes antes.

#### Hallazgo 2.3: Colapso fatal de React (`TypeError`) si el catálogo de servicios está vacío
- **Severidad**: Alto
- **Pasos para Reproducir**:
  1. Ingresar al Panel de Dueño -> Pestaña Servicios y eliminar todos los servicios (o simular `localStorage` con `barber_services: "[]"`).
  2. Navegar a la página principal pública (`/`).
- **Comportamiento Actual**:
  En `src/components/ServiceCatalog.tsx:18-19`:
  ```ts
  const featuredService = services.find((s) => s.id === 'serv-1') || services[0];
  const otherServices = services.filter((s) => s.id !== featuredService.id);
  ```
  Al estar vacío el array, `featuredService` es `undefined`. La evaluación de `featuredService.id` dispara un `Uncaught TypeError: Cannot read properties of undefined (reading 'id')`, provocando pantalla blanca absoluta.
- **Comportamiento Esperado**:
  Incluir optional chaining y una guarda de estado vacío:
  `if (services.length === 0) return <EmptyCatalogState />;`

#### Hallazgo 2.4: Los 4 modales del Panel de Dueño quedan inaccesibles en pantallas móviles de 375px
- **Severidad**: Medio
- **Pasos para Reproducir**:
  1. Emular un viewport móvil de 375px (iPhone SE, 375x667) en DevTools.
  2. Ingresar al Panel de Dueño (PIN 9999).
  3. Abrir cualquiera de los modales: "Alta de Nuevo Barbero", "Agregar Nuevo Servicio", "Editar Servicio" o "Confirmar Eliminación".
- **Comportamiento Actual**:
  Los contenedores modales (`AdminPanel.tsx:1662, 1810, 2013, 2163`) carecen de `max-h` y `overflow-y-auto`. Con el teclado virtual en pantalla o en resoluciones pequeñas, los campos inferiores y los botones "Guardar" o "Cancelar" quedan cortados fuera del viewport sin poder desplazarse.
- **Comportamiento Esperado**:
  Incorporar `max-h-[90dvh] overflow-y-auto` a los contenedores modales, replicando el patrón implementado en `PinLockModal.tsx`.

#### Hallazgo 2.5: Validación permisiva en campo de teléfono acepta letras y caracteres especiales
- **Severidad**: Medio
- **Pasos para Reproducir**:
  1. En el Paso 4 del Wizard, ingresar como teléfono `"texto-12345678-abc!@#"`.
  2. Presionar "Confirmar reserva".
- **Comportamiento Actual**:
  `BookingWizard.tsx:136` solo evalúa `clientPhone.replace(/\D/g, '').length < 8`. Si detecta al menos 8 dígitos dispersos entre letras y símbolos, aprueba el campo y guarda el string corrupto.
- **Comportamiento Esperado**:
  Validar contra una expresión regular estricta de telefonía (ej. `/^(\+54\s?9?\s?)?[\d\s\-()]{8,18}$/`) y rechazar caracteres alfanuméricos.

#### Hallazgo 2.6: Inconsistencia de tipo y serialización de `null` en la matriz de precios del Dueño
- **Severidad**: Bajo
- **Pasos para Reproducir**:
  1. En Panel de Dueño -> Precios, borrar el valor de una celda o tipear caracteres de texto.
  2. Guardar los cambios.
- **Comportamiento Actual**:
  `handleSaveServicePrices` convierte el valor con `Number(...)`. El texto genera `NaN`, que al serializarse con `JSON.stringify` se almacena como `null` dentro de `branchPrices`. Asimismo, si se ingresa un precio negativo para Palermo Soho, `storageService.ts:447` sobrescribe `service.price = branchPrices.palermo`, contaminando el precio base por defecto.
- **Comportamiento Esperado**:
  Validar en el cliente que cada precio sea un número entero mayor a un piso mínimo razonable (ej. `$500`) antes de persistir.

#### Hallazgo 2.7: Ausencia de mensaje en estado vacío para el Historial General de Reservas del Dueño
- **Severidad**: Bajo
- **Pasos para Reproducir**:
  1. Filtrar reservas inexistentes o limpiar el historial de turnos.
  2. Ir a la pestaña "Historial General de Reservas" en el Panel de Dueño.
- **Comportamiento Actual**:
  La tabla muestra un `<tbody>` vacío sin mensaje orientativo (`AdminPanel.tsx:1603`).
- **Comportamiento Esperado**:
  Mostrar una fila con mensaje explicativo ("No hay reservas registradas"), en consistencia con lo que ya realiza `StaffPanel.tsx:412`.

---

### AGENTE 3 — AUDITOR DE RENDIMIENTO Y DEPLOY-READINESS (VERCEL)

#### Hallazgo 3.1: Service Worker con estrategia "Cache-First" permanente en `index.html`
- **Severidad**: **Crítico**
- **Ubicación**: `public/sw.js:3-10, 38-42`
- **Impacto**: En Vercel, cada nuevo despliegue genera nuevos nombres de archivo con hash para los assets compilados. Al tener el `index.html` cacheado de forma agresiva por el Service Worker, los navegadores de los visitantes y del dueño seguirán mostrando indefinidamente la versión antigua apuntando a scripts borrados del servidor, impidiendo ver actualizaciones posteriores sin un borrado manual de caché.
- **Detalle**:
  `ASSETS_TO_CACHE` contiene `'/'` e `'/index.html'`. En el evento `fetch`:
  ```javascript
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse; // Cache-First agresivo
      return fetch(event.request)...
    })
  );
  ```
- **Solución Requerida**:
  Implementar estrategia **Network-First** para peticiones de navegación (`event.request.mode === 'navigate'`), utilizando la caché únicamente como respaldo offline.

#### Hallazgo 3.2: Descarga simultánea de 3 imágenes de alta resolución en el Hero sin Lazy-Loading
- **Severidad**: Medio
- **Ubicación**: `src/components/Hero.tsx:128-140`, `index.html:20-22`
- **Impacto**: Afecta sensiblemente la métrica LCP (Largest Contentful Paint) en conexiones móviles al competir por ancho de banda contra los archivos CSS y JS críticos.
- **Detalle**: El componente Hero monta las 3 fotos de las sedes (1200px de Unsplash) en el DOM simultáneamente, alternando con `opacity-0`. Las 3 imágenes (~600 KB en total) se descargan de inmediato. Además, falta la etiqueta `<link rel="preconnect" href="https://images.unsplash.com">` en `index.html`.

#### Hallazgo 3.3: Bundle monolítico sin Code-Splitting en los Paneles de Gestión
- **Severidad**: Medio
- **Ubicación**: `src/App.tsx:13-14`
- **Impacto**: Clientes regulares que solo quieren reservar un turno deben descargar y parsear el código completo de las 2.195 líneas de `AdminPanel.tsx` y de `StaffPanel.tsx`.
- **Detalle**: El bundle JS principal compila en **412.69 kB (109.74 kB gzip)**. Aplicar `React.lazy()` y `<Suspense>` a `AdminPanel` y `StaffPanel` reduciría el peso de la landing pública en aproximadamente un 35%.

#### Hallazgo 3.4: Inconsistencias en `manifest.json` y formato SVG en `apple-touch-icon`
- **Severidad**: Bajo
- **Ubicación**: `public/manifest.json:7-8`, `index.html:17`
- **Impacto**: Parpadeo de color oscuro al iniciar la PWA en Android e ícono de pantalla de inicio genérico/borroso en iPhone.
- **Detalle**:
  1. `manifest.json` conserva `background_color: "#09090b"` y `theme_color: "#09090b"`, discrepando con el fondo `#ECE7DE` del diseño actual.
  2. `index.html` enlaza `<link rel="apple-touch-icon" href="/pwa-192.svg" />`. Safari / WebKit en iOS requiere estrictamente archivos `.png` rasterizados y desestima los SVG.

#### Hallazgo 3.5: Bloqueo de zoom en el Viewport (`user-scalable=no`)
- **Severidad**: Bajo / Accesibilidad
- **Ubicación**: `index.html:6`
- **Impacto**: Penaliza la puntuación de Accesibilidad en auditorías automáticas (Lighthouse) e incumple el criterio WCAG 2.1 (Nivel AA, Criterio 1.4.4) al impedir el zoom manual a usuarios con dificultades visuales.
- **Detalle**: `<meta name="viewport" content="... maximum-scale=1.0, user-scalable=no ...">`.

#### Hallazgo 3.6: Teléfonos de contacto de fantasía en botones directos de WhatsApp
- **Severidad**: Bajo / Configuración
- **Ubicación**: `src/data/initialData.ts:52, 62, 72`, `src/components/BookingWizard.tsx:200`
- **Impacto**: Si durante la prueba interactiva el dueño prueba enviar el mensaje de confirmación a WhatsApp, se abrirá un chat hacia números de demostración ficticios (`+54 9 11 4820-1122`, etc.).
- **Detalle**: Conviene advertir al dueño que los números de sede son ficticios o habilitar la posibilidad de configurar su propio teléfono para el test.

---

## 3. Verificación de Compilación y Suites de Pruebas

Se ejecutaron las pruebas locales de compilación y verificación:

- **Build de Producción (`npm run build`)**: 
  - Salida: `✓ built in 1.41s` sin errores.
  - Genera `dist/index.html` (2.09 kB), `dist/assets/index-B8SG8BxM.css` (40.28 kB), `dist/assets/index-KdMVQDdo.js` (412.69 kB).
- **Linter (`npm run lint`)**:
  - Salida: 0 errores y 0 advertencias en 23 archivos analizados con Oxlint.
- **Tests Automatizados (`npm test`)**:
  - Salida: 100% de tests unitarios y E2E aprobados (9 suites completas).
- **Compatibilidad Linux / Vercel**:
  - 100% conforme: Todas las rutas de importación usan barras normales (`/`) y casing idéntico al sistema de archivos.

---

## 4. Recomendación Final

### Veredicto: **APTO CON RESERVAS**

El proyecto exhibe un nivel visual y editorial excelente, un motor de cálculo horario comprobado y una estructura de código limpia. 

Sin embargo, para garantizar una experiencia óptima y sin fricciones técnicas frente al cliente o visitantes en Vercel, **se deben corregir las siguientes 5 reservas prioritarias antes de compartir el enlace**:

1. **Service Worker (`public/sw.js`) — [Crítico]**: Migrar la estrategia de caché de navegación a **Network-First** para que el cliente siempre reciba la versión más reciente del código desplegado en Vercel.
2. **Crash por catálogo vacío (`src/components/ServiceCatalog.tsx`) — [Alto]**: Añadir optional chaining y vista de fallback para evitar que un catálogo sin servicios desmonte la aplicación completa con `TypeError`.
3. **Reseteo de `selectedTimeSlot` (`src/components/BookingWizard.tsx`) — [Alto]**: Limpiar el horario seleccionado si el cliente cambia de servicio o de barbero en el Paso 2, impidiendo agendar turnos fuera de horario o en conflicto.
4. **Validación de solapamiento en `saveAppointment` (`src/services/storageService.ts`) — [Alto]**: Verificar disponibilidad real previa a la persistencia para descartar colisiones si dos personas reservan al mismo tiempo.
5. **Scroll responsivo en los modales de administración (`src/components/AdminPanel.tsx`) — [Medio]**: Agregar `max-h-[90dvh] overflow-y-auto` a los 4 modales del panel de Dueño para que resulten perfectamente utilizables en teléfonos de 375px.
