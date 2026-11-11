# 🧠 Bitácora de Desarrollo Asistido por Inteligencia Artificial
## Trabajo Práctico Individual de Desarrollo de Software (DDS — UTN FRBA 2C 2026)
**Proyecto:** AI Ticket It — Plataforma de Venta de Entradas y Gestión de Espectáculos  
**Alumno:** Franco Ballistreri  
**Docentes:** Cátedra de Diseño y Desarrollo de Software  

---

## 📌 1. Introducción y Marco Pedagógico

El presente documento constituye la **reflexión crítica y registro metodológico** sobre el uso de herramientas de Inteligencia Artificial en el ciclo de vida del software para la plataforma **AI Ticket It**, en cumplimiento con las pautas de entrega del Trabajo Práctico Individual de la cátedra de **Desarrollo de Software (UTN FRBA)**.

El objetivo central del trabajo no consistió en utilizar la IA como una "caja negra" que genera código sin supervisión, sino en evaluar críticamente su potencial como **amplificador de la productividad técnica**, analizando sus beneficios tangibles, sus limitaciones intrínsecas y, fundamentalmente, la necesidad ineludible del **criterio de ingeniería de software** para dirigir, modularizar, verificar y asegurar la calidad del producto final.

---

## 🛠️ 2. Herramientas de IA Utilizadas y Roles en el Ciclo de Vida

A lo largo del proyecto se implementaron diversas herramientas recomendadas por la cátedra, asignando a cada una un rol específico según sus fortalezas:

| Herramienta | Rol Principal | Casos de Uso / Actividades Concretas |
| :--- | :--- | :--- |
| **Google Antigravity** | Orquestación Arquitectónica, Planificación y Pairing | Definición de Clean Architecture, diseño de capas DDD, seguimiento de sprints con criterios de aceptación (DoD), configuración de Playwright y análisis de trazabilidad. |
| **Claude / Anthropic (Sonnet)** | Modelado de Dominio y Lógica de Negocio | Definición de invariantes en entidades de dominio (`Compra`, `Evento`, `TipoEntrada`), validadores de esquema Zod, middlewares de autorización por roles y transiciones de estados. |
| **GitHub Copilot / Cursor** | Autocompletado y Aceleración de Código Repetitivo | Scaffolding de componentes visuales en React Native, tablas de estilos temáticos oficiales (*Clean & Bright*), hooks personalizados (`useDebounce`, `useFocusEffect`). |
| **Playwright Test Agent** | Generación y Refinamiento de Pruebas E2E | Asistencia en la creación de suites automatizadas de extremo a extremo, resolución de selectores accesibles y orquestación de servidores duales. |

---

## 🚀 3. Ventajas y Aceleración de Productividad (Aciertos)

El impacto positivo del desarrollo asistido por IA se manifestó en varias dimensiones clave del proyecto:

### 3.1. Reducción Drástica del Tiempo de Scaffolding y Boilerplate
* La configuración inicial del monorepo (`packages/backend` y `packages/frontend`), la inicialización de Express, la estructura modular de directorios y la configuración de Expo se resolvieron en una fracción del tiempo habitual.
* La creación de entidades de dominio con métodos auxiliares de cálculo (como `calcularTotalRecaudado()`, `obtenerCupoDisponible()`, o `calcularDiasFaltantes()`) se aceleró notablemente mediante prompts guiados por contratos de diseño.

### 3.2. Construcción de una Pirámide de Testing Masiva y Confiable
* Tradicionalmente, la redacción de pruebas suele ser una de las etapas más sacrificadas por restricciones de tiempo. En este proyecto, la IA permitió generar y mantener una batería exhaustiva de **109 pruebas unitarias y de integración** en Jest (Supertest) y **14 suites End-to-End** en Playwright con un 100% de éxito.
* La capacidad de la IA para proponer casos de borde (*edge cases*) y caminos tristes (como compras con cupo insuficiente, cancelaciones de entradas ya utilizadas, accesos no autorizados por rol u ordenamientos inválidos) fortaleció enormemente la robustez del sistema.

### 3.3. Aplicación Sistemática de Pautas de Accesibilidad (Clase 09 - WCAG)
* La IA facilitó la incorporación continua de directrices POUR en la interfaz gráfica móvil:
  * Agregado proactivo de `accessibilityLabel` descriptivos en todos los botones, tarjetas e inputs.
  * Definición de touch targets mínimos de 48px para facilitar el uso táctil.
  * Roles semánticos explícitos (`role="dialog"`, `role="button"`), lo cual redundó no solo en mejor accesibilidad para usuarios con lectores de pantalla, sino también en selectores altamente estables para las pruebas E2E.

### 3.4. Documentación Viva y Consistente
* Se mantuvieron actualizados y sincronizados los documentos de arquitectura (`DECISIONES_DE_DISENO.md`), el plan de entregas (`PLAN_DE_SPRINTS.md`), la especificación OpenAPI (`Swagger`) y el guión audiovisual (`GUIA_DEMO_VIDEO.md`), logrando una trazabilidad integral entre consigna y código.

---

## ⚠️ 4. Fricciones, Desafíos y Dificultades Técnicas (Desventajas)

A pesar de sus ventajas, el proceso evidenció fricciones reales donde la intervención humana y el criterio técnico fueron estrictamente indispensables:

### 4.1. Alucinación de Dependencias Nativas en Expo (Mobile vs Web)
* **Problema:** En varias ocasiones, los asistentes de IA propusieron librerías populares de npm que requerían código nativo no soportado por el flujo gestionado de Expo (*Expo managed workflow*) o incompatibles con Expo Web (por ejemplo, librerías de alertas nativas complejas o selectores de fecha con dependencias binarias).
* **Solución aplicada:** Fue necesario guiar deliberadamente a la IA hacia el uso de primitivas puras de React Native (`Alert.alert` con fallbacks específicos para `Platform.OS === 'web'`), íconos estándar de `@expo/vector-icons` y modales declarativos propios (`ConfirmModal`, `TicketQRModal`, `ReviewModal`).

### 4.2. Lógica Temporal, Husos Horarios y Reserva de Cupos
* **Problema:** El requerimiento de retener el cupo de forma temporal durante 15 minutos en estado `PENDIENTE` (CU-12) y el cálculo de "días faltantes para el evento" (CU-01) presentaron desvíos iniciales en las sugerencias de la IA debido a discrepancias entre husos horarios (UTC vs hora local argentina `UTC-3`).
* **Solución aplicada:** Se definió en la entidad `Compra` y `Evento` una regla de negocio canónica: todas las fechas se normalizan y almacenan en formato ISO 8601 UTC en el backend, y el cálculo de diferencia de días y expiración se realiza mediante operaciones aritméticas explícitas en milisegundos (`15 * 60 * 1000`), evitando ambigüedades de zona horaria.

### 4.3. Fragilidad de Selectores en React Native Web para Pruebas E2E
* **Problema:** Al exportar la aplicación móvil a la web con Expo para ejecutar Playwright, React Native Web genera clases CSS dinámicas y ofuscadas (como `css-175oi2r` o `r-18u37iz`). Los primeros tests propuestos por la IA intentaban buscar elementos por jerarquías de divs o clases genéricas, lo que causaba fallos intermitentes de timeout.
* **Solución aplicada:** Se refactorizó la estrategia de selectores en base a lo aprendido en la Clase 09 (WCAG): localizar componentes exclusivamente por texto visible (`text=...`), atributos semánticos accesibles (`[aria-label="..."]`) y roles ARIA (`[role="dialog"]`). Esto garantizó que la suite E2E corriera los 14 escenarios de forma determinística en menos de 20 segundos.

### 4.4. Desfase de Contratos Backend-Frontend
* **Problema:** Durante la implementación del panel de ventas del organizador (CU-02), el backend devolvía las métricas de recaudación aplanadas en la raíz del JSON, mientras que la pantalla frontend esperaba un objeto anidado `resumen`. Esto causó un error en tiempo de ejecución en la vista web.
* **Solución aplicada:** Se auditó el contrato HTTP y se aplicó el principio de robustez (Ley de Postel): el backend se enriqueció para emitir tanto el objeto estructurado `resumen` como los atributos retrocompatibles, y el frontend se blindó con valores predeterminados defensivos (`salesData?.resumen || ...`).

---

## 📈 5. Comparativa de Esfuerzo y Productividad

| Dimensión | Enfoque Tradicional Estimado | Enfoque Potenciado con IA | Factor de Mejora |
| :--- | :---: | :---: | :---: |
| **Scaffolding de Monorepo y Auth** | 8 - 12 horas | ~2 horas | **4x - 6x** |
| **Modelado DDD y Repositorios en Memoria** | 10 - 15 horas | ~3 horas | **3x - 5x** |
| **Desarrollo de Pantallas Mobile (React Native)** | 25 - 35 horas | ~8 horas | **3x - 4x** |
| **Batería de Pruebas (109 Jest + 14 Playwright)** | 20 - 30 horas | ~4 horas | **5x - 7x** |
| **Documentación Técnica, Swagger y Guías** | 10 - 12 horas | ~2 horas | **5x** |
| **Total Estimado de Desarrollo** | **~75 - 105 horas** | **~19 - 25 horas** | **~4x de Aceleración** |

---

## 🎓 6. Conclusiones y Aprendizajes Obtenidos

1. **La IA es un amplificador de habilidades, no un reemplazo:**
   Un desarrollador sin fundamentos de arquitectura o diseño de software puede verse abrumado por el código generado por IA, acumulando deuda técnica o código espagueti. Por el contrario, un ingeniero que aplica **Clean Architecture**, **Domain-Driven Design** y **Separación de Responsabilidades** puede dirigir a la IA con precisión milimétrica, obteniendo software modular, legible y mantenible.

2. **La suite de pruebas como arnés de seguridad imprescindible:**
   Cuando se programa con asistencia de IA, la velocidad de iteración es sumamente alta. La única manera de garantizar que un cambio o refactorización sugerida por la IA no rompa una invariante existente es contar con una batería automatizada rigurosa. Los **109 tests de backend** y los **14 tests E2E** funcionaron como la red de contención que permitió avanzar con total confianza en cada sprint.

3. **La importancia de los estándares de accesibilidad e interfaces:**
   Las directrices de accesibilidad (WCAG POUR) de la cátedra demostraron tener un valor dual: hacen que la aplicación sea inclusiva para los usuarios finales y, al mismo tiempo, proporcionan una estructura semántica clara que permite automatizar pruebas de extremo a extremo estables y desacopladas de los estilos visuales.

4. **Valoración personal del impacto:**
   La experiencia en el desarrollo de **AI Ticket It** demostró que el desarrollo asistido por IA permite elevar el nivel de abstracción del programador: en lugar de gastar energía en recordar sintaxis o escribir código de soporte repetitivo, el tiempo se invierte en lo que verdaderamente aporta valor: **el diseño del dominio, las reglas de negocio, la experiencia del usuario y la arquitectura del sistema**.
