# 🎟️ AI Ticket It — Plataforma de Venta de Entradas y Gestión de Espectáculos

> **Trabajo Práctico Individual de Desarrollo con Inteligencia Artificial**  
> **Cátedra:** Desarrollo de Software (DDS) — **UTN FRBA** (2C 2026)  
> **Alumno:** Franco Ballistreri  
> **Estado:** 100% Finalizado y Verificado ✅

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_51-blue.svg)](https://reactnative.dev/)
[![Jest Tests](https://img.shields.io/badge/Jest_Tests-109%20passed-brightgreen.svg)](packages/backend/test)
[![Playwright E2E](https://img.shields.io/badge/Playwright_E2E-14%20passed-brightgreen.svg)](e2e)
[![ESLint](https://img.shields.io/badge/ESLint-0%20warnings-brightgreen.svg)](eslint.config.mjs)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%26%20DDD-orange.svg)](docs/DECISIONES_DE_DISENO.md)

---

## 📖 1. Descripción del Proyecto

**AI Ticket It** es una plataforma integral para la publicación, búsqueda, compra y gestión de entradas para espectáculos y eventos en vivo. El sistema permite a los **Compradores** explorar un catálogo dinámico con filtros y debounce, reservar cupos de manera preventiva con retención temporal de 15 minutos, realizar pagos simulados, chatear directamente sobre cada compra y calificar la experiencia una vez utilizada su entrada en puerta. A su vez, brinda a los **Organizadores** un panel de control con métricas en tiempo real de recaudación y ocupación por sector, gestión de asistentes, validación de acceso en puerta (check-in) y respuesta de consultas vía chat.

El proyecto fue construido como un **monorepo modular** aplicando **Clean Architecture**, **Domain-Driven Design (DDD)**, persistencia en memoria pura (`InMemoryStore`) y una interfaz móvil nativa desarrollada con **React Native (Expo)** cumpliendo con las directrices de UX, accesibilidad WCAG y manejo de estados enseñadas en la cátedra.

---

## 🎬 2. Video de Demostración Técnica (Demo Cátedra)

Según las pautas de entrega de la cátedra, se preparó una demostración técnica en video de entre 5 y 10 minutos recorriendo la arquitectura de Backend, Frontend, la ejecución de la app en vivo y la conclusión metodológica sobre el uso de IA:

* 🎥 **Enlace al Video:** [Ver Demostración Técnica en Video (YouTube / Drive)](#) *(Completar con enlace al grabar)*
* 📜 **Guión y Estructura del Video:** Consultar la [Guía y Guión de Demostración Técnica](docs/GUIA_DEMO_VIDEO.md).

---

## 🏛️ 3. Arquitectura y Tecnologías

### 🔹 Backend (`packages/backend`)
* **Framework:** Node.js + Express 5.
* **Patrón de Arquitectura:** Clean Architecture estructurada en 4 capas concéntricas:
  * **Domain:** Entidades de negocio puras (`Usuario`, `Evento`, `TipoEntrada`, `Compra`, `CambioEstadoCompra`, `Mensaje`, `Resenia`, `Categoria`).
  * **Repositories:** Patrón Repositorio con implementación en memoria thread-safe (`InMemoryStore`) asegurando total reproducibilidad e independencia de bases de datos externas.
  * **Services:** Casos de uso de aplicación, transacciones de cupo con temporizador de 15 minutos, hashing de contraseñas (`bcryptjs`) y generación de tokens JWT.
  * **Controllers & Middlewares:** Controladores REST desacoplados, middleware de autenticación y autorización basada en roles (RBAC) y manejador global de excepciones con códigos HTTP semánticos.
* **Documentación de API:** Swagger UI / OpenAPI 3.0 interactivo en `/api/docs`.

### 🔹 Frontend Mobile (`packages/frontend`)
* **Framework:** React Native con Expo (SDK 51), compatible con Android, iOS y Web.
* **Diseño Visual:** Paleta oficial **Clean & Bright** (Verde Esmeralda `#059669` / Menta `#10b981`, fondos hueso `#f8fafc`, superficies elevadas `#ffffff`).
* **Navegación:** `React Navigation` combinando Bottom Tabs (`BuyerTabs`, `OrganizerTabs`) con Native Stacks anidados para transiciones fluidas sin pérdida de contexto.
* **Pautas de Cátedra (Clases 09 y 10):**
  * **4 Estados de UI:** `LoadingState`, `ErrorState` con botón de reintento, `EmptyState` con llamadas a la acción contextuales y visualización de datos.
  * **Búsqueda Reactiva con Debounce:** Hook personalizado `useDebounce(350ms)` en catálogo para optimizar peticiones al servidor.
  * **Accesibilidad WCAG (POUR):** Tamaños táctiles mínimos de 48px, alto contraste de legibilidad y propiedades `accessibilityLabel` y `accessibilityRole` en todos los componentes interactivos.

---

## 📋 4. Matriz de Cobertura de Casos de Uso (CU-01 a CU-12)

Todos los casos de uso definidos en la consigna oficial están implementados y verificados con pruebas automatizadas:

| Caso de Uso | Descripción Funcional | Componentes / Endpoints | Verificación |
| :--- | :--- | :--- | :---: |
| **CU-01** | Comprador visualiza compras, estados y cálculo de días faltantes si está confirmada | `MyPurchasesScreen.js`, `PurchaseCard.js`<br>`GET /api/compras/mis-compras` | Jest + E2E (`04`) ✅ |
| **CU-02** | Organizador visualiza ventas de su evento, estados y cupos disponibles por sector | `EventSalesScreen.js`, `MyEventsScreen.js`<br>`GET /api/eventos/:id/compras` | Jest + E2E (`05`) ✅ |
| **CU-03** | Búsqueda textual con debounce y filtrado reactivo por categorías | `ExploreScreen.js`, `CategoryPills.js`<br>`GET /api/eventos?search=&categoriaId=` | Jest + E2E (`02`) ✅ |
| **CU-04** | Organizador publica evento con múltiples tipos de entrada (precio y cupo) | `CreateEventScreen.js`<br>`POST /api/eventos` | Jest + E2E (`03`) ✅ |
| **CU-05** | Comprador envía mensajes en tiempo real dentro del chat de su compra | `ChatScreen.js`<br>`POST /api/compras/:id/mensajes` | Jest + E2E (`05`) ✅ |
| **CU-06** | Organizador responde mensajes dentro del chat de cualquier compra de su evento | `ChatScreen.js`<br>`GET/POST /api/compras/:id/mensajes` | Jest + E2E (`05`) ✅ |
| **CU-07** | Comprador solicita cancelación y reembolso de compra confirmada | `MyPurchasesScreen.js`<br>`PATCH /api/compras/:id/estado` (`REEMBOLSADA`) | Jest + E2E (`06`) ✅ |
| **CU-08** | Restricción de reembolso: solo si la entrada NO está utilizada y el evento no ocurrió | `CompraService.js` (validaciones de dominio)<br>`Compra.test.js` | Jest + E2E (`06`) ✅ |
| **CU-09** | Comprador califica evento con puntaje (1-5) y comentario tras validar entrada | `ReviewModal.js`<br>`POST /api/eventos/:id/resenias` | Jest + E2E (`05`) ✅ |
| **CU-10** | Comprador visualiza reseñas previas y reputación histórica del organizador | `EventDetailScreen.js` (sección reputación)<br>`GET /api/eventos/:id` | Jest + E2E (`02`) ✅ |
| **CU-11** | Ordenamiento de eventos por precio, fecha y puntaje del organizador | `SortModal.js`<br>`GET /api/eventos?ordenarPor=&orden=` | Jest + E2E (`02`) ✅ |
| **CU-12** | Compra guiada en 2 pasos: reserva de cupo (15 min) y pago simulado | `EventDetailScreen.js`<br>`POST /api/compras` + `POST /api/compras/:id/pagos` | Jest + E2E (`04`) ✅ |

---

## 🧪 5. Pirámide de Testing y Calidad

El proyecto implementa una estrategia de pruebas en múltiples niveles:

```
          / \
         / E2E \        --> 14 Tests Playwright (Navegador Chromium Headless, ~19s)
        /-------\
       /  Integ. \      --> 36 Tests Supertest (Endpoints HTTP, Auth JWT, Rutas)
      /-----------\
     /   Unitarias \    --> 73 Tests Jest (Entidades DDD, Transiciones de Estado, Reglas)
    /_______________\
```

### Ejecutar las Pruebas:
```bash
# 1. Pruebas Unitarias y de Integración del Backend (109 tests en ~12s)
npm test

# 2. Pruebas End-to-End con Playwright (14 suites en ~19s)
npm run test:e2e

# 3. Pruebas E2E en modo interactivo con interfaz gráfica de Playwright
npm run test:e2e:ui

# 4. Verificación de Linter (ESLint con 0 errores y 0 warnings)
npm run lint
```

---

## 🚀 6. Puesta en Marcha (Inicio Rápido)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Franco-Ball/tp-dds-2026-AI-Ticket-It.git
cd tp-dds-2026-AI-Ticket-It
npm install
```

### 2. Configurar Variables de Entorno
Crea el archivo `.env` dentro de `packages/backend`:
```env
# packages/backend/.env
PORT=8000
JWT_SECRET=super_secreto_para_desarrollo_dds_2026
ALLOWED_ORIGINS=http://localhost:8081,http://127.0.0.1:8081,http://localhost:3000
```

### 3. Iniciar la Aplicación

#### Opción A: Ejecutar ambos servicios simultáneamente (Recomendado)
```bash
npm run start:dev
```

#### Opción B: Ejecutar por separado
* **Backend:**
  ```bash
  npm run dev:backend       # Servidor con nodemon/watch en http://localhost:8000
  ```
* **Frontend Mobile / Web:**
  ```bash
  npm run start:frontend    # Inicia Metro Bundler de Expo (presiona 'w' para web o escanea QR con Expo Go)
  ```

---

## 👥 7. Usuarios Demo y Credenciales Semilla

El sistema cuenta con un seeder automático de datos con usuarios y espectáculos de prueba listos para usar:

| Rol | Usuario | Email | Contraseña | Compras y Casos de Uso Semilla |
| :--- | :--- | :--- | :--- | :--- |
| **Organizador** | Olga Organizadora | `organizador@demo.com` | `organizador123` | Publicar nuevos eventos, ver panel de recaudación y ventas en puerta, validar ingresos y responder chats. |
| **Comprador** | Carlos Comprador | `comprador@demo.com` | `comprador123` | Entradas de Coldplay (CONFIRMADA con chat de 3 mensajes), Grönholm (PENDIENTE) y Rock Nacional (UTILIZADA con reseña). |
| **Compradora** | Lucía Gómez | `lucia@demo.com` | `lucia123` | Entradas de Coldplay (CONFIRMADA con chat sobre accesibilidad) y Duki (CONFIRMADA). |
| **Comprador** | Marcos Rossi | `marcos@demo.com` | `marcos123` | Entradas de El Método Grönholm (CONFIRMADA con chat de estacionamiento) y Torneo ATP (CONFIRMADA). |
| **Compradora** | Sofía Fernández | `sofia@demo.com` | `sofia123` | Entradas de Les Luthiers (CONFIRMADA con chat de función) y Cosquín Rock. |

* **Documentación Interactiva Swagger:** [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

---

## 📚 8. Documentación Adicional del Repositorio

* [Decisiones de Diseño de Software (`docs/DECISIONES_DE_DISENO.md`)](docs/DECISIONES_DE_DISENO.md): Detalle exhaustivo de patrones, Clean Architecture, DDD, manejo de concurrencia y accesibilidad.
* [Conclusión Final de Desarrollo con IA (`docs/TRABAJO PRÁCTICO INDIVIDUAL - Conclusión Final.pdf`)](docs/TRABAJO%20PRÁCTICO%20INDIVIDUAL%20-%20Conclusión%20Final.pdf): Informe formal en PDF con la reflexión crítica, herramientas empleadas, ganancias de productividad, dificultades y aprendizajes.
* [Plan de Sprints y Matriz de Trazabilidad (`docs/PLAN_DE_SPRINTS.md`)](docs/PLAN_DE_SPRINTS.md): Evolución sprint por sprint con criterios de aceptación (DoD).
* [Guía de Git Flow (`docs/GIT_FLOW.md`)](docs/GIT_FLOW.md): Estrategia de ramas, convención de commits atómicos y workflow de desarrollo.
* [Guía de Grabación del Video (`docs/GUIA_DEMO_VIDEO.md`)](docs/GUIA_DEMO_VIDEO.md): Tiempos, guión paso a paso y checklist técnico para la entrega audiovisual.
