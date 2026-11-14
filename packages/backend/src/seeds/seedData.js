import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";
import { RolUsuario } from "../models/enums.js";
import { Categoria } from "../models/Categoria.js";
import { Evento } from "../models/Evento.js";
import { TipoEntrada } from "../models/TipoEntrada.js";
import { Compra } from "../models/Compra.js";
import { EstadoCompra } from "../models/enums.js";
import { Mensaje } from "../models/Mensaje.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { MensajeRepository } from "../repositories/MensajeRepository.js";
import { Resenia } from "../models/Resenia.js";
import { ReseniaRepository } from "../repositories/ReseniaRepository.js";
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
  {
    nombre: "Lucía",
    apellido: "Gómez",
    email: "lucia@demo.com",
    passwordPlano: "lucia123",
    rol: RolUsuario.COMPRADOR,
  },
  {
    nombre: "Marcos",
    apellido: "Rossi",
    email: "marcos@demo.com",
    passwordPlano: "marcos123",
    rol: RolUsuario.COMPRADOR,
  },
  {
    nombre: "Sofía",
    apellido: "Fernández",
    email: "sofia@demo.com",
    passwordPlano: "sofia123",
    rol: RolUsuario.COMPRADOR,
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
          nombre: "Duki - A.D.A. Tour Estadio Vélez",
          descripcion: "El líder del movimiento urbano argentino presenta su álbum Antes de Ameri con una puesta en escena monumental, invitados estelares y sonido envolvente.",
          categoriaId: categoriasGuardadas["Recitales"]?.id,
          fecha: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Campo Delantero VIP",
              descripcion: "Sector exclusivo más cercano a la pasarela principal.",
              precio: 32000,
              cupoTotal: 600,
              cupoDisponible: 600,
            }),
            new TipoEntrada({
              nombre: "Campo General",
              descripcion: "Acceso a campo general de pie.",
              precio: 19000,
              cupoTotal: 1500,
              cupoDisponible: 1500,
            }),
            new TipoEntrada({
              nombre: "Platea Alta Norte",
              descripcion: "Ubicación en altura con excelente visual del escenario.",
              precio: 24000,
              cupoTotal: 400,
              cupoDisponible: 400,
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
          nombre: "Les Luthiers - Gran Reserva Histórica",
          descripcion: "Una antología antológica con las obras más celebradas del genial conjunto humorístico-musical en el Teatro Coliseo.",
          categoriaId: categoriasGuardadas["Teatro"]?.id,
          fecha: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Platea Preferencial",
              descripcion: "Primeras 10 filas de platea baja central.",
              precio: 22000,
              cupoTotal: 120,
              cupoDisponible: 120,
            }),
            new TipoEntrada({
              nombre: "Pullman Central",
              descripcion: "Sector alto del teatro con excelente acústica.",
              precio: 11000,
              cupoTotal: 250,
              cupoDisponible: 250,
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
        {
          nombre: "Torneo ATP de Buenos Aires - Cuartos de Final",
          descripcion: "Las mejores raquetas del circuito mundial sobre polvo de ladrillo en el mítico Buenos Aires Lawn Tennis Club.",
          categoriaId: categoriasGuardadas["Deportes"]?.id,
          fecha: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Tribuna Lateral",
              descripcion: "Ubicación lateral con vista panorámica del court central.",
              precio: 15000,
              cupoTotal: 500,
              cupoDisponible: 500,
            }),
            new TipoEntrada({
              nombre: "Palco VIP Guillermo Vilas",
              descripcion: "Butacas a nivel de cancha con acceso a Hospitality VIP.",
              precio: 42000,
              cupoTotal: 80,
              cupoDisponible: 80,
            }),
          ],
        },
        {
          nombre: "Festival Rock Nacional 2025",
          descripcion: "La edición histórica anterior que convocó a más de 30.000 personas en el predio de San Isidro.",
          categoriaId: categoriasGuardadas["Festivales"]?.id,
          fecha: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          organizadorId: organizador.id,
          multimedia: [
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
          ],
          tiposEntrada: [
            new TipoEntrada({
              nombre: "Entrada General",
              descripcion: "Acceso al predio completo.",
              precio: 20000,
              cupoTotal: 1000,
              cupoDisponible: 999,
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

  // 4. Cargar Compras Iniciales y Mensajes de Chat
  const compradorCarlos = usuariosGuardados["comprador@demo.com"];
  const compradoraLucia = usuariosGuardados["lucia@demo.com"];
  const compradorMarcos = usuariosGuardados["marcos@demo.com"];
  const compradoraSofia = usuariosGuardados["sofia@demo.com"];

  const comprasExistentes = await CompraRepository.buscarTodos();
  if (comprasExistentes.length === 0) {
    const eventos = await EventoRepository.buscarTodos();
    const coldplay = eventos.find((e) => e.nombre.includes("Coldplay"));
    const duki = eventos.find((e) => e.nombre.includes("Duki"));
    const gronholm = eventos.find((e) => e.nombre.includes("Grönholm"));
    const lesLuthiers = eventos.find((e) => e.nombre.includes("Les Luthiers"));
    const atp = eventos.find((e) => e.nombre.includes("ATP"));
    const rockNacional = eventos.find((e) => e.nombre.includes("Rock Nacional"));

    // --- Compras de Carlos ---
    if (compradorCarlos) {
      if (coldplay && coldplay.tiposEntrada.length > 0) {
        const tipoCampo = coldplay.tiposEntrada[0];
        tipoCampo.decrementarCupo(2);
        await EventoRepository.guardar(coldplay);

        const compraCarlosColdplay = new Compra({
          compradorId: compradorCarlos.id,
          eventoId: coldplay.id,
          tipoEntradaId: tipoCampo.id,
          cantidad: 2,
          precioUnitario: tipoCampo.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        });
        const guardadaCarlos = await CompraRepository.guardar(compraCarlosColdplay);

        // Mensajes de chat en compra de Carlos
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaCarlos.id,
            usuarioId: compradorCarlos.id,
            mensaje: "¡Hola! ¿A qué hora se habilita el acceso general al estadio?",
            fechaEnvio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          })
        );
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaCarlos.id,
            usuarioId: organizador.id,
            mensaje: "¡Hola Carlos! Las puertas abren a las 17:00 hs. Te sugerimos llegar con antelación para agilizar el ingreso.",
            fechaEnvio: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          })
        );
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaCarlos.id,
            usuarioId: compradorCarlos.id,
            mensaje: "¡Buenísimo, muchas gracias por la información!",
            fechaEnvio: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
          })
        );
      }

      if (gronholm && gronholm.tiposEntrada.length > 0) {
        const tipoPullman = gronholm.tiposEntrada[0];
        tipoPullman.decrementarCupo(1);
        await EventoRepository.guardar(gronholm);

        const compraPendiente = new Compra({
          compradorId: compradorCarlos.id,
          eventoId: gronholm.id,
          tipoEntradaId: tipoPullman.id,
          cantidad: 1,
          precioUnitario: tipoPullman.precio,
          estado: EstadoCompra.PENDIENTE,
          fechaCompra: new Date().toISOString(),
        });
        await CompraRepository.guardar(compraPendiente);
      }

      if (rockNacional && rockNacional.tiposEntrada.length > 0) {
        const tipoGeneral = rockNacional.tiposEntrada[0];
        const compraUtilizada = new Compra({
          compradorId: compradorCarlos.id,
          eventoId: rockNacional.id,
          tipoEntradaId: tipoGeneral.id,
          cantidad: 1,
          precioUnitario: tipoGeneral.precio,
          estado: EstadoCompra.UTILIZADA,
          fechaCompra: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await CompraRepository.guardar(compraUtilizada);

        // 5. Cargar Reseña Histórica y Reputación Inicial (CU-09, CU-10)
        const reseniasExistentes = await ReseniaRepository.buscarTodos();
        if (reseniasExistentes.length === 0 && organizador) {
          const reseniaInicial = new Resenia({
            compradorId: compradorCarlos.id,
            eventoId: rockNacional.id,
            organizadorId: organizador.id,
            puntuacion: 5,
            detalle: "Excelente producción técnica y acústica. Los accesos estuvieron impecables y muy ordenados.",
            fecha: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
          });
          await ReseniaRepository.guardar(reseniaInicial);

          // Actualizar reputación inicial en los eventos del organizador
          const repInfo = await ReseniaRepository.calcularReputacionOrganizador(organizador.id);
          for (const ev of eventos) {
            if (ev.organizadorId === organizador.id) {
              ev.puntajePromedio = repInfo.reputacion;
              await EventoRepository.guardar(ev);
            }
          }
        }
      }
    }

    // --- Compras y Chat de Lucía ---
    if (compradoraLucia) {
      if (coldplay && coldplay.tiposEntrada.length > 1) {
        const tipoPlatea = coldplay.tiposEntrada[1]; // Platea Alta
        tipoPlatea.decrementarCupo(1);
        await EventoRepository.guardar(coldplay);

        const compraLucia = new Compra({
          compradorId: compradoraLucia.id,
          eventoId: coldplay.id,
          tipoEntradaId: tipoPlatea.id,
          cantidad: 1,
          precioUnitario: tipoPlatea.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
        const guardadaLucia = await CompraRepository.guardar(compraLucia);

        // Mensajes de chat entre Lucía y Olga
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaLucia.id,
            usuarioId: compradoraLucia.id,
            mensaje: "Buenas tardes, ¿el sector Platea Alta cuenta con rampa para personas con movilidad reducida?",
            fechaEnvio: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          })
        );
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaLucia.id,
            usuarioId: organizador.id,
            mensaje: "¡Hola Lucía! Sí, por el Acceso 2 de Figueroa Alcorta contás con ascensores y personal de asistencia.",
            fechaEnvio: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          })
        );
      }

      if (duki && duki.tiposEntrada.length > 0) {
        const tipoVip = duki.tiposEntrada[0];
        tipoVip.decrementarCupo(2);
        await EventoRepository.guardar(duki);

        const compraLuciaDuki = new Compra({
          compradorId: compradoraLucia.id,
          eventoId: duki.id,
          tipoEntradaId: tipoVip.id,
          cantidad: 2,
          precioUnitario: tipoVip.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await CompraRepository.guardar(compraLuciaDuki);
      }
    }

    // --- Compras y Chat de Marcos ---
    if (compradorMarcos) {
      if (gronholm && gronholm.tiposEntrada.length > 1) {
        const tipoPlateaBaja = gronholm.tiposEntrada[1];
        tipoPlateaBaja.decrementarCupo(2);
        await EventoRepository.guardar(gronholm);

        const compraMarcos = new Compra({
          compradorId: compradorMarcos.id,
          eventoId: gronholm.id,
          tipoEntradaId: tipoPlateaBaja.id,
          cantidad: 2,
          precioUnitario: tipoPlateaBaja.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        });
        const guardadaMarcos = await CompraRepository.guardar(compraMarcos);

        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaMarcos.id,
            usuarioId: compradorMarcos.id,
            mensaje: "¿Hay estacionamiento con convenio o descuento en el Paseo La Plaza?",
            fechaEnvio: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          })
        );
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaMarcos.id,
            usuarioId: organizador.id,
            mensaje: "Hola Marcos. Sí, presentando la entrada en el garage contiguo de Corrientes 1660 tenés 20% de descuento.",
            fechaEnvio: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
          })
        );
      }

      if (atp && atp.tiposEntrada.length > 0) {
        const tipoTribuna = atp.tiposEntrada[0];
        tipoTribuna.decrementarCupo(2);
        await EventoRepository.guardar(atp);

        const compraMarcosAtp = new Compra({
          compradorId: compradorMarcos.id,
          eventoId: atp.id,
          tipoEntradaId: tipoTribuna.id,
          cantidad: 2,
          precioUnitario: tipoTribuna.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await CompraRepository.guardar(compraMarcosAtp);
      }
    }

    // --- Compras y Chat de Sofía ---
    if (compradoraSofia) {
      if (lesLuthiers && lesLuthiers.tiposEntrada.length > 0) {
        const tipoPlatea = lesLuthiers.tiposEntrada[0];
        tipoPlatea.decrementarCupo(2);
        await EventoRepository.guardar(lesLuthiers);

        const compraSofia = new Compra({
          compradorId: compradoraSofia.id,
          eventoId: lesLuthiers.id,
          tipoEntradaId: tipoPlatea.id,
          cantidad: 2,
          precioUnitario: tipoPlatea.precio,
          estado: EstadoCompra.CONFIRMADA,
          fechaCompra: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        });
        const guardadaSofia = await CompraRepository.guardar(compraSofia);

        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaSofia.id,
            usuarioId: compradoraSofia.id,
            mensaje: "Hola, ¿la obra tiene intervalo o es continuada?",
            fechaEnvio: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          })
        );
        await MensajeRepository.guardar(
          new Mensaje({
            compraId: guardadaSofia.id,
            usuarioId: organizador.id,
            mensaje: "¡Hola Sofía! La función es continuada, con una duración aproximada de 1 hora y 45 minutos.",
            fechaEnvio: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          })
        );
      }
    }
  }

  inMemoryStore.isInitialized = true;
  if (process.env.NODE_ENV !== "test") {
    console.log("🌱 Datos semilla cargados exitosamente en InMemoryStore (Usuarios, Categorías, Eventos, Compras, Reseñas y Mensajes de Chat).");
  }
}
