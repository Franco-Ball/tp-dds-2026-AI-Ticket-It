# 🎙️ Guión de Lectura para Grabación de Video Demostrativo
## TP Individual de Desarrollo con IA — Diseño de Sistemas (UTN FRBA) 2C 2026
**Alumno:** Franco Ball  
**Proyecto:** Ticket-It — Plataforma Mobile y Web de Venta de Entradas y Gestión de Espectáculos  
**Duración Objetivo:** 7 a 9 minutos  
**Estrategia:** Flujo en 2 Actos con un único cambio de usuario (Organizador ➡️ Comprador).

---

## ⚙️ Preparación Previa a Grabar (Checklist de 2 minutos)

1. **Terminal 1 (Backend):** Corriendo en `packages/backend` con `npm run dev` (puerto 3000). *(Reiniciar si ya hiciste pruebas para que los datos semilla estén frescos).*
2. **Terminal 2 (Frontend):** Corriendo en `packages/frontend` con `npm run web` (puerto 8081).
3. **Terminal 3 (Testing):** Ubicada en `packages/backend`, con el comando `npm test` listo para dar Enter.
4. **Navegador:** Tener la app abierta en pantalla de Login o ya iniciada sesión como **Organizador**:
   - `organizador@demo.com` | Contraseña: `organizador123`
5. **Editor de Código (VS Code):** Abierto con el explorador de archivos mostrando la raíz del proyecto.

---

## ⏱️ Cronómetro y Guión de Lectura Minuto a Minuto

```
0:00 - 0:50  | Bloque 1: Presentación y Visión General
0:50 - 2:10  | Bloque 2: Arquitectura Backend, Calidad y 109 Tests
2:10 - 3:30  | Bloque 3: Arquitectura Frontend Mobile y Pautas de Cátedra
3:30 - 7:30  | Bloque 4: Demostración Funcional en Vivo (Flujo en 2 Actos)
             ├── 3:30 - 5:00  | Acto 1: Organizador (Publicación, Ventas, Puerta y Chat)
             └── 5:00 - 7:30  | Acto 2: Comprador (Catálogo, Compra, QR, Reembolso, Chat y Reseña)
7:30 - 8:50  | Bloque 5: Reflexión Crítica: Desarrollo Asistido por IA
8:50 - 9:15  | Bloque 6: Cierre y Despedida
```

---

### 🔹 BLOQUE 1: Presentación y Contexto (0:00 - 0:50)

> **[PANTALLA: Cámara web del alumno o Diapositiva de portada con logo de UTN FRBA y Ticket-It]**

**[LEER EN VOZ ALTA]:**  
> *"Hola a todos, mi nombre es Franco Ball, alumno del curso de Diseño de Sistemas de UTN FRBA para este segundo cuatrimestre de 2026.*  
>  
> *A continuación presento la defensa técnica y demostración en vivo de **Ticket-It**, una plataforma integral de gestión de espectáculos y venta de entradas.*  
>  
> *El proyecto fue desarrollado bajo una estrategia Backend-First desacoplada: un backend modular en Node.js y Express estructurado bajo principios de Clean Architecture y Domain-Driven Design, y una aplicación frontend nativa construida en React Native con Expo, aplicando las directrices de accesibilidad, experiencia de usuario y manejo de estados de las Clases 09 y 10 de la cátedra."*

---

### 🔹 BLOQUE 2: Arquitectura de Backend y Calidad (0:50 - 2:10)

> **[PANTALLA: VS Code abierto en la carpeta `packages/backend/src` mostrando el árbol de carpetas: models, repositories, services, controllers, routes]**

**[LEER EN VOZ ALTA]:**  
> *"Comenzando por el backend, implementamos una arquitectura por capas estrictamente desacoplada:*  
>  
> *En la carpeta `models` residen nuestras entidades de dominio ricas: Usuario, Evento, TipoEntrada, Compra y Reseña. Siguiendo DDD, evitamos modelos anémicos: las reglas de negocio, los topes de aforo y las transiciones válidas de estado se encuentran encapsuladas dentro del propio modelo.*  
>  
> *Para la persistencia utilizamos un `InMemoryStore` respaldado por el patrón Repository. Esto garantiza una ejecución determinística, rápida y sin acoplarnos a motores de base de datos externos.*  
>  
> *A nivel de transporte y seguridad, la API expone endpoints REST puros con autenticación mediante tokens JWT y hashing con bcrypt. Aplicamos validación de entrada exhaustiva con esquemas Zod y middlewares de autorización por roles para distinguir entre Comprador y Organizador."*

