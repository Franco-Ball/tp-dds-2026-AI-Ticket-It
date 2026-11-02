# 🎬 Guía y Guión de Demostración Técnica en Video
## Trabajo Práctico Individual de Desarrollo con IA — DDS (UTN FRBA) 2C 2026
**Proyecto:** Ticket-It — Plataforma Mobile y Web de Venta de Entradas y Gestión de Espectáculos  
**Duración Sugerida:** 5 a 10 minutos

---

## 📌 1. Estructura General del Video

| Bloque | Tiempo Estimado | Tema Principal |
| :--- | :---: | :--- |
| **Bloque 1** | 0:00 - 1:00 | Presentación del alumno, motivación y objetivos de la plataforma |
| **Bloque 2** | 1:00 - 2:30 | Arquitectura del Backend, Testing (109 tests) y Persistencia |
| **Bloque 3** | 2:30 - 4:00 | Arquitectura del Frontend (React Native Expo, UI States, Accesibilidad) |
| **Bloque 4** | 4:00 - 8:00 | Recorrido en Vivo de la App (Caminos Felices y Caminos Tristes) |
| **Bloque 5** | 8:00 - 9:30 | Reflexión Crítica: Ventajas, Fricciones y Productividad con IA |
| **Bloque 6** | 9:30 - 10:00 | Cierre y Conclusiones Metodológicas |

---

## 🎤 2. Guión Detallado Paso a Paso

### 🔹 Bloque 1: Presentación y Contexto (0:00 - 1:00)
- **Cámara / Diapositiva inicial:**
  - *"Hola a todos, mi nombre es [Tu Nombre y Apellido], alumno del curso de Diseño de Sistemas (UTN FRBA) 2C 2026."*
  - *"En este video presento la entrega integral de **Ticket-It**, una plataforma completa de compra, venta y seguimiento de entradas para eventos y espectáculos en vivo."*
  - *"El proyecto fue concebido bajo arquitectura desacoplada: un backend robusto en Node.js/Express bajo principios de Clean Architecture y DDD, y un frontend móvil nativo en React Native con Expo, aplicando las directrices de UX, accesibilidad y UI vistas en las Clases 09 y 10."*

---

### 🔹 Bloque 2: Arquitectura de Backend y Calidad (1:00 - 2:30)
- **Mostrar código en editor / terminal con `npm test`:**
  - **Clean Architecture & In-Memory Store:**
    - Explicar la separación en capas: Dominio puro (`Usuario`, `Evento`, `TipoEntrada`, `Compra`, `Mensaje`, `Resenia`), Repositorios (`InMemoryStore`), Servicios de aplicación y Controladores REST.
    - Persistencia en memoria pura sin dependencias pesadas de bases de datos externas para garantizar reproducibilidad inmediata.
  - **Seguridad y Reglas de Negocio:**
    - Autenticación mediante tokens JWT y hashing seguro con bcrypt.
    - Middleware de autorización por roles (`COMPRADOR` vs `ORGANIZADOR`).
    - Lógica transaccional de cupos: retención preventiva de 15 minutos en estado `PENDIENTE` para evitar sobreventa (*overselling*) y confirmación mediante pasarela simulada.
    - Manejo centralizado de errores con códigos HTTP semánticos (400, 401, 403, 404, 409, 422).
  - **Testing Exhaustivo:**
    - Mostrar en la terminal la ejecución de `npm test`:
      - **15 suites de test** pasando con éxito.
      - **109 tests automatizados** cubriendo lógica de dominio e integración de endpoints con Supertest.

---

