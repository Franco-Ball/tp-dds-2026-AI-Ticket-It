# 📋 Plan de Sprints - AI Ticket It
## Trabajo Práctico Individual de Desarrollo con IA — DDS (UTN FRBA)

---

## 📌 1. Resumen Ejecutivo y Objetivos

El presente documento define la planificación iterativa e incremental en **5 Sprints** para el desarrollo de la plataforma **AI Ticket It**, una solución integral para la publicación de eventos y venta de entradas.

El plan cubre el 100% de los requerimientos técnicos y casos de uso especificados en la consigna de la cátedra:
- **Backend:** Node.js + Express (ES Modules) con persistencia en memoria y arquitectura en capas.
- **Frontend:** React Native (Expo) con soporte para ejecución nativa en dispositivos móviles (Expo Go / Emulador) y web, bajo un sistema de diseño visual pulido (*Clean & Bright*) basado en la identidad gráfica oficial de la cátedra.
- **Seguridad y Sesión:** Autenticación completa basada en JWT con soporte para perfiles diferenciados (**Comprador** y **Organizador**).
- **Flujo de Trabajo:** Apego estricto al estándar de ramas y convenciones definido en [GIT_FLOW.md](file:///Users/francoball/Estudio/UTN/3año/DDS/TP-Individual/tp-dds-2026-AI-Ticket-It/docs/GIT_FLOW.md).

---

## 🏗️ 2. Arquitectura y Decisiones de Diseño

### 2.1 Módulo Backend (`packages/backend`)
- **Estructura en capas:**
  - `models/`: Clases de dominio puras (`Usuario`, `Evento`, `TipoEntrada`, `Compra`, `CambioEstadoCompra`, `Mensaje`, `Resenia`, `Categoria`).
  - `repositories/`: Capa de acceso a datos en memoria (`InMemoryStore`) con colecciones indexadas e inicialización con datos semilla (*seed data*).
  - `services/`: Lógica de negocio (validación de cupos, transiciones de estado, cálculo de días y promedios de calificación).
  - `controllers/`: Manejadores de solicitudes HTTP, validación con esquemas Zod y formateo de respuestas JSON.
  - `middlewares/`: Autenticación JWT, verificación de roles (`requireRole`) y manejo centralizado de errores.
  - `routes/`: Definición de endpoints organizados por recurso.

### 2.2 Módulo Frontend (`packages/frontend`)
- **Tecnología Nativa Mobile:** React Native con Expo para ejecución nativa en iOS, Android y navegador web.
- **Sistema de Diseño Oficial:** Identidad *Clean & Bright* con fondo blanco/gris sutil (`#f8fafc`), contrastes profundos (`#111827`) y el verde vibrante de la cátedra (`#55d233` / `#48bb18`), con el isotipo oficial del ticket perforado y slogan *"ENTRADAS A UN CLICK"*.
- **Gestión de Estado:** React Context API para Autenticación (`AuthContext`) con almacenamiento nativo mediante `@react-native-async-storage/async-storage`.
- **Navegación Móvil:** React Navigation (`@react-navigation/native-stack` y `@react-navigation/bottom-tabs`) e iconografía con `@expo/vector-icons`.
- **Consumo de API:** Capa de servicios modulares (`api.js`, `authService.js`, etc.) con inyección automática del token JWT.

---

## 🗺️ 3. Matriz de Trazabilidad: Casos de Uso vs. Sprints

| # | Caso de Uso de la Consigna | Rol | Sprint Asignado |
| :---: | :--- | :---: | :---: |
| **CU-01** | Visualizar mis compras, su estado y días faltantes para el evento (confirmada) | Comprador | **Sprint 4** |
| **CU-02** | Visualizar compras asociadas a un Evento, estado y cupo restante por tipo | Organizador | **Sprint 4** |
| **CU-03** | Búsqueda textual y exploración de eventos por categorías | Comprador | **Sprint 3** |
| **CU-04** | Crear Evento con múltiples tipos de entrada (precio y cupo) | Organizador | **Sprint 3** |
| **CU-05** | Enviar mensajes dentro de una compra (chat) | Comprador | **Sprint 5** |
| **CU-06** | Responder mensajes dentro de una compra (chat) | Organizador | **Sprint 5** |
| **CU-07** | Cancelar compra y obtener reembolso si no puede asistir | Comprador | **Sprint 4** |
| **CU-08** | Regla: cancelar compra si no está UTILIZADA y el evento no se realizó | Organizador / Negocio | **Sprint 4** |
| **CU-09** | Puntuar numéricamente y dejar comentario a un evento cuya entrada fue UTILIZADA | Comprador | **Sprint 5** |
| **CU-10** | Visualizar reseñas anteriores de cada organizador en sus eventos | Comprador | **Sprint 3 & 5** |
| **CU-11** | Ordenar eventos por precio, fecha y puntaje del organizador | Comprador | **Sprint 3** |
| **CU-12** | Realizar compra seleccionando tipo de entrada y cantidad respetando cupo disponible | Comprador | **Sprint 4** |

---

## 🚀 4. Detalle de los Sprints

```
Sprint 1: Base Arquitectónica, Modelos en Memoria & Autenticación Backend (Completado ✅)
    └── Sprint 2: Migración a React Native (Expo) & Sistema de Diseño UX/UI Oficial
          └── Sprint 3: Gestión de Eventos, Búsqueda, Filtros & Catálogo
                └── Sprint 4: Flujo de Compras, Control de Cupos & Estados
                      └── Sprint 5: Chat de Compra, Reseñas, Reputación & Cierre
```

---

### 🔹 Sprint 1: Base Arquitectónica, Modelos en Memoria & Autenticación Backend
> **Objetivo:** Establecer la infraestructura del monorepo, el repositorio en memoria con semillas de prueba, los modelos del diagrama de dominio y el sistema completo de autenticación y autorización por roles.

#### 1. Backend (`packages/backend`)
- [x] Configurar arquitectura de carpetas (`src/models`, `src/repositories`, `src/services`, `src/controllers`, `src/routes`, `src/middlewares`).
- [x] Implementar `InMemoryStore` singleton para almacenar colecciones de usuarios, eventos, compras, mensajes y reseñas.
- [x] Implementar modelo de dominio `Usuario` (id, nombre, apellido, email, passwordHash, rol: `COMPRADOR` | `ORGANIZADOR`, favoritos).
- [x] Implementar sistema de Auth con JWT:
  - `POST /api/auth/register`: Registro de usuario especificando rol.
  - `POST /api/auth/login`: Autenticación con generación de token.
  - `GET /api/auth/me`: Obtención de datos del usuario autenticado.
- [x] Middleware `authMiddleware` para verificar token y `requireRole(['COMPRADOR', 'ORGANIZADOR'])`.
- [x] Cargar datos semilla (*seeds*) con usuarios de prueba (ej: `comprador@demo.com`, `organizador@demo.com`) para pruebas inmediatas.
- [x] Pruebas automatizadas: Suite con 24 tests unitarios y de integración con Jest y Supertest (100% aprobados).

#### 2. Criterios de Aceptación (DoD)
- Un usuario puede registrarse e iniciar sesión como Comprador u Organizador.
- Las rutas protegidas del backend rechazan solicitudes no autenticadas con código 401/403.
- Base de datos en memoria completamente testeada y reproducible.

---

### 🔹 Sprint 2: Migración a React Native (Expo) & Sistema de Diseño UX/UI Oficial
> **Objetivo:** Cumplir al 100% con la consigna técnica migrando el módulo `packages/frontend` a React Native con Expo, aplicando la identidad visual oficial de la cátedra (logo verde de ticket perforado, paleta Clean & Bright, navegación nativa y pantallas de Auth).

#### 1. Setup Técnico de React Native (`packages/frontend`)
- [x] Configurar proyecto Expo compatible con el monorepo y scripts npm (`npm start`, `npm run android`, `npm run ios`, `npm run web`).
- [x] Instalar dependencias nativas:
  - `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`.
  - `@react-native-async-storage/async-storage` para persistencia nativa del token y sesión.
  - `@expo/vector-icons` y soporte para assets de imágenes.
- [x] Configurar capa de red (`services/api.js`) adaptada a dispositivos móviles físicos (soporte para IP local / emulador).

#### 2. Sistema de Diseño UX/UI Oficial
- [x] Incorporar el logo oficial propuesto por la cátedra (`assets/logo_catedra.png`).
- [x] Definir tokens de diseño:
  - Primario: Verde vibrante Ticket It (`#55d233` / `#48bb18`).
  - Fondos: Blanco limpio (`#ffffff`) y gris suave (`#f8fafc`).
  - Textos y contrastes: Carbón oscuro (`#111827`) y gris neutro (`#64748b`).
  - Acentos Comprador (celeste `#0284c7`) y Organizador (ámbar `#f59e0b`).
- [x] Componentes UI nativos reutilizables: `Button`, `Input`, `RoleSelectorCard`, `Badge`, `Card`.

#### 3. Pantallas Nativas
- [x] `LoginScreen`: Formulario nativo con accesos rápidos para `comprador@demo.com` y `organizador@demo.com`.
- [x] `RegisterScreen`: Formulario nativo con selector visual de rol (**Comprador** vs **Organizador**).
- [x] `HomeScreen`: Dashboard con saludo, badge de rol y resumen del sistema.
- [x] `ProfileScreen`: Datos de cuenta, ID y botón nativo para cerrar sesión.
- [x] `BottomTabNavigator`: Barra de navegación nativa inferior que adapta sus pestañas según el rol.

#### 4. Ramas de Trabajo Sugeridas
- `feature/expo-react-native-setup`
- `feature/ux-ui-design-system`
- `feature/rn-auth-screens`

#### 5. Criterios de Aceptación (DoD)
- La aplicación corre en Expo Go y emulador/navegador web.
- El usuario puede registrarse e iniciar sesión de forma fluida y persistente.
- La identidad visual utiliza el logo oficial de la cátedra y su paleta de colores.

---

### 🔹 Sprint 3: Gestión de Eventos, Búsqueda, Filtros & Catálogo
> **Objetivo:** Permitir a los organizadores publicar eventos con entradas segmentadas y a los compradores explorar, filtrar, buscar y ordenar el catálogo. Cubre **CU-03, CU-04, CU-11 y parte de CU-10**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar modelos:
  - `Categoria` (id, nombre, descripcion).
  - `TipoEntrada` (id, nombre, descripcion, precio, cupoTotal, cupoDisponible, método `hayCupoPara(cantidad)`).
  - `Evento` (id, nombre, descripcion, categoriaId, fecha, tiposEntrada, multimedia, organizadorId, método `tuPrecioEstaEntre(min, max)`).
- [ ] Endpoints de Categorías y Eventos:
  - `GET /api/categorias`: Listado de categorías disponibles.
  - `POST /api/eventos`: Creación de evento (solo rol `ORGANIZADOR`), incluyendo tipos de entrada con precio y cupo inicial (**CU-04**).
  - `GET /api/eventos`: Catálogo de eventos con parámetros de consulta:
    - Búsqueda textual por nombre/descripción (`?q=...`) (**CU-03**).
    - Filtro por categoría (`?categoria=...`) (**CU-03**).
    - Ordenamiento (`?sortBy=precio|fecha|puntaje&order=asc|desc`) (**CU-11**).
  - `GET /api/eventos/:id`: Detalle completo del evento, tipos de entrada disponibles, datos del organizador y su puntaje promedio (**CU-10**).
  - `GET /api/organizadores/:id/eventos`: Eventos propios creados por el organizador.

#### 2. Frontend Nativo (`packages/frontend`)
- [ ] Componente `EventCard` nativo con fecha, categoría, precio, cupos y puntaje del organizador.
- [ ] Pantalla `ExploreScreen` (Comprador):
  - Barra de búsqueda de texto nativa (**CU-03**).
  - Selector horizontal deslizable de categorías (**CU-03**).
  - Modal de ordenamiento (precio, fecha, puntaje) (**CU-11**).
- [ ] Pantalla `EventDetailScreen`:
  - Galería/carrusel de imágenes multimedia.
  - Descripción, fecha y desglose de tipos de entrada con cupos disponibles.
  - Sección del Organizador y su puntaje histórico (**CU-10**).
- [ ] Pantalla `CreateEventScreen` (Organizador):
  - Formulario nativo con título, descripción, fecha, categoría e imágenes.
  - Componente dinámico para agregar múltiples tipos de entrada con precio y cupo (**CU-04**).

#### 3. Ramas de Trabajo Sugeridas
- `feature/events-domain-endpoints`
- `feature/catalog-search-filters`
- `feature/create-event-organizer-ui`

#### 4. Criterios de Aceptación (DoD)
- El organizador puede publicar un evento con múltiples tipos de entrada.
- El comprador puede buscar por texto, filtrar por categoría y ordenar el catálogo.

---

### 🔹 Sprint 4: Flujo de Compras, Control de Cupos & Estados
> **Objetivo:** Implementar la adquisición de entradas, validación estricta de cupos, máquinas de estados de compra y panel de seguimiento para compradores y organizadores. Cubre **CU-01, CU-02, CU-07, CU-08 y CU-12**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar enumerado y modelos:
  - `EstadoCompra`: `PENDIENTE`, `CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`.
  - `Compra` (id, compradorId, eventoId, tipoEntradaId, cantidad, total, estado, fechaCompra, método `actualizarEstado(nuevoEstado)`).
  - `CambioEstadoCompra` (id, compraId, estado, quienId, fechaHora): historial de auditoría de transiciones.
- [ ] Endpoints de Compras:
  - `POST /api/compras`: Realizar compra (**CU-12**):
    - Validar disponibilidad: `tipoEntrada.hayCupoPara(cantidad)`.
    - Decrementar cupo disponible y registrar compra en estado `CONFIRMADA`.
  - `GET /api/compras/mis-compras`: Compras del comprador logueado (**CU-01**):
    - Cálculo dinámico de `diasFaltantes` hasta la fecha del evento para compras confirmadas.
  - `GET /api/eventos/:id/compras`: Compras del evento (solo organizador dueño) con estados y cupos restantes (**CU-02**).
  - `POST /api/compras/:id/cancelar`: Cancelación y reembolso de compra (**CU-07**, **CU-08**):
    - Permitido solo si no está `UTILIZADA` y el evento no se realizó. Reintegración automática del cupo.
  - `PATCH /api/compras/:id/utilizar`: Marcar entrada como `UTILIZADA`.

#### 2. Frontend Nativo (`packages/frontend`)
- [ ] Modal de Compra en `EventDetailScreen`:
  - Selector de tipo de entrada, contador de cantidad y validación en tiempo real (**CU-12**).
- [ ] Pantalla `MyPurchasesScreen` (Comprador) (**CU-01**):
  - Tarjetas de compras por estado (`CONFIRMADA`, `UTILIZADA`, `REEMBOLSADA`, `CANCELADA`).
  - Badge destacado: *"Faltan X días para el evento"*.
  - Botón *"Cancelar compra y solicitar reembolso"* (**CU-07**, **CU-08**).
- [ ] Pantalla `OrganizerDashboardScreen` (Organizador) (**CU-02**):
  - Seguimiento de cupos vendidos vs disponibles por tipo de entrada.
  - Lista de compradores y botón para marcar entrada como `UTILIZADA`.

#### 3. Ramas de Trabajo Sugeridas
- `feature/purchase-logic-concurrency-store`
- `feature/buyer-purchases-tracking-ui`
- `feature/organizer-event-purchases-ui`

#### 4. Criterios de Aceptación (DoD)
- No es posible sobrepasar el cupo disponible.
- Las cancelaciones restauran el cupo disponible automáticamente.
- El cálculo de días faltantes es preciso y la UI responde al instante.

---

### 🔹 Sprint 5: Chat de Compra, Reseñas, Reputación & Cierre
> **Objetivo:** Añadir el canal de mensajería dentro de cada compra, el sistema de calificaciones y comentarios post-evento, el cálculo de reputación del organizador y pruebas integrales. Cubre **CU-05, CU-06, CU-09 y CU-10**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar modelos:
  - `Mensaje` (id, compraId, usuarioId, mensaje, enviado).
  - `Resenia` (id, compradorId, eventoId, detalle, puntuacion [1.0 a 5.0], fecha).
- [ ] Endpoints de Chat en Compras:
  - `GET /api/compras/:id/mensajes`: Historial de mensajes de una compra.
  - `POST /api/compras/:id/mensajes`: Enviar mensaje (**CU-05**, **CU-06**).
- [ ] Endpoints de Reseñas:
  - `POST /api/eventos/:id/resenias`: Crear reseña solo para compras `UTILIZADA` (**CU-09**).
  - `GET /api/organizadores/:id/resenias`: Historial de reseñas y promedio de reputación (**CU-10**).

#### 2. Frontend Nativo (`packages/frontend`)
- [ ] Pantalla de Chat dentro de la Compra (`ChatScreen`):
  - Mensajería interactiva entre comprador y organizador (**CU-05**, **CU-06**).
- [ ] Modal de Calificación (`ReviewModal`):
  - Estrellas (1 a 5) y comentario habilitado solo tras usar la entrada (**CU-09**).
- [ ] Visualización de Reputación en Detalle del Evento (**CU-10**).
- [ ] Pulido final, carga de datos semilla completos y preparación para entrega.

#### 3. Ramas de Trabajo Sugeridas
- `feature/chat-purchases`
- `feature/reviews-reputation-system`
- `feature/hardening-polish-seeds`

#### 4. Criterios de Aceptación (DoD)
- Comprador y organizador pueden intercambiar mensajes en la compra.
- Solo entradas `UTILIZADA` permiten reseñar.
- Aplicación completa lista para la grabación de la entrega técnica.

---

## 📅 5. Cronograma y Distribución Temporal

| Sprint | Enfoque Principal | Hito Entregable | Estado |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Setup, In-Memory Store, Modelos Core & Auth JWT | Backend completo, JWT y persistencia testeada | **Completado ✅** |
| **Sprint 2** | Migración a React Native (Expo) & UI/UX Oficial | App nativa con logo y colores oficiales de la cátedra | **Completado ✅** |
| **Sprint 3** | Eventos, Categorías, Búsqueda y Filtros de Catálogo | Publicación y exploración de eventos funcional | Pendiente |
| **Sprint 4** | Compras, Cupos, Estados y Cancelaciones/Reembolsos | Flujo transaccional completo y control de cupos | Pendiente |
| **Sprint 5** | Chat en compras, Calificaciones, Reputación y QA | Aplicación lista para presentación técnica | Pendiente |

---

## 🛠️ 6. Metodología de Desarrollo con IA

Siguiendo las pautas pedagógicas del trabajo práctico, se registrará el uso de herramientas de Inteligencia Artificial para la posterior reflexión crítica en la entrega:
1. **Modelado y Arquitectura:** Asistencia en la definición de contratos de API REST, estructuras en memoria y validaciones de negocio.
2. **Generación de Código:** Aceleración en boilerplate de controladores Express, hooks de React Native y estilos visuales oficiales.
3. **Depuración y Casos de Borde:** Consulta de resolución para concurrencia en memoria, control de estados inválidos y adaptación multiplataforma Expo.
4. **Bitácora de IA:** Anotación de aciertos (ganancia de tiempo, diseño limpio) y fricciones (adaptaciones de librerías, dependencias nativas) para la conclusión final.