> **[PANTALLA: Pasar a la Terminal 3 y ejecutar `npm test`. Dejar que corran las 15 suites de test]**

**[LEER EN VOZ ALTA]:**  
> *"Para asegurar la fiabilidad de reglas críticas —como la reserva preventiva de cupos durante 15 minutos para evitar sobreventa—, implementamos una batería de pruebas automatizadas.*  
>  
> *Como vemos en la terminal, contamos con **15 suites de test** y **109 pruebas automatizadas** pasando al 100% mediante Supertest y Jest, cubriendo tanto la lógica de dominio como la integración de cada endpoint HTTP."*

---

### 🔹 BLOQUE 3: Arquitectura de Frontend Mobile (2:10 - 3:30)

> **[PANTALLA: Mostrar en VS Code la estructura de `packages/frontend/src`: screens, navigation, components, hooks]**

**[LEER EN VOZ ALTA]:**  
> *"En el frontend, la aplicación está desarrollada en React Native utilizando el ecosistema de Expo, asegurando compatibilidad nativa en iOS, Android y Web.*  
>  
> *Adoptamos el sistema de diseño oficial **Clean & Bright** de la cátedra: superficies claras, contrastes profundos, el color verde institucional y el isotipo de ticket perforado.*  
>  
> *La navegación está organizada mediante Stacks y Bottom Tabs segmentados según el rol del usuario autenticado: `BuyerTabs` con Explorar, Mis Compras y Perfil, y `OrganizerTabs` con Mis Eventos, Publicar y Perfil.*  
>  
> *Siguiendo las pautas de las clases de UI/UX, contemplamos los **4 estados de interfaz**: Loading, visualización de datos, Error con botón de reintento, y Empty State cuando no hay registros.*  
>  
> *Asimismo, optimizamos la búsqueda con el hook personalizado `useDebounce` con retardo de 350 milisegundos y respetamos los lineamientos de accesibilidad WCAG: áreas táctiles mínimas de 48 píxeles y etiquetas de accesibilidad en todos los elementos interactivos."*

---

### 🔹 BLOQUE 4: Demostración en Vivo en 2 Actos (3:30 - 7:30)

> **[PANTALLA: Pasar al navegador o emulador donde ya está iniciada la sesión del Organizador]**

#### 🎭 ACTO 1: Rol Organizador — Publicación, Métricas de Ventas, Puerta y Chat (3:30 - 5:00)
*(Usuario: `organizador@demo.com` / `organizador123`)*

**1. Publicación de Evento con múltiples entradas (CU-04):**  
> **[ACCIÓN: Tocar la pestaña 'Publicar' en la barra inferior]**

**[LEER EN VOZ ALTA]:**  
> *"Comenzamos el recorrido en el rol de Organizador para publicar un nuevo evento (CU-04).*  
>  
> *Completamos el formulario: en título colocamos 'DDS Tech Summit 2026', categoría Conferencias y seleccionamos la fecha. Dejamos la imagen de portada configurada.*  
>  
> *Aquí demostramos la flexibilidad del dominio permitiendo múltiples tipos de entrada:*  
> *Añadimos un primer sector 'Entrada General' a $10.000 con 50 cupos, y un segundo sector 'VIP Networking' a $25.000 con 10 cupos.*  
>  
> *(Tocar botón 'Publicar Evento Oficial') Al presionar publicar, el backend valida los esquemas con Zod y el evento queda disponible al instante tanto en el catálogo como en nuestra pestaña 'Mis Eventos'."*

**2. Dashboard de Ventas y Validación de Ingreso en Puerta (CU-02):**  
> **[ACCIÓN: Ir a la pestaña 'Mis Eventos' y tocar 'Ventas y Cupos' en el evento de Coldplay]**