### 🔹 Bloque 3: Arquitectura de Frontend Mobile (2:30 - 4:00)
- **Mostrar estructura de `packages/frontend` en el editor:**
  - **React Native (Expo):**
    - Configuración multiplataforma optimizada para iOS, Android y Web.
    - Paleta de colores oficial **Clean & Bright**: Verde Esmeralda/Menta (`#059669` / `#10b981`), fondo blanco/hueso (`#f8fafc`), superficies limpias y contraste visual verificado.
  - **Patrones de Navegación (Tabs + Stacks Anidados):**
    - `BuyerTabs` con pestañas para Explorar, Mis Compras y Perfil.
    - `OrganizerTabs` con pestañas para Mis Eventos, Publicar y Perfil.
    - Stacks nativos internos que permiten transiciones fluidas hacia detalles, checkouts y chat sin perder el estado de navegación.
  - **Pautas de Cátedra (Clases 09 y 10):**
    - **4 Estados de UI:** Implementación de `LoadingState`, `ErrorState` con reintento, `EmptyState` con llamadas a la acción y visualización de datos.
    - **Hook `useDebounce`:** Búsqueda en catálogo con retardo de 350ms para evitar saturación de peticiones.
    - **Accesibilidad WCAG (POUR):** Touch targets mínimos de 48px, contraste accesible y `accessibilityLabel` descriptivo en todos los componentes interactivos.

---

### 🔹 Bloque 4: Demostración en Vivo de la Aplicación (4:00 - 8:00)
*Tener abierto el simulador móvil o navegador web con la app corriendo (`npm run web` / `npx expo start`).*

#### 1. Autenticación y Catálogo (CU-03, CU-10, CU-11):
- Iniciar sesión con un usuario **Comprador** de prueba.
- Demostrar el catálogo en `ExploreScreen`:
  - **Búsqueda en vivo:** Escribir en la barra de búsqueda y resaltar el funcionamiento del `useDebounce`.
  - **Filtros por categoría:** Presionar los chips horizontales (Música, Teatro, Festival, Stand-Up).
  - **Ordenamiento (CU-11):** Abrir el modal y ordenar por menor precio, mayor precio, fecha próxima o mejor reputación.
  - **Reputación del Organizador (CU-10):** Visualizar en la tarjeta la insignia de estrellas y calificación histórica promedio.

#### 2. Publicación de Evento (CU-04 - Rol Organizador):
- Cambiar a una cuenta de **Organizador**.
- Navegar a la pestaña *"Publicar"*:
  - Llenar el formulario con título, categoría, fecha y foto mediante plantillas rápidas.
  - Crear 2 tipos de entrada dinámicos: *General* (ej. $15.000, 50 cupos) y *VIP* (ej. $35.000, 10 cupos).
  - Publicar el evento y verificar que aparece instantáneamente en *"Mis Eventos"*.

#### 3. Flujo Transaccional de Compra en 2 Pasos (CU-12):
- Cambiar a la cuenta de **Comprador**.
- Ingresar al detalle del evento recién publicado:
  - Ver el carrusel de imágenes, descripción, desglose de cupos y reseñas históricas.
  - Presionar *"Comprar Entradas"*:
    - **Paso 1:** Seleccionar sector *General*, cambiar cantidad con los controles numéricos y observar el recálculo en tiempo real del total.
    - Presionar *"Continuar al Pago"* -> Explicar que se crea la compra en estado `PENDIENTE` reteniendo el cupo por 15 minutos en el backend.
    - **Paso 2:** Elegir medio de pago simulado (*Mercado Pago* o *Tarjeta*) y presionar *"Pagar y Confirmar Entradas"*.
    - **Paso 3:** Pantalla de éxito con botón directo a *"Mis Compras"*.

#### 4. Panel de Mis Compras y Ticket QR (CU-01, CU-07, CU-08):
- En la pestaña *"Mis Compras"*:
  - Resaltar el badge dinámico: *"Faltan X días para el evento"*, calculado automáticamente según la fecha actual (**CU-01**).
  - Presionar *"Ver Ticket QR"*: Mostrar el modal con diseño de boleto perforado y código QR/barras digital.
  - **Camino Triste / Validación (CU-07, CU-08):**
    - Explicar la regla: La compra puede cancelarse y reembolsarse únicamente si la entrada aún NO fue `UTILIZADA` y el evento no se ha llevado a cabo.
    - Mostrar el botón *"Solicitar Reembolso"* con confirmación destructiva.

