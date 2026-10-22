# 📋 Plan de Sprints - AI Ticket It
## Trabajo Práctico Individual de Desarrollo con IA — DDS (UTN FRBA)

---

## 📌 1. Resumen Ejecutivo y Objetivos

El presente documento define la planificación iterativa e incremental en **6 Sprints** para el desarrollo de la plataforma **AI Ticket It**, una solución integral para la publicación de eventos y venta de entradas.

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
| :---: | :--- | :--- | :---: |
| **CU-01** | Visualizar mis compras, su estado y días faltantes para el evento (confirmada) | Comprador | **Sprint 3 (Backend) & Sprint 6 (UI)** |
| **CU-02** | Visualizar compras asociadas a un Evento, estado y cupo restante por tipo | Organizador | **Sprint 3 (Backend) & Sprint 6 (UI)** |
| **CU-03** | Búsqueda textual y exploración de eventos por categorías | Comprador | **Sprint 3 (Backend) & Sprint 5 (UI)** |
| **CU-04** | Crear Evento con múltiples tipos de entrada (precio y cupo) | Organizador | **Sprint 3 (Backend) & Sprint 5 (UI)** |
| **CU-05** | Enviar mensajes dentro de una compra (chat) | Comprador | **Sprint 4 (Backend) & Sprint 6 (UI)** |
| **CU-06** | Responder mensajes dentro de una compra (chat) | Organizador | **Sprint 4 (Backend) & Sprint 6 (UI)** |
| **CU-07** | Cancelar compra y obtener reembolso si no puede asistir | Comprador | **Sprint 3 (Backend) & Sprint 6 (UI)** |
| **CU-08** | Regla: cancelar compra si no está UTILIZADA y el evento no se realizó | Organizador / Negocio | **Sprint 3 (Backend) & Sprint 6 (UI)** |
| **CU-09** | Puntuar numéricamente y dejar comentario a un evento cuya entrada fue UTILIZADA | Comprador | **Sprint 4 (Backend) & Sprint 6 (UI)** |
| **CU-10** | Visualizar reseñas anteriores de cada organizador en sus eventos | Comprador | **Sprint 4 (Backend) & Sprints 5 y 6 (UI)** |
| **CU-11** | Ordenar eventos por precio, fecha y puntaje del organizador | Comprador | **Sprint 3 (Backend) & Sprint 5 (UI)** |
| **CU-12** | Realizar compra seleccionando tipo de entrada y cantidad respetando cupo disponible | Comprador | **Sprint 3 (Backend) & Sprint 6 (UI)** |

---

## 🚀 4. Detalle de los Sprints