**[LEER EN VOZ ALTA]:**  
> *"Ahora ingresamos a las métricas del evento de Coldplay (CU-02).*  
>  
> *El panel consolida en tiempo real la recaudación total, el porcentaje global de ocupación y una barra de progreso que desglosa cupos vendidos vs cupos disponibles por cada tipo de entrada.*  
>  
> *En la lista inferior de asistentes simulamos el control de acceso en puerta:*  
> *(Tocar botón 'Validar Ingreso' en la compra confirmada y confirmar en el modal)*  
> *Al validar, la compra pasa inmediatamente a estado **UTILIZADA**. Esta transición es irreversible y deshabilita cualquier solicitud de reembolso."*

**3. Mensajería / Chat de Asistencia (CU-06):**  
> **[ACCIÓN: Tocar el botón de 'Chat' que acompaña a esa misma compra]**

**[LEER EN VOZ ALTA]:**  
> *"En los casos de uso 05 y 06, cada compra cuenta con un canal directo de mensajería.*  
>  
> *(Escribir y enviar mensaje) Enviamos como organizadores: '¡Hola! Recordá que el ingreso al estadio es por la Puerta 4'. El mensaje queda persistido en el chat de la orden."*

> **[ACCIÓN: Ir a la pestaña 'Perfil' -> Tocar 'Cerrar Sesión'. Iniciar sesión como Comprador: `comprador@demo.com` / `comprador123`)]**

---

#### 🎟️ ACTO 2: Rol Comprador — Catálogo, Compra, Ticket QR, Reembolso y Reseña (5:00 - 7:30)
*(Usuario: `comprador@demo.com` / `comprador123`)*

**4. Catálogo, Búsqueda, Filtros y Reputación (CU-03, CU-10, CU-11):**  
> **[ACCIÓN: Estamos en la pestaña 'Explorar'. Escribir en el buscador 'Tech']**

**[LEER EN VOZ ALTA]:**  
> *"Ahora ingresamos como Comprador. Nos encontramos en la pantalla de Explorar.*  
>  
> *(CU-03) Al escribir en el buscador, el hook `useDebounce` aguarda 350 milisegundos tras la última tecla antes de consultar al backend, optimizando el consumo de red.*  
> *(CU-03) Podemos filtrar por categorías mediante los chips horizontales.*  
> *(CU-11) Al abrir el modal de ordenamiento, podemos ordenar los eventos por menor precio, mayor precio, fecha próxima o mejor reputación.*  
> *(CU-10) En la tarjeta del evento que acabamos de crear en el Acto 1, observamos la insignia de estrellas y la reputación histórica del organizador."*

**5. Flujo Transaccional de Compra en Dos Pasos (CU-12):**  
> **[ACCIÓN: Tocar la tarjeta del evento 'DDS Tech Summit 2026' y tocar 'Comprar Entradas']**

**[LEER EN VOZ ALTA]:**  
> *"Ingresamos al detalle del evento y presionamos 'Comprar Entradas' para ejecutar el flujo transaccional en dos pasos (CU-12):*  
>  
> *En el **Paso 1**, elegimos el sector General. El selector numérico respeta el límite de stock y calcula el total en tiempo real.*  
> *(Tocar 'Continuar al Pago') Al avanzar, el backend genera la compra en estado **PENDIENTE**, reteniendo los cupos de manera atómica durante 15 minutos para prevenir sobreventas.*  
> *En el **Paso 2**, seleccionamos el medio de pago simulado y tocamos 'Pagar y Confirmar Entradas'. El estado transiciona a **CONFIRMADA** y recibimos la pantalla de éxito."*

**6. Mis Compras, Ticket QR y Días Faltantes (CU-01):**  
> **[ACCIÓN: Ir a la pestaña 'Mis Compras']**

**[LEER EN VOZ ALTA]:**  
> *"En la pestaña 'Mis Compras' se refleja el cumplimiento del caso de uso 01:*  
> *Cada tarjeta muestra el badge dinámico 'Faltan X días para el evento', calculado automáticamente según la fecha actual.*  
>  
> *(Tocar 'Ver Ticket' en la compra de Coldplay) Al abrir el ticket, se despliega el boleto digital perforado con su código QR representativo."*

**7. Reglas de Negocio / Caminos Tristes de Cancelación y Reembolso (CU-07, CU-08):**  
> **[ACCIÓN: Cerrar el QR y señalar el botón 'Solicitar Reembolso' en la compra de DDS Tech Summit]**