#### 5. Panel de Ventas del Organizador y Puerta (CU-02):
- Cambiar al **Organizador** y entrar a *"Mis Eventos"*:
  - Presionar *"Ventas y Cupos"* en el evento:
    - Ver ingresos acumulados, porcentaje de ocupación y gráfico de cupos vendidos vs disponibles por sector.
    - En la lista de compradores, presionar *"Validar Ingreso en Puerta"* -> La compra pasa a estado `UTILIZADA`.

#### 6. Mensajería / Chat de Compra (CU-05, CU-06):
- Abrir el chat de la compra desde el panel del organizador:
  - Enviar un mensaje de consulta o bienvenida.
  - Cambiar al comprador o mostrar la actualización periódica por polling (cada 4 segundos).
  - El comprador responde en tiempo real con burbujas visualmente diferenciadas (verde emisor, blanco receptor).
  - **Camino Triste:** Explicar que si una compra pasa a `CANCELADA` o `REEMBOLSADA`, el backend rechaza con 422 y el frontend bloquea la entrada mostrando el banner informativo.

#### 7. Calificación y Reseñas (CU-09):
- Con la entrada ya validada como `UTILIZADA`, el comprador entra a *"Mis Compras"*.
- El botón *"Dejar Reseña"* se habilita exclusivamente ahora:
  - Abrir `ReviewModal`, seleccionar 5 estrellas y escribir una opinión: *"Excelente organización y sonido impecable"*.
  - Enviar reseña -> Verificar que actualiza la reputación del organizador y se refleja en el detalle del evento.

---

### 🔹 Bloque 5: Reflexión Crítica sobre el Desarrollo Asistido por IA (8:00 - 9:30)

*Este bloque es fundamental para cumplir con la consigna pedagógica del TP de DDS sobre desarrollo con Inteligencia Artificial:*

1. **Aceleración y Ganancias de Productividad:**
   - *"La asistencia de IA permitió reducir drásticamente el tiempo de configuración y generación de código repetitivo (controladores Express, validadores Joi, componentes modales y estilos en React Native)."*
   - *"Permitió iterar muy rápido en la suite de pruebas unitarias y de integración, logrando 109 tests automatizados con una cobertura integral del 100% de los casos de uso."*

2. **Fricciones y Desafíos Reales Encontrados:**
   - **Dependencias y Plataforma:** *"La IA a veces sugiere librerías nativas que no son directamente compatibles con Expo sin prebuild o que presentan conflictos de versión. Fue necesario orientarla hacia soluciones puras en React Native y Expo Vector Icons."*
   - **Lógica Temporal y Concurrencia:** *"En el manejo de reservas de cupos de 15 minutos y cálculo de días faltantes, fue crítico auditar las zonas horarias (UTC vs hora local) y los estados intermedios para evitar inconsistencias."*
   - **Control de Contexto y Sandbox:** *"En entornos de desarrollo con sandbox y git locks, se requirió una estrategia deliberada de modularización de tareas y commits atómicos separados por responsabilidad."*

3. **Conclusión Metodológica:**
   - *"La IA no reemplaza el criterio del ingeniero ni el conocimiento de diseño de software. Es un acelerador potente, pero el éxito del sistema radica en aplicar principios sólidos: Clean Architecture, DDD, separación de responsabilidades, pautas de accesibilidad y una batería rigurosa de pruebas que verifiquen cada invariante de negocio."*

---

### 🔹 Bloque 6: Cierre (9:30 - 10:00)
- *"Ticket-It cumple de punta a punta con los 12 casos de uso del Trabajo Práctico, las directrices de diseño de las clases de DDS y los estándares profesionales de la industria."*
- *"Muchas gracias por su atención."*

---

## 📋 3. Checklist Previo a la Grabación

- [ ] Backend corriendo en segundo plano: `npm run dev` en `packages/backend` (puerto 3000).
- [ ] Frontend corriendo en Expo: `npx expo start --web` en `packages/frontend` (puerto 8081).
- [ ] Base de datos en memoria reiniciada con datos semilla listos para la demo.
- [ ] Terminal lista para ejecutar `npm test` y mostrar los 109 tests pasando.
- [ ] Micrófono y captura de pantalla configurados en 1080p con buen audio.
