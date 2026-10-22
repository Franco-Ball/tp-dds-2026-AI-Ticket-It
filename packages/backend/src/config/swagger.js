const respuestaError = (description) => ({
  description,
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
});

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "AI Ticket It — API REST",
    version: "1.0.0",
    description: `
**AI Ticket It** es una plataforma integral para la publicación de eventos y venta de entradas segmentadas por tipo y cupo, desarrollada con Node.js, Express y React Native (Expo) para la cátedra **Diseño de Sistemas (UTN FRBA - 2C 2026)**.

### 🔑 Credenciales Demo para Pruebas Rápidas:
- **Comprador:** \`comprador@demo.com\` / \`comprador123\` (Rol: \`COMPRADOR\`)
- **Organizador:** \`organizador@demo.com\` / \`organizador123\` (Rol: \`ORGANIZADOR\`)

Para probar endpoints protegidos, iniciá sesión en \`/api/auth/login\`, copiá el token y pegalo arriba a la derecha en el botón **Authorize** (\`Bearer <token>\`).
    `,
  },
  servers: [
    {
      url: "/api",
      description: "Servidor API (/api)",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Registro, autenticación de usuarios y perfil (JWT)",
    },
    {
      name: "Categorías",
      description: "Catálogo de categorías de espectáculos (Recitales, Teatro, etc.)",
    },
    {
      name: "Eventos",
      description: "Publicación de eventos, catálogo público, filtros y ordenamiento (CU-03, CU-04, CU-11)",
    },
    {
      name: "Organizadores",
      description: "Eventos asociados a organizadores",
    },
    {
      name: "Compras",
      description: "Circuito de compra, reserva de cupos por 15 min, pagos, seguimiento y reembolsos (CU-01, CU-02, CU-07, CU-08, CU-12)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Ingresá tu token JWT obtenido en /api/auth/login",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "fail" },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "Mensaje descriptivo del error" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", example: "user-1" },
          nombre: { type: "string", example: "Carlos" },
          apellido: { type: "string", example: "Comprador" },
          email: { type: "string", format: "email", example: "comprador@demo.com" },
          rol: { type: "string", enum: ["COMPRADOR", "ORGANIZADOR"], example: "COMPRADOR" },
          favoritos: { type: "array", items: { type: "string" }, example: ["event-1"] },
        },
      },
      RegistroRequest: {
        type: "object",
        required: ["nombre", "apellido", "email", "password"],
        properties: {
          nombre: { type: "string", example: "Juan" },
          apellido: { type: "string", example: "Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "secreto123" },
          rol: { type: "string", enum: ["COMPRADOR", "ORGANIZADOR"], default: "COMPRADOR", example: "COMPRADOR" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "comprador@demo.com" },
          password: { type: "string", example: "comprador123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          usuario: { $ref: "#/components/schemas/Usuario" },
        },
      },
      Categoria: {
        type: "object",
        properties: {
          id: { type: "string", example: "cat-1" },
          nombre: { type: "string", example: "Recitales" },
          descripcion: { type: "string", example: "Conciertos de música en vivo y recitales" },
        },
      },
      TipoEntrada: {
        type: "object",
        properties: {
          id: { type: "string", example: "event-1-tipo-1" },
          nombre: { type: "string", example: "Campo General" },
          descripcion: { type: "string", example: "Acceso frente al escenario principal" },
          precio: { type: "number", example: 18000 },
          cupoTotal: { type: "integer", example: 800 },
          cupoDisponible: { type: "integer", example: 798 },
        },
      },
      Evento: {
        type: "object",
        properties: {
          id: { type: "string", example: "event-1" },
          nombre: { type: "string", example: "Coldplay - Music of the Spheres World Tour" },
          descripcion: { type: "string", example: "La emblemática banda británica en el Estadio Monumental." },
          categoriaId: { type: "string", example: "cat-1" },
          fecha: { type: "string", format: "date-time", example: "2026-12-10T21:00:00.000Z" },
          organizadorId: { type: "string", example: "user-2" },
          multimedia: {
            type: "array",
            items: { type: "string", format: "uri" },
            example: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200"],
          },
          tiposEntrada: {
            type: "array",
            items: { $ref: "#/components/schemas/TipoEntrada" },
          },
          precioMinimo: { type: "number", example: 18000 },
          precioMaximo: { type: "number", example: 45000 },
          cupoTotalDisponible: { type: "integer", example: 1248 },
          puntajePromedio: { type: "number", example: 4.8 },
        },
      },
      CrearEventoRequest: {
        type: "object",
        required: ["nombre", "descripcion", "categoriaId", "fecha", "tiposEntrada"],
        properties: {
          nombre: { type: "string", example: "Festival Primavera Rock 2026" },
          descripcion: { type: "string", example: "Gran festival con bandas en vivo al aire libre." },
          categoriaId: { type: "string", example: "cat-1" },
          fecha: { type: "string", format: "date-time", example: "2026-12-15T18:00:00.000Z" },
          multimedia: {
            type: "array",
            items: { type: "string", format: "uri" },
            example: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200"],
          },
          tiposEntrada: {
            type: "array",
            items: {
              type: "object",
              required: ["nombre", "precio", "cupoTotal"],
              properties: {
                nombre: { type: "string", example: "General" },
                descripcion: { type: "string", example: "Acceso campo" },
                precio: { type: "number", example: 15000 },
                cupoTotal: { type: "integer", example: 500 },
              },
            },
          },
        },
      },
      CambioEstadoCompra: {
        type: "object",
        properties: {
          id: { type: "string", example: "cambio-1" },
          compraId: { type: "string", example: "comp-1" },
          estadoAnterior: { type: "string", nullable: true, example: "PENDIENTE" },
          estadoNuevo: { type: "string", example: "CONFIRMADA" },
          quienId: { type: "string", example: "user-1" },
          fechaHora: { type: "string", format: "date-time" },
          motivo: { type: "string", example: "Pago confirmado vía TARJETA_VISA" },
        },
      },
      Compra: {
        type: "object",
        properties: {
          id: { type: "string", example: "comp-1" },
          compradorId: { type: "string", example: "user-1" },
          eventoId: { type: "string", example: "event-1" },
          tipoEntradaId: { type: "string", example: "event-1-tipo-1" },
          cantidad: { type: "integer", example: 2 },
          precioUnitario: { type: "number", example: 18000 },
          total: { type: "number", example: 36000 },
          estado: {
            type: "string",
            enum: ["PENDIENTE", "CONFIRMADA", "UTILIZADA", "CANCELADA", "REEMBOLSADA"],
            example: "CONFIRMADA",
          },
          fechaCompra: { type: "string", format: "date-time" },
          fechaExpiracion: { type: "string", format: "date-time", nullable: true },
          diasFaltantes: { type: "integer", nullable: true, example: 45 },
          eventoFinalizado: { type: "boolean", nullable: true, example: false },
          historialEstados: {
            type: "array",
            items: { $ref: "#/components/schemas/CambioEstadoCompra" },
          },
          evento: {
            type: "object",
            properties: {
              id: { type: "string", example: "event-1" },
              nombre: { type: "string", example: "Coldplay - Music of the Spheres World Tour" },
              fecha: { type: "string", format: "date-time" },
            },
          },
          tipoEntrada: {
            type: "object",
            properties: {
              id: { type: "string", example: "event-1-tipo-1" },
              nombre: { type: "string", example: "Campo General" },
              precio: { type: "number", example: 18000 },
            },
          },
        },
      },
      CrearCompraRequest: {
        type: "object",
        required: ["eventoId", "tipoEntradaId", "cantidad"],
        properties: {
          eventoId: { type: "string", example: "event-1" },
          tipoEntradaId: { type: "string", example: "event-1-tipo-1" },
          cantidad: { type: "integer", minimum: 1, example: 2 },
        },
      },
      RegistrarPagoRequest: {
        type: "object",
        properties: {
          metodoPago: { type: "string", example: "TARJETA_CREDITO_VISA" },
        },
      },
      ActualizarEstadoRequest: {
        type: "object",
        required: ["estado"],
        properties: {
          estado: {
            type: "string",
            enum: ["CANCELADA", "REEMBOLSADA", "UTILIZADA"],
            example: "REEMBOLSADA",
          },
          motivo: { type: "string", example: "Conflicto de fecha por viaje laboral" },
        },
      },
      ComprasEventoResponse: {
        type: "object",
        properties: {
          eventoId: { type: "string", example: "event-1" },
          nombreEvento: { type: "string", example: "Coldplay - Music of the Spheres World Tour" },
          fechaEvento: { type: "string", format: "date-time" },
          totalRecaudado: { type: "number", example: 36000 },
          totalEntradasVendidas: { type: "integer", example: 2 },
          cuposPorTipoEntrada: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tipoEntradaId: { type: "string", example: "event-1-tipo-1" },
                nombre: { type: "string", example: "Campo General" },
                precio: { type: "number", example: 18000 },
                cupoTotal: { type: "integer", example: 800 },
                cupoDisponible: { type: "integer", example: 798 },
                entradasVendidas: { type: "integer", example: 2 },
              },
            },
          },
          compras: {
            type: "array",
            items: { $ref: "#/components/schemas/Compra" },
          },
        },
      },
    },
  },
  paths: {
    // --- AUTH ---
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario (Comprador u Organizador)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistroRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario registrado exitosamente con token JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: respuestaError("Formato de solicitud inválido"),
          409: respuestaError("Email ya registrado previamente"),
          422: respuestaError("Fallo de validación semántica"),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión y obtener token JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login exitoso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: respuestaError("Credenciales inválidas (email o contraseña incorrectos)"),
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener perfil del usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Perfil de usuario",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
          401: respuestaError("Token no provisto o expirado"),
        },
      },
    },

    // --- CATEGORÍAS ---
    "/categorias": {
      get: {
        tags: ["Categorías"],
        summary: "Listar todas las categorías de eventos disponibles",
        responses: {
          200: {
            description: "Listado de categorías",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Categoria" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categorías"],
        summary: "Crear una nueva categoría (solo rol ORGANIZADOR)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre"],
                properties: {
                  nombre: { type: "string", example: "Muestras de Arte" },
                  descripcion: { type: "string", example: "Galerías y exposiciones" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Categoría creada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Categoria" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Acceso denegado (requiere rol ORGANIZADOR)"),
          409: respuestaError("Nombre de categoría ya existente"),
        },
      },
    },
    "/categorias/{id}": {
      get: {
        tags: ["Categorías"],
        summary: "Obtener categoría por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "cat-1",
          },
        ],
        responses: {
          200: {
            description: "Detalle de la categoría",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Categoria" },
              },
            },
          },
          404: respuestaError("Categoría no encontrada"),
        },
      },
    },

    // --- EVENTOS ---
    "/eventos": {
      get: {
        tags: ["Eventos"],
        summary: "Catálogo público de espectáculos con búsqueda, filtros y ordenamiento (CU-03, CU-11)",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Búsqueda textual sobre nombre y descripción",
            schema: { type: "string" },
            example: "Rock",
          },
          {
            name: "categoria",
            in: "query",
            description: "Filtrar por ID de categoría",
            schema: { type: "string" },
            example: "cat-1",
          },
          {
            name: "minPrecio",
            in: "query",
            description: "Precio mínimo",
            schema: { type: "number" },
          },
          {
            name: "maxPrecio",
            in: "query",
            description: "Precio máximo",
            schema: { type: "number" },
          },
          {
            name: "organizadorId",
            in: "query",
            description: "Filtrar por ID de organizador",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Criterio de ordenamiento (precio, fecha, puntaje)",
            schema: { type: "string", enum: ["precio", "fecha", "puntaje"], default: "fecha" },
          },
          {
            name: "order",
            in: "query",
            description: "Dirección del ordenamiento",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          200: {
            description: "Listado de eventos del catálogo",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Evento" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Eventos"],
        summary: "Publicar nuevo evento con tipos de entrada segmentados (solo rol ORGANIZADOR - CU-04)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearEventoRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Evento publicado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Evento" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Solo usuarios con rol ORGANIZADOR pueden publicar eventos"),
          404: respuestaError("Categoría no encontrada"),
          422: respuestaError("Fecha no válida o no futura, o tipos de entrada vacíos"),
        },
      },
    },
    "/eventos/{id}": {
      get: {
        tags: ["Eventos"],
        summary: "Detalle completo de un evento con organizador y tipos de entrada (CU-10)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "event-1",
          },
        ],
        responses: {
          200: {
            description: "Detalle del evento",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Evento" },
              },
            },
          },
          404: respuestaError("Evento no encontrado"),
        },
      },
    },
    "/eventos/{id}/compras": {
      get: {
        tags: ["Eventos", "Compras"],
        summary: "Supervisar compras y cupos restantes de un evento (solo Organizador dueño - CU-02)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "event-1",
          },
        ],
        responses: {
          200: {
            description: "Listado de compras, desglose de cupos y total recaudado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComprasEventoResponse" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Acceso denegado: solo el organizador dueño del evento puede ver sus compras"),
          404: respuestaError("Evento no encontrado"),
        },
      },
    },

    // --- ORGANIZADORES ---
    "/organizadores/{id}/eventos": {
      get: {
        tags: ["Organizadores", "Eventos"],
        summary: "Listar eventos propios creados por un organizador específico",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "user-2",
          },
        ],
        responses: {
          200: {
            description: "Eventos del organizador",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Evento" },
                },
              },
            },
          },
          404: respuestaError("Organizador no encontrado"),
        },
      },
    },

    // --- COMPRAS ---
    "/compras": {
      post: {
        tags: ["Compras"],
        summary: "Adquirir entradas — Reserva de cupo en estado PENDIENTE por 15 min (solo COMPRADOR - CU-12)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearCompraRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Compra reservada con éxito en estado PENDIENTE",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Compra" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Solo usuarios con rol COMPRADOR pueden comprar entradas"),
          404: respuestaError("Evento o tipo de entrada no encontrado"),
          422: respuestaError("Cupo insuficiente para la cantidad solicitada o evento finalizado"),
        },
      },
    },
    "/compras/mis-compras": {
      get: {
        tags: ["Compras"],
        summary: "Historial de compras del comprador con cálculo dinámico de días faltantes (CU-01)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Historial de compras del comprador autenticado",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Compra" },
                },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Solo usuarios con rol COMPRADOR pueden consultar sus compras"),
        },
      },
    },
    "/compras/{id}": {
      get: {
        tags: ["Compras"],
        summary: "Detalle completo de una compra con historial de estados y auditoría",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "comp-1",
          },
        ],
        responses: {
          200: {
            description: "Detalle de la compra",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Compra" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("No tienes permiso para ver esta compra"),
          404: respuestaError("Compra no encontrada"),
        },
      },
    },
    "/compras/{id}/pagos": {
      post: {
        tags: ["Compras"],
        summary: "Registrar pago de una compra PENDIENTE y pasarla a CONFIRMADA",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "comp-1",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistrarPagoRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Pago aprobado y compra CONFIRMADA",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Compra" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("No eres el titular de la compra"),
          404: respuestaError("Compra no encontrada"),
          422: respuestaError("La reserva ha expirado por superar los 15 minutos (cupo liberado) o transición no permitida"),
        },
      },
    },
    "/compras/{id}/estado": {
      patch: {
        tags: ["Compras"],
        summary: "Actualización de estado en REST puro: Reembolsos (CU-07, CU-08), Cancelaciones y Utilización",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "comp-1",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ActualizarEstadoRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Estado actualizado exitosamente (con reintegro de cupo si fue cancelada/reembolsada)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Compra" },
              },
            },
          },
          401: respuestaError("No autenticado"),
          403: respuestaError("Permisos insuficientes para realizar esta transición"),
          404: respuestaError("Compra no encontrada"),
          422: respuestaError("No es posible cancelar una compra ya UTILIZADA o cuyo evento ya se realizó"),
        },
      },
    },
  },
};
