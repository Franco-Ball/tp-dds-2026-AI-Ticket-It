import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";
import { RolUsuario } from "../models/enums.js";
import { Categoria } from "../models/Categoria.js";
import { Evento } from "../models/Evento.js";
import { TipoEntrada } from "../models/TipoEntrada.js";
import { Compra } from "../models/Compra.js";
import { EstadoCompra } from "../models/enums.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { inMemoryStore } from "../repositories/InMemoryStore.js";

export const USUARIOS_SEMILLA = [
  {
    nombre: "Carlos",
    apellido: "Comprador",
    email: "comprador@demo.com",
    passwordPlano: "comprador123",
    rol: RolUsuario.COMPRADOR,
  },
  {
    nombre: "Olga",
    apellido: "Organizadora",
    email: "organizador@demo.com",
    passwordPlano: "organizador123",
    rol: RolUsuario.ORGANIZADOR,
  },
];

export const CATEGORIAS_SEMILLA = [
  {
    nombre: "Recitales",
    descripcion: "Conciertos, música en vivo y recitales de bandas nacionales e internacionales.",
  },
  {
    nombre: "Teatro",
    descripcion: "Obras teatrales, comedias, dramas y musicales en cartelera.",
  },
  {
    nombre: "Festivales",
    descripcion: "Grandes festivales de música, gastronomía y cultura al aire libre.",
  },
  {
    nombre: "Conferencias",
    descripcion: "Charlas tecnológicas, innovación, diseño y desarrollo de software con IA.",
  },
  {
    nombre: "Deportes",
    descripcion: "Partidos de fútbol, básquet, tenis y competiciones deportivas en vivo.",
  },
];

