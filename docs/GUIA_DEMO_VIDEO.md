# 🎬 Guía y Estructura de la Demostración Técnica en Video
## Trabajo Práctico Individual de Desarrollo con IA — DDS (UTN FRBA) 2C 2026
**Proyecto:** Ticket-It — Plataforma Mobile y Web de Venta de Entradas y Gestión de Espectáculos  
**Alumno:** Franco Ball  
**Duración Sugerida:** 7 a 9 minutos  

---

## 📌 1. Estructura General del Video (Flujo Óptimo de 2 Actos)

Para evitar pérdidas de tiempo y cambios reiterados de sesión, la demo en vivo se estructura como **«El Ciclo de Vida Completo de un Espectáculo»** con **un único cambio de usuario** entre Organizador y Comprador:

| Bloque | Tiempo Estimado | Tema Principal | En Pantalla |
| :--- | :---: | :--- | :--- |
| **Bloque 1** | 0:00 - 0:50 | Presentación del alumno, universidad, motivación y objetivos de Ticket-It | Cámara o Portada oficial con logo de UTN |
| **Bloque 2** | 0:50 - 2:10 | Arquitectura de Backend (Clean Architecture, DDD, JWT, Zod) y **109 tests** pasando | VS Code (`backend/src`) y Terminal (`npm test`) |
| **Bloque 3** | 2:10 - 3:30 | Arquitectura de Frontend Mobile (React Native Expo, UI States, `useDebounce`, Accesibilidad) | VS Code (`frontend/src`) |
| **Bloque 4** | 3:30 - 7:30 | **Demostración en Vivo en 2 Actos (12 Casos de Uso integrados):**<br>• **Acto 1: Organizador** (Publicación, Ventas, Validación en Puerta y Chat)<br>• **Acto 2: Comprador** (Catálogo, Compra en 2 pasos, QR, Reembolso, Chat y Reseña) | Navegador o Emulador Expo |
| **Bloque 5** | 7:30 - 8:50 | Reflexión Crítica: Productividad vs Fricciones del desarrollo asistido por IA | Cámara o VS Code |
| **Bloque 6** | 8:50 - 9:15 | Cierre y Conclusiones Metodológicas | Pantalla final / App |

---

## 🗺️ 2. Matriz de Cobertura de los 12 Casos de Uso en la Demo

| Caso de Uso | Momento de la Demostración | Acción Específica en Pantalla |
| :--- | :---: | :--- |
| **CU-04** | Acto 1 (Organizador) | Creación de evento rápido con 2 tipos de entrada (General y VIP) con cupos y precios independientes. |
| **CU-02** | Acto 1 (Organizador) | Métricas de ventas, ocupación y **validación en puerta de una compra** que pasa a estado `UTILIZADA`. |
| **CU-06** | Acto 1 (Organizador) | Envío de mensaje desde el chat de soporte de la compra hacia el comprador. |
| **CU-03** | Acto 2 (Comprador) | Búsqueda con retardo `useDebounce` (350ms) y filtrado por chips de categorías. |
| **CU-10** | Acto 2 (Comprador) | Visualización de la reputación del organizador (estrellas y promedio) en las tarjetas del catálogo. |
| **CU-11** | Acto 2 (Comprador) | Ordenamiento dinámico en modal por menor precio, mayor precio, fecha próxima o mejor calificación. |
| **CU-12** | Acto 2 (Comprador) | Compra transaccional en 2 pasos: reserva preventiva de cupos en `PENDIENTE` (15 min) y confirmación con pago simulado. |
| **CU-01** | Acto 2 (Comprador) | Visualización de compras en `Mis Compras`, badge dinámico *"Faltan X días"* y modal con ticket QR perforado. |
| **CU-07 & CU-08** | Acto 2 (Comprador) | Camino triste / Regla de negocio: botón de reembolso activo solo si no está `UTILIZADA` y el evento no ocurrió. |
| **CU-05** | Acto 2 (Comprador) | Recepción del mensaje del organizador y respuesta en tiempo real (polling cada 4s). Mención del error 422 ante compra cancelada. |
| **CU-09** | Acto 2 (Comprador) | Apertura del modal de reseña en la compra marcada como `UTILIZADA` en el Acto 1. Calificación de 5 estrellas y actualización de reputación. |

---

## 📋 3. Checklist Técnico Previo a Grabar

- [ ] **Backend corriendo:** En `packages/backend` ejecutar `npm run dev` (puerto 3000). *(Asegurarse de que inició fresco para que los datos semilla estén en su estado inicial).*
- [ ] **Frontend corriendo:** En `packages/frontend` ejecutar `npm run web` (puerto 8081).
- [ ] **Terminal de Testing:** Lista en `packages/backend` con `npm test` listo para ejecutar.
- [ ] **Credenciales de prueba a mano:**
  - **Organizador:** `organizador@demo.com` / `organizador123`
  - **Comprador:** `comprador@demo.com` / `comprador123`
- [ ] **Audio y Resolución:** Micrófono configurado, sin ruido de fondo, grabación de pantalla a 1080p (1920x1080).