```
Sprint 1: Base Arquitectónica, Modelos en Memoria & Autenticación Backend (Completado ✅)
    └── Sprint 2: Migración a React Native (Expo) & UI/UX Oficial (Completado ✅)
          └── Sprint 3: Backend Core — Eventos, Catálogo, Compras, Cupos y Estados
                └── Sprint 4: Backend Social — Chat en Compras, Reseñas y Reputación
                      └── Sprint 5: Frontend Mobile — Catálogo, Búsqueda, Filtros y Publicación
                            └── Sprint 6: Frontend Mobile — Compras, Seguimiento, Chat, Reseñas & QA
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

### 🔹 Sprint 3: Backend Core — Eventos, Catálogo, Compras, Cupos y Estados
> **Objetivo:** Implementar la lógica completa de dominio y endpoints REST para la publicación de eventos con entradas segmentadas, búsqueda y filtros de catálogo, y el circuito transaccional de compras con validación estricta de cupos, máquinas de estados y cancelaciones. Cubre **CU-01, CU-02, CU-03, CU-04, CU-07, CU-08, CU-11 y CU-12**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar modelos de dominio:
  - `Categoria` (id, nombre, descripcion).
  - `TipoEntrada` (id, nombre, descripcion, precio, cupoTotal, cupoDisponible, métodos `hayCupoPara(cantidad)`, `decrementarCupo(cantidad)`, `reintegrarCupo(cantidad)`).
  - `Evento` (id, nombre, descripcion, categoriaId, fecha, tiposEntrada, multimedia, organizadorId, métodos `tuPrecioEstaEntre(min, max)`, `precioMinimo()`, `precioMaximo()`, `cupoTotalDisponible()`).
  - `EstadoCompra`: enumerado con estados `PENDIENTE`, `CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`.
  - `Compra` (id, compradorId, eventoId, tipoEntradaId, cantidad, total, estado, fechaCompra, método `actualizarEstado(nuevoEstado)`).
  - `CambioEstadoCompra` (id, compraId, estado, quienId, fechaHora): auditoría de transiciones.
- [ ] Implementar repositorios en memoria (`InMemoryStore`):
  - `CategoriaRepository`: búsqueda, listado y persistencia en `inMemoryStore.categorias`.
  - `EventoRepository`: búsqueda por id, filtrado avanzado por texto, categoría, precio y organizador en `inMemoryStore.eventos`.
  - `CompraRepository`: transacciones seguras de cupos, búsqueda por comprador y evento en `inMemoryStore.compras`.
- [ ] Implementar servicios y controladores con validación Zod:
  - **Categorías & Catálogo:**
    - `GET /api/categorias`: Listado de categorías disponibles.
    - `POST /api/eventos`: Creación de evento (solo rol `ORGANIZADOR`) con tipos de entrada segmentados (**CU-04**).
    - `GET /api/eventos`: Catálogo público con búsqueda textual (`?q=...`), filtro por categoría (`?categoria=...`), rango de precio y ordenamiento (`?sortBy=precio|fecha|puntaje&order=asc|desc`) (**CU-03, CU-11**).
    - `GET /api/eventos/:id`: Detalle completo del evento, tipos de entrada disponibles con cupos y datos del organizador (**CU-10**).
    - `GET /api/organizadores/:id/eventos`: Eventos propios creados por el organizador autenticado.
  - **Circuito Transaccional de Compras:**
    - `POST /api/compras`: Adquisición de entradas con validación estricta de cupos (`hayCupoPara`), decremento atómico y confirmación inmediata (**CU-12**).
    - `GET /api/compras/mis-compras`: Historial de compras del comprador logueado con cálculo dinámico de `diasFaltantes` hasta la fecha del evento para entradas confirmadas (**CU-01**).
    - `GET /api/eventos/:id/compras`: Compras de un evento (solo organizador dueño) con estados y cupos restantes (**CU-02**).
    - `POST /api/compras/:id/cancelar`: Cancelación y reembolso de compra si no está `UTILIZADA` y el evento no se realizó, con reintegro automático del cupo disponible (**CU-07, CU-08**).
    - `PATCH /api/compras/:id/utilizar`: Marcar entrada como `UTILIZADA` por el organizador.
- [ ] Seeds de prueba y Pruebas Automatizadas:
  - Cargar eventos y categorías semilla realistas con imágenes y tipos de entrada.
  - Tests unitarios de dominio (`Evento.test.js`, `TipoEntrada.test.js`, `Compra.test.js`).
  - Tests de integración de endpoints (`eventos.test.js`, `compras.test.js`) con Jest y Supertest.

#### 2. Ramas de Trabajo Sugeridas
- `feature/backend-events-catalog`
- `feature/backend-purchases-quota`

#### 3. Criterios de Aceptación (DoD)
- El organizador puede publicar eventos con múltiples tipos de entrada.
- El comprador puede explorar, buscar, filtrar y comprar entradas sin superar el cupo disponible.
- Las cancelaciones de compra reintegran automáticamente el cupo disponible.
- El cálculo de días faltantes es preciso en compras confirmadas.
- 100% de los tests del Sprint 3 aprobados.

---

### 🔹 Sprint 4: Backend Social — Chat en Compras, Reseñas y Reputación
> **Objetivo:** Completar el 100% de la API Backend implementando el canal de mensajería interna dentro de cada compra, el sistema de calificaciones post-evento y el cálculo dinámico de reputación del organizador. Cubre **CU-05, CU-06, CU-09 y CU-10**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar modelos de dominio:
  - `Mensaje` (id, compraId, usuarioId, mensaje, fechaEnvio).
  - `Resenia` (id, compradorId, eventoId, organizadorId, detalle, puntuacion [1.0 a 5.0], fecha).
- [ ] Implementar repositorios en memoria (`InMemoryStore`):
  - `MensajeRepository`: persistencia y consulta cronológica en `inMemoryStore.mensajes`.
  - `ReseniaRepository`: consulta por evento, por organizador y cálculo de promedio en `inMemoryStore.resenias`.
- [ ] Implementar servicios y controladores con validación Zod:
  - **Chat de Compra:**
    - `GET /api/compras/:id/mensajes`: Historial de mensajes entre comprador y organizador.
    - `POST /api/compras/:id/mensajes`: Enviar mensaje validando que solo el comprador titular o el organizador del evento puedan participar (**CU-05, CU-06**).
  - **Reseñas y Reputación:**
    - `POST /api/eventos/:id/resenias`: Crear reseña validando que el usuario tenga una compra en estado `UTILIZADA` para dicho evento (**CU-09**).
    - `GET /api/organizadores/:id/resenias`: Historial de opiniones y cálculo del promedio de reputación histórica (**CU-10**).
    - Integrar reputación en `GET /api/eventos/:id` y `GET /api/eventos` para ordenamiento por puntaje.
- [ ] Seeds y Pruebas Automatizadas:
  - Cargar mensajes y reseñas iniciales en los datos semilla.
  - Tests unitarios y de integración (`chat.test.js`, `resenias.test.js`).

#### 2. Ramas de Trabajo Sugeridas
- `feature/backend-chat-messaging`
- `feature/backend-reviews-reputation`

#### 3. Criterios de Aceptación (DoD)
- Comprador y organizador pueden intercambiar mensajes dentro de una compra.
- Solo compras en estado `UTILIZADA` permiten emitir calificaciones y comentarios.
- El promedio de reputación del organizador se calcula y refleja correctamente en el catálogo.
- La API backend queda 100% terminada y cubierta por pruebas.

---

### 🔹 Sprint 5: Frontend Mobile — Catálogo, Búsqueda, Filtros y Publicación
> **Objetivo:** Desarrollar en React Native (Expo) las pantallas de exploración de eventos, filtros interactivos, visualización de detalles con carrusel multimedia y el formulario de publicación para organizadores. Cubre **CU-03, CU-04, CU-10 y CU-11**.

#### 1. Frontend Nativo (`packages/frontend`)
- [ ] Componente `EventCard` nativo:
  - Imagen de portada, fecha formateada, badge de categoría, precio "desde $X", cupos disponibles y estrella de reputación.
- [ ] Pantalla `ExploreScreen` (Comprador):
  - Barra de búsqueda de texto en tiempo real (**CU-03**).
  - Selector horizontal deslizable de categorías (`CategoryPills`) (**CU-03**).
  - Modal de ordenamiento (`SortModal`) por precio (asc/desc), fecha y puntaje (**CU-11**).
  - Lista de eventos optimizada (`FlatList`) con pull-to-refresh y estado vacío (*empty state*).
- [ ] Pantalla `EventDetailScreen`:
  - Galería/carrusel de imágenes multimedia del evento.
  - Título, fecha, ubicación, categoría y descripción extendida.
  - Desglose visual de tipos de entrada con precios y cupos disponibles.
  - Sección del Organizador con insignia verificada y puntaje histórico (**CU-10**).
  - Botón flotante/fijo *"Comprar Entradas"*.
- [ ] Pantalla `CreateEventScreen` (Organizador):
  - Formulario nativo con título, categoría, fecha, descripción y URLs de imágenes.
  - Constructor dinámico de tipos de entrada: agregar/quitar niveles (General, VIP, etc.) definiendo nombre, precio y cupo inicial (**CU-04**).
  - Validación de campos y retroalimentación visual de éxito.
- [ ] Pantalla `MyEventsScreen` (Organizador):
  - Listado de eventos creados por el organizador con acceso rápido a creación y detalle.

#### 2. Ramas de Trabajo Sugeridas
- `feature/ui-catalog-search-filters`
- `feature/ui-event-detail-create`

#### 3. Criterios de Aceptación (DoD)
- El comprador puede explorar el catálogo, buscar por texto, filtrar por categoría y ordenar eventos.
- El organizador puede publicar nuevos eventos con múltiples tipos de entrada desde la app móvil.

---

### 🔹 Sprint 6: Frontend Mobile — Compras, Seguimiento, Chat, Reseñas & QA
> **Objetivo:** Completar el flujo transaccional móvil (modal de compra, panel de mis compras con cálculo de días faltantes, panel de organizador), el canal de chat interactivo, el modal de calificaciones y las pruebas finales de entrega. Cubre **CU-01, CU-02, CU-05, CU-06, CU-07, CU-08, CU-09, CU-10 y CU-12**.

#### 1. Frontend Nativo (`packages/frontend`)
- [ ] Modal de Compra en `EventDetailScreen`:
  - Selector de tipo de entrada, control numérico de cantidad y cálculo del total en tiempo real.
  - Validación inmediata de cupo disponible y confirmación de compra (**CU-12**).
- [ ] Pantalla `MyPurchasesScreen` (Comprador):
  - Listado de compras agrupadas por estado (`CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`).
  - Badge destacado para compras confirmadas: *"Faltan X días para el evento"* (**CU-01**).
  - Botón de cancelación de compra y solicitud de reembolso si cumple las condiciones (**CU-07, CU-08**).
  - Acceso directo al chat de la compra y al modal de calificación.
- [ ] Pantalla `OrganizerDashboardScreen` (Organizador):
  - Métricas de ventas y cupos vendidos vs disponibles por tipo de entrada (**CU-02**).
  - Lista de compradores y botón para validar / marcar entrada como `UTILIZADA`.
- [ ] Pantalla de Chat de Compra (`ChatScreen`):
  - Interfaz de mensajería interactiva entre comprador y organizador (**CU-05, CU-06**).
- [ ] Modal de Calificación (`ReviewModal`):
  - Puntuación con estrellas (1 a 5) y comentario escrito, habilitado exclusivamente para compras `UTILIZADA` (**CU-09**).
- [ ] Hardening, QA Multiplataforma y Cierre:
  - Pruebas de integración punta a punta en Expo Web y Expo Go.
  - Verificación final de la guía de entrega (video técnico de 5 a 10 minutos y conclusiones de uso de IA).

#### 2. Ramas de Trabajo Sugeridas
- `feature/ui-purchases-dashboard`
- `feature/ui-chat-reviews`
- `feature/qa-hardening-final`

#### 3. Criterios de Aceptación (DoD)
- Flujo completo de compra, cancelación y uso de entradas funcional en la UI móvil.
- Chat y reseñas funcionando en tiempo real integrados con el backend.
- Aplicación completa y lista para la demostración técnica en video.

---

## 📅 5. Cronograma y Distribución Temporal

| Sprint | Enfoque Principal | Hito Entregable | Estado |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Base Arquitectónica, In-Memory Store & Auth JWT | Backend base, JWT y persistencia testeada | **Completado ✅** |
| **Sprint 2** | Setup React Native (Expo) & UI/UX Oficial Cátedra | App nativa con logo, paleta oficial y pantallas de Auth | **Completado ✅** |
| **Sprint 3** | Backend Core: Eventos, Catálogo y Compras/Cupos | API completa de eventos, transacciones de compra y cupos | **En Curso ⏳** |
| **Sprint 4** | Backend Social: Chat en Compras, Reseñas y Reputación | API de chat, calificaciones y reputación histórica | Pendiente |
| **Sprint 5** | Frontend Mobile: Catálogo, Filtros y Publicación de Eventos | Pantallas de exploración, detalle y creador de eventos | Pendiente |
| **Sprint 6** | Frontend Mobile: Compras, Días Faltantes, Chat, Reseñas & QA | App móvil 100% funcional y lista para presentación | Pendiente |

---


## 🛠️ 6. Metodología de Desarrollo con IA

Siguiendo las pautas pedagógicas del trabajo práctico, se registrará el uso de herramientas de Inteligencia Artificial para la posterior reflexión crítica en la entrega:
1. **Modelado y Arquitectura:** Asistencia en la definición de contratos de API REST, estructuras en memoria y validaciones de negocio.
2. **Generación de Código:** Aceleración en boilerplate de controladores Express, hooks de React Native y estilos visuales oficiales.
3. **Depuración y Casos de Borde:** Consulta de resolución para concurrencia en memoria, control de estados inválidos y adaptación multiplataforma Expo.
4. **Bitácora de IA:** Anotación de aciertos (ganancia de tiempo, diseño limpio) y fricciones (adaptaciones de librerías, dependencias nativas) para la conclusión final.