**[LEER EN VOZ ALTA]:**  
> *"En cuanto a las cancelaciones (CU-07 y CU-08), el sistema solo permite solicitar el reembolso si la entrada NO fue utilizada y el evento no se ha llevado a cabo.*  
>  
> *Al confirmar un reembolso, el backend cancela la orden y libera inmediatamente los cupos retenidos, reintegrándolos al inventario del evento."*

**8. Respuesta en Chat de Soporte (CU-05):**  
> **[ACCIÓN: Tocar el botón de Chat en la compra de Coldplay]**

**[LEER EN VOZ ALTA]:**  
> *"Ingresamos al chat de la compra de Coldplay (CU-05):*  
> *Vemos el mensaje que nos envió el Organizador en el Acto 1. Respondemos: '¡Excelente, muchas gracias por avisar!'.*  
> *La pantalla actualiza los mensajes mediante polling cada 4 segundos. Si la compra estuviera cancelada, el backend respondería con error 422 y la interfaz bloquearía el envío."*

**9. Calificación y Reseña Post-Evento (CU-09, CU-10):**  
> **[ACCIÓN: Volver a 'Mis Compras' y señalar que en la compra de Coldplay el botón 'Dejar Reseña' está activo porque la marcamos como UTILIZADA en el Acto 1]**

**[LEER EN VOZ ALTA]:**  
> *"Para cerrar el ciclo, el caso de uso 09 exige que únicamente los usuarios que hayan asistido al evento puedan opinar.*  
>  
> *Como en el Acto 1 validamos esta entrada en puerta y su estado es **UTILIZADA**, el botón 'Dejar Reseña' se encuentra habilitado:*  
> *(Tocar 'Dejar Reseña', seleccionar 5 estrellas y escribir: 'Excelente sonido y accesos impecables')*  
> *Al enviar, el backend persiste la reseña y recalcula el puntaje promedio del organizador, actualizando su reputación de cara a futuros eventos."*

---

### 🔹 BLOQUE 5: Reflexión Crítica sobre el Desarrollo Asistido por IA (7:30 - 8:50)

> **[PANTALLA: Cámara web del alumno o VS Code mostrando la estructura del proyecto]**

**[LEER EN VOZ ALTA]:**  
> *"Para finalizar, comparto una reflexión crítica sobre el impacto pedagógico y práctico de desarrollar este sistema asistido por Inteligencia Artificial:*  
>  
> *En cuanto a **ganancias de productividad**, la IA eliminó de forma drástica el tiempo dedicado a tareas repetitivas: generó rápidamente controladores CRUD, esquemas de validación Zod y componentes estilizados en React Native. Su mayor aporte estuvo en la aceleración del testing, permitiéndonos construir y refinar una suite sólida de 109 pruebas automatizadas con cobertura total de los casos de uso.*  
>  
> *Sin embargo, enfrentamos **fricciones y desafíos reales**:*  
> *En primer lugar, la IA suele sugerir librerías nativas incompatibles con el entorno gestionado de Expo, requiriendo intervención humana constante para reconducirla hacia APIs estándar de React Native.*  
> *En segundo lugar, en la lógica transaccional de reservas de 15 minutos y cálculo de fechas límite, la IA tendía a omitir estados intermedios o desfasajes de zona horaria. Fue indispensable el criterio de ingeniería y modelado de dominio para evitar condiciones de carrera y sobreventa.*  
>  
> *La conclusión metodológica es contundente: la IA es un amplificador de velocidad extraordinario, pero carece de visión arquitectónica. El éxito del proyecto radicó en aplicar principios formales de diseño: Clean Architecture, DDD, separación de responsabilidades y un arnés de tests riguroso que verifique cada regla del negocio."*

---

### 🔹 BLOQUE 6: Cierre y Despedida (8:50 - 9:15)

> **[PANTALLA: Pantalla principal de la aplicación o Diapositiva final]**

**[LEER EN VOZ ALTA]:**  
> *"Ticket-It cubre con solvencia los 12 casos de uso del Trabajo Práctico, respetando los estándares de diseño y accesibilidad exigidos por la cátedra.*  
>  
> *Muchas gracias por su tiempo y atención."*