export async function cargarSeeds(force = false) {
  if (inMemoryStore.isInitialized && !force) {
    return;
  }

  // 1. Cargar Usuarios
  const usuariosGuardados = {};
  for (const item of USUARIOS_SEMILLA) {
    let usuario = await UsuarioRepository.buscarPorEmail(item.email);
    if (!usuario) {
      const passwordHash = bcrypt.hashSync(item.passwordPlano, 10);
      usuario = new Usuario({
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        passwordHash,
        rol: item.rol,
      });
      usuario = await UsuarioRepository.guardar(usuario);
    }
    usuariosGuardados[item.email] = usuario;
  }

  // 2. Cargar Categorías
  const categoriasGuardadas = {};
  for (const cat of CATEGORIAS_SEMILLA) {
    let categoria = await CategoriaRepository.buscarPorNombre(cat.nombre);
    if (!categoria) {
      categoria = new Categoria({
        nombre: cat.nombre,
        descripcion: cat.descripcion,
      });
      categoria = await CategoriaRepository.guardar(categoria);
    }
    categoriasGuardadas[cat.nombre] = categoria;
  }

  // 3. Cargar Eventos
  const organizador = usuariosGuardados["organizador@demo.com"];
  if (organizador) {
    const eventosExistentes = await EventoRepository.buscarTodos();
    if (eventosExistentes.length === 0) {
      const eventosADarDeAlta = [
        {
          nombre: "Coldplay - Music of the Spheres World Tour",
          descripcion: "La emblemática banda británica regresa al Estadio Monumental con un despliegue audiovisual sin precedentes, pulseras lumínicas y todos sus grandes éxitos.",
          categoriaId: categoriasGuardadas["Recitales"]?.id,
          fecha: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Campo General",
              descripcion: "Acceso a campo de pie frente al escenario principal.",
              precio: 18000,
              cupoTotal: 800,
              cupoDisponible: 800,
            }),
            new TipoEntrada({
              nombre: "Platea Alta",
              descripcion: "Ubicación numerada en gradería alta con excelente panorámica.",
              precio: 28000,
              cupoTotal: 300,
              cupoDisponible: 300,
            }),
            new TipoEntrada({
              nombre: "Platea Preferencial VIP",
              descripcion: "Asientos exclusivos frente al escenario, incluye merchandising y consumición.",
              precio: 45000,
              cupoTotal: 150,
              cupoDisponible: 150,
            }),
          ],
        },
        {
          nombre: "Cosquín Rock 2027",
          descripcion: "El festival más federal y potente del país en el Aeródromo de Santa María de Punilla. Más de 100 bandas en 6 escenarios simultáneos.",
          categoriaId: categoriasGuardadas["Festivales"]?.id,
          fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Abono General 2 Días",
              descripcion: "Acceso libre a todos los escenarios ambos días del festival.",
              precio: 35000,
              cupoTotal: 500,
              cupoDisponible: 500,
            }),
            new TipoEntrada({
              nombre: "Fanatic VIP Rock Pass",
              descripcion: "Área VIP elevada, gastronomía libre, estacionamiento preferencial y baños premium.",
              precio: 75000,
              cupoTotal: 100,
              cupoDisponible: 100,
            }),
          ],
        },
        {
          nombre: "El Método Grönholm",
          descripcion: "Cuatro candidatos a un puesto ejecutivo sometidos a una particular y desopilante prueba psicológica de selección en el Paseo La Plaza.",
          categoriaId: categoriasGuardadas["Teatro"]?.id,
          fecha: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Pullman",
              descripcion: "Sector alto del teatro.",
              precio: 8500,
              cupoTotal: 120,
              cupoDisponible: 120,
            }),
            new TipoEntrada({
              nombre: "Platea Baja",
              descripcion: "Ubicación preferencial en primeras filas.",
              precio: 14000,
              cupoTotal: 80,
              cupoDisponible: 80,
            }),
          ],
        },
        {
          nombre: "AI & Modern Software Summit 2026",
          descripcion: "Congreso internacional sobre desarrollo asistido con Inteligencia Artificial, agentes autónomos, LLMs locales y arquitecturas modernas en Ciudad Universitaria.",
          categoriaId: categoriasGuardadas["Conferencias"]?.id,
          fecha: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Pase Estudiante",
              descripcion: "Requiere constancia de alumno regular universitario.",
              precio: 5000,
              cupoTotal: 200,
              cupoDisponible: 200,
            }),
            new TipoEntrada({
              nombre: "Pase Profesional Full",
              descripcion: "Acceso a keynotes, workshops prácticos y networking coffee break.",
              precio: 16000,
              cupoTotal: 250,
              cupoDisponible: 250,
            }),
          ],
        },
        {
          nombre: "Superclásico de Verano",
          descripcion: "El clásico más apasionante del fútbol argentino en el Estadio José María Minella de Mar del Plata.",
          categoriaId: categoriasGuardadas["Deportes"]?.id,
          fecha: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Popular Tribuna General",
              descripcion: "Acceso a tribuna popular de pie.",
              precio: 12000,
              cupoTotal: 1200,
              cupoDisponible: 1200,
            }),
            new TipoEntrada({
              nombre: "Platea Descubierta",
              descripcion: "Butaca individual lateral.",
              precio: 22000,
              cupoTotal: 400,
              cupoDisponible: 400,
            }),
            new TipoEntrada({
              nombre: "Platea Techada Numerada",
              descripcion: "Sector techado central con mejor visibilidad.",
              precio: 35000,
              cupoTotal: 200,
              cupoDisponible: 200,
            }),
          ],
        },
      ];

      for (const evData of eventosADarDeAlta) {
        if (evData.categoriaId) {
          const evento = new Evento(evData);
          await EventoRepository.guardar(evento);
        }
      }
    }
  }

  // 4. Cargar Compras Iniciales para Comprador Demo
  const comprador = usuariosGuardados["comprador@demo.com"];
  if (comprador) {
    const comprasExistentes = await CompraRepository.buscarTodos();
    if (comprasExistentes.length === 0) {
      const eventos = await EventoRepository.buscarTodos();
      const coldplay = eventos.find((e) => e.nombre.includes("Coldplay"));
      const gronholm = eventos.find((e) => e.nombre.includes("Grönholm"));

      if (coldplay && coldplay.tiposEntrada.length > 0) {
        const tipoCampo = coldplay.tiposEntrada[0];
        tipoCampo.decrementarCupo(2);
        await EventoRepository.guardar(coldplay);

        const compraConfirmada = new Compra({
          compradorId: comprador.id,
          eventoId: coldplay.id,
          tipoEntradaId: tipoCampo.id,
          cantidad: 2,
          precioUnitario: tipoCampo.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await CompraRepository.guardar(compraConfirmada);
      }

      if (gronholm && gronholm.tiposEntrada.length > 0) {
        const tipoPullman = gronholm.tiposEntrada[0];
        tipoPullman.decrementarCupo(1);
        await EventoRepository.guardar(gronholm);

        const compraPendiente = new Compra({
          compradorId: comprador.id,
          eventoId: gronholm.id,
          tipoEntradaId: tipoPullman.id,
          cantidad: 1,
          precioUnitario: tipoPullman.precio,
          estado: EstadoCompra.PENDIENTE,
          fechaCompra: new Date().toISOString(),
        });
        await CompraRepository.guardar(compraPendiente);
      }
    }
  }

  inMemoryStore.isInitialized = true;
  if (process.env.NODE_ENV !== "test") {
    console.log("🌱 Datos semilla cargados exitosamente en InMemoryStore (Usuarios, Categorías, Eventos y Compras).");
  }
}
