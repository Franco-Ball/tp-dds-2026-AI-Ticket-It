# 📋 Plan de Sprints - AI Ticket It
## Trabajo Práctico Individual de Desarrollo con IA — DDS (UTN FRBA)

---

## 📌 1. Resumen Ejecutivo y Objetivos

El presente documento define la planificación iterativa e incremental en **4 Sprints** para el desarrollo de la plataforma **AI Ticket It**, una solución integral para la publicación de eventos y venta de entradas.

El plan cubre el 100% de los requerimientos técnicos y casos de uso especificados en la consigna de la cátedra:
- **Backend:** Node.js + Express (ES Modules) con persistencia en memoria y arquitectura en capas.
- **Frontend:** React (SPA) con enfoque de diseño *Mobile-First* (contenedor responsivo optimizado para simulación en dispositivos móviles).
- **Seguridad y Sesión:** Autenticación completa basada en JWT con soporte para perfiles diferenciados (**Comprador** y **Organizador**).
- **Flujo de Trabajo:** Apego estricto al estándar de ramas y convenciones definido en [GIT_FLOW.md](file:///Users/francoball/Estudio/UTN/3año/DDS/TP-Individual/tp-dds-2026-AI-Ticket-It/docs/GIT_FLOW.md).

---

## 🏗️ 2. Arquitectura y Decisiones de Diseño

### 2.1 Módulo Backend (`packages/backend`)
- **Estructura en capas:**
  - `models/`: Clases de dominio puras (`Usuario`, `Evento`, `TipoEntrada`, `Compra`, `CambioEstadoCompra`, `Mensaje`, `Resenia`, `Categoria`).
  - `repositories/`: Capa de acceso a datos en memoria (`InMemoryStore`) con colecciones indexadas e inicialización con datos semilla (*seed data*).
  - `services/`: Lógica de negocio (validación de cupos, transiciones de estado, cálculo de días y promedios de calificación).
  - `controllers/`: Manejadores de solicitudes HTTP, parseo de parámetros y formateo de respuestas JSON.
  - `middlewares/`: Autenticación JWT, verificación de roles y manejo centralizado de errores.
  - `routes/`: Definición de endpoints organizados por recurso.

### 2.2 Módulo Frontend (`packages/frontend`)
- **Diseño Mobile-First:** Contenedor central simulando interfaz móvil (`max-width: 480px`, centrado, sombra y soporte responsivo completo).
- **Gestión de Estado:** React Context API para Autenticación (`AuthContext`) y notificaciones/alertas (`ToastContext`).
- **Navegación:** Enrutamiento cliente (React Router DOM o switch navigation por vistas) con barra de navegación inferior (*Bottom Navigation Bar*).
- **Consumo de API:** Capa de servicios modulares (`api/auth.js`, `api/events.js`, `api/purchases.js`, `api/reviews.js`) con interceptores para inyección del token JWT.

---

## 🗺️ 3. Matriz de Trazabilidad: Casos de Uso vs. Sprints

| # | Caso de Uso de la Consigna | Rol | Sprint Asignado |
| :---: | :--- | :---: | :---: |
| **CU-01** | Visualizar mis compras, su estado y días faltantes para el evento (confirmada) | Comprador | **Sprint 3** |
| **CU-02** | Visualizar compras asociadas a un Evento, estado y cupo restante por tipo | Organizador | **Sprint 3** |
| **CU-03** | Búsqueda textual y exploración de eventos por categorías | Comprador | **Sprint 2** |
| **CU-04** | Crear Evento con múltiples tipos de entrada (precio y cupo) | Organizador | **Sprint 2** |
| **CU-05** | Enviar mensajes dentro de una compra (chat) | Comprador | **Sprint 4** |
| **CU-06** | Responder mensajes dentro de una compra (chat) | Organizador | **Sprint 4** |
| **CU-07** | Cancelar compra y obtener reembolso si no puede asistir | Comprador | **Sprint 3** |
| **CU-08** | Regla: cancelar compra si no está UTILIZADA y el evento no se realizó | Organizador / Negocio | **Sprint 3** |
| **CU-09** | Puntuar numéricamente y dejar comentario a un evento cuya entrada fue UTILIZADA | Comprador | **Sprint 4** |
| **CU-10** | Visualizar reseñas anteriores de cada organizador en sus eventos | Comprador | **Sprint 2 & 4** |
| **CU-11** | Ordenar eventos por precio, fecha y puntaje del organizador | Comprador | **Sprint 2** |
| **CU-12** | Realizar compra seleccionando tipo de entrada y cantidad respetando cupo disponible | Comprador | **Sprint 3** |

---

## 🚀 4. Detalle de los Sprints

```
Sprint 1: Base Arquitectónica, Modelos en Memoria & Autenticación
    └── Sprint 2: Gestión de Eventos, Búsqueda, Filtros & Catálogo
          └── Sprint 3: Flujo de Compras, Control de Cupos & Estados
                └── Sprint 4: Chat de Compra, Reseñas, Reputación & Cierre
```

---

### 🔹 Sprint 1: Base Arquitectónica, Modelos en Memoria & Autenticación
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

#### 2. Frontend (`packages/frontend`)
- [x] Instalar dependencias necesarias (`react-router-dom`, iconos, utilitarios de fecha).
- [x] Crear estructura base de diseño **Mobile-First** (contenedor con marco simulado para mobile, barra de estado superior).
- [x] Implementar `AuthContext` y `useAuth`: almacenamiento de token y usuario en `localStorage`, manejo de login, registro y logout.
- [x] Vistas de Frontend:
  - `LoginView`: Formulario con opción de alternar entre credenciales rápidas de prueba.
  - `RegisterView`: Formulario con selector de rol (*Comprador* / *Organizador*).
  - Barra de navegación inferior (*Bottom Bar*) dinámica según el rol del usuario autenticado.

#### 3. Ramas de Trabajo Sugeridas
- `feature/backend-architecture-store`
- `feature/auth-jwt-backend`
- `feature/auth-ui-mobile-layout`

#### 4. Criterios de Aceptación (DoD)
- Un usuario puede registrarse e iniciar sesión como Comprador u Organizador.
- Las rutas protegidas del backend rechazan solicitudes no autenticadas con código 401/403.
- La interfaz visual móvil se adapta limpiamente en pantalla.

---

### 🔹 Sprint 2: Gestión de Eventos, Búsqueda, Filtros & Catálogo
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

#### 2. Frontend (`packages/frontend`)
- [ ] Componente `EventCard` con información de fecha, categoría, precio desde, cupos y puntaje del organizador.
- [ ] Vista `ExploreView` (Comprador):
  - Barra de búsqueda de texto en tiempo real (**CU-03**).
  - Selector deslizante horizontal de categorías (**CU-03**).
  - Modal o menú desplegable de ordenamiento (precio ascendente/descendente, fecha más próxima, reputación del organizador) (**CU-11**).
- [ ] Vista `EventDetailView`:
  - Carrousel de imágenes multimedia.
  - Descripción, fecha y horario.
  - Desglose de tipos de entrada con precios y disponibilidad en tiempo real.
  - Sección de información del Organizador y su puntaje histórico.
- [ ] Vista `CreateEventView` (Organizador):
  - Formulario reactivo para título, descripción, fecha, categoría e imágenes.
  - Componente dinámico para agregar múltiples tipos de entrada (ej: *General*, *Platea*, *VIP*) indicando precio y cupo para cada uno (**CU-04**).

#### 3. Ramas de Trabajo Sugeridas
- `feature/events-domain-endpoints`
- `feature/catalog-search-filters`
- `feature/create-event-organizer-ui`

#### 4. Criterios de Aceptación (DoD)
- El organizador puede publicar un evento con al menos dos tipos de entrada distintos.
- El comprador puede encontrar eventos buscando por palabras clave y filtrando por categorías.
- El ordenamiento por precio, fecha y puntaje altera correctamente la lista visual.

---

### 🔹 Sprint 3: Flujo de Compras, Control de Cupos & Estados
> **Objetivo:** Implementar la adquisición de entradas, validación estricta de cupos, máquinas de estados de compra y panel de seguimiento para compradores y organizadores. Cubre **CU-01, CU-02, CU-07, CU-08 y CU-12**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar enumerado y modelos:
  - `EstadoCompra`: `PENDIENTE`, `CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`.
  - `Compra` (id, compradorId, eventoId, tipoEntradaId, cantidad, total, estado, fechaCompra, método `actualizarEstado(nuevoEstado)`).
  - `CambioEstadoCompra` (id, compraId, estado, quienId, fechaHora): historial de auditoría de transiciones.
- [ ] Endpoints de Compras:
  - `POST /api/compras`: Realizar compra (**CU-12**):
    - Validar disponibilidad: `tipoEntrada.hayCupoPara(cantidad)`.
    - Decrementar cupo disponible y registrar compra en estado `CONFIRMADA` (o `PENDIENTE` según flujo).
  - `GET /api/compras/mis-compras`: Compras del comprador logueado (**CU-01**):
    - Incluir cálculo dinámico de `diasFaltantes` hasta la fecha del evento para compras en estado `CONFIRMADA`.
  - `GET /api/eventos/:id/compras`: Compras del evento (solo organizador dueño) con estados y cupos restantes por tipo de entrada (**CU-02**).
  - `POST /api/compras/:id/cancelar`: Cancelación y reembolso de compra (**CU-07**, **CU-08**):
    - Regla de negocio: Permitido solo si el estado **no es** `UTILIZADA` y la fecha del evento aún **no ha pasado**.
    - Transición a estado `REEMBOLSADA` / `CANCELADA` y restauración automática del cupo en el `TipoEntrada`.
  - `PATCH /api/compras/:id/utilizar`: Endpoint para marcar entrada como `UTILIZADA` (simulando acreditación al ingresar al evento).

#### 2. Frontend (`packages/frontend`)
- [ ] Modal / Flujo de Compra en `EventDetailView`:
  - Selector de tipo de entrada con indicador de cupo máximo.
  - Contador de cantidad deseada con validación instantánea para no exceder cupo (**CU-12**).
  - Resumen de compra (subtotal, total) y botón de confirmación.
- [ ] Vista `MyPurchasesView` (Comprador) (**CU-01**):
  - Tarjetas de compras agrupadas o etiquetadas por estado (`CONFIRMADA`, `PENDIENTE`, `UTILIZADA`, `REEMBOLSADA`, `CANCELADA`) con chips de colores distintivos.
  - Badge destacado para compras confirmadas: *"Faltan X días para el evento"*.
  - Botón *"Cancelar compra y solicitar reembolso"* con confirmación modal y deshabilitado si ya fue utilizada o expiró (**CU-07**, **CU-08**).
- [ ] Vista `OrganizerDashboardView` (Organizador) (**CU-02**):
  - Vista general de eventos del organizador.
  - Detalle por evento: barras de progreso de cupos vendidos vs. disponibles por cada tipo de entrada.
  - Tabla / Lista de compradores y estados de sus entradas.
  - Botón de acción para simular uso de entrada (*"Marcar como Utilizada"*).

#### 3. Ramas de Trabajo Sugeridas
- `feature/purchase-logic-concurrency-store`
- `feature/buyer-purchases-tracking-ui`
- `feature/organizer-event-purchases-ui`

#### 4. Criterios de Aceptación (DoD)
- No es posible comprar más entradas que las disponibles en el cupo.
- Las compras canceladas reintegran el cupo al evento de forma inmediata en memoria.
- El cálculo de días faltantes es preciso y las compras utilizadas no permiten cancelación.

---

### 🔹 Sprint 4: Chat de Compra, Reseñas, Reputación & Cierre
> **Objetivo:** Añadir el canal de mensajería dentro de cada compra, el sistema de calificaciones y comentarios post-evento, el cálculo de reputación del organizador y pruebas integrales. Cubre **CU-05, CU-06, CU-09 y CU-10**.

#### 1. Backend (`packages/backend`)
- [ ] Implementar modelos:
  - `Mensaje` (id, compraId, usuarioId, mensaje, enviado).
  - `Resenia` (id, compradorId, eventoId, detalle, puntuacion [1.0 a 5.0], fecha).
- [ ] Endpoints de Chat en Compras:
  - `GET /api/compras/:id/mensajes`: Historial de mensajes de una compra (accesible solo por el comprador o el organizador del evento).
  - `POST /api/compras/:id/mensajes`: Enviar mensaje (**CU-05**, **CU-06**).
- [ ] Endpoints de Reseñas:
  - `POST /api/eventos/:id/resenias`: Crear reseña (**CU-09**):
    - Regla de validación: El usuario debe tener una compra asociada en estado `UTILIZADA` para este evento.
  - `GET /api/organizadores/:id/resenias`: Obtener todas las reseñas históricas del organizador con cálculo de promedio de reputación (**CU-10**).

#### 2. Frontend (`packages/frontend`)
- [ ] Componente `PurchaseChatModal` / `ChatView`:
  - Vista de conversación tipo mensajería móvil dentro del detalle de una compra.
  - Globos de chat diferenciados entre Comprador y Organizador con fecha y hora.
  - Campo de entrada de texto con envío instantáneo.
- [ ] Modal de Calificación y Reseña (`ReviewModal`):
  - Habilitado automáticamente en `MyPurchasesView` al detectar una compra en estado `UTILIZADA` (**CU-09**).
  - Selector de estrellas (1 a 5) y área de texto para el comentario.
- [ ] Sección de Reputación en `EventDetailView`:
  - Visualización del promedio de estrellas del organizador y lista de comentarios de eventos previos (**CU-10**).
- [ ] Pulido integral de estilos, navegación fluida, toasts de confirmación y carga de datos semilla completos para demostración técnica.

#### 3. Ramas de Trabajo Sugeridas
- `feature/chat-purchases`
- `feature/reviews-reputation-system`
- `feature/hardening-polish-seeds`

#### 4. Criterios de Aceptación (DoD)
- Comprador y organizador pueden intercambiar mensajes dentro de la compra.
- Solo las compras con estado `UTILIZADA` permiten puntuar y comentar.
- Las reseñas alimentan el promedio de puntaje del organizador visible en el catálogo.

---

## 📅 5. Cronograma y Distribución Temporal Sugerida

| Sprint | Enfoque Principal | Hito Entregable |
| :---: | :--- | :--- |
| **Sprint 1** | Setup, In-Memory Store, Modelos Core & Auth JWT | Login/Registro operativo y navegación mobile base |
| **Sprint 2** | Eventos, Categorías, Búsqueda y Filtros de Catálogo | Publicación y exploración de eventos funcional |
| **Sprint 3** | Compras, Cupos, Estados y Cancelaciones/Reembolsos | Flujo transaccional completo y control de cupos |
| **Sprint 4** | Chat en compras, Calificaciones, Reputación y QA | Aplicación lista para presentación técnica |

---

## 🛠️ 6. Metodología de Desarrollo con IA

Siguiendo las pautas pedagógicas del trabajo práctico, se registrará el uso de herramientas de Inteligencia Artificial para la posterior reflexión crítica en la entrega:
1. **Modelado y Arquitectura:** Asistencia en la definición de contratos de API REST, estructuras en memoria y validaciones de negocio.
2. **Generación de Código:** Aceleración en boilerplate de controladores Express, hooks de React y estilos CSS mobile-first.
3. **Depuración y Casos de Borde:** Consulta de resolución para concurrencia en memoria, control de estados inválidos y ordenamientos combinados.
4. **Bitácora de IA:** Anotación de aciertos (ganancia de tiempo, diseño limpio) y fricciones (alucinaciones de dependencias, adaptaciones de código) para la conclusión final.
