import { Evento } from "../models/Evento.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class EventoService {
  constructor(
    eventoRepository = EventoRepository,
    categoriaRepository = CategoriaRepository,
    usuarioRepository = UsuarioRepository
  ) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  crearEvento = async ({
    organizadorId,
    nombre,
    descripcion,
    categoriaId,
    fecha,
    multimedia = [],
    tiposEntrada = [],
  }) => {
    // Validar organizador
    const organizador = await this.usuarioRepository.buscarPorId(organizadorId);
    if (!organizador) {
      throw new NotFoundError(`No se encontró el organizador con id '${organizadorId}'`);
    }
    if (!organizador.esOrganizador()) {
      throw new UnprocessableEntityError("El usuario especificado no posee el rol ORGANIZADOR");
    }

    // Validar categoría existente
    const categoria = await this.categoriaRepository.buscarPorId(categoriaId);
    if (!categoria) {
      throw new NotFoundError(`Categoría '${categoriaId}' no encontrada`);
    }

    // Validar fecha futura
    const fechaObj = new Date(fecha);
    if (fechaObj <= new Date()) {
      throw new UnprocessableEntityError("La fecha del evento debe ser posterior a la fecha actual");
    }

    const nuevoEvento = new Evento({
      nombre,
      descripcion,
      categoriaId,
      fecha: fechaObj.toISOString(),
      organizadorId,
      multimedia,
      tiposEntrada,
    });

    const guardado = await this.eventoRepository.guardar(nuevoEvento);
    return guardado.toJSON();
  };

  listarEventos = async (filtros = {}) => {
    const eventos = await this.eventoRepository.buscarTodos(filtros);
    return eventos.map((e) => e.toJSON());
  };

  obtenerPorId = async (id) => {
    const evento = await this.eventoRepository.buscarPorId(id);
    if (!evento) {
      throw new NotFoundError(`Evento '${id}' no encontrado`);
    }

    const eventoJSON = evento.toJSON();

    // Enriquecer con datos del organizador
    const organizador = await this.usuarioRepository.buscarPorId(evento.organizadorId);
    if (organizador) {
      eventoJSON.organizador = {
        id: organizador.id,
        nombre: organizador.nombre,
        apellido: organizador.apellido,
        email: organizador.email,
      };
    }

    // Enriquecer con datos de categoría
    const categoria = await this.categoriaRepository.buscarPorId(evento.categoriaId);
    if (categoria) {
      eventoJSON.categoria = categoria.toJSON();
    }

    return eventoJSON;
  };

  listarPorOrganizador = async (organizadorId) => {
    const organizador = await this.usuarioRepository.buscarPorId(organizadorId);
    if (!organizador) {
      throw new NotFoundError(`Organizador '${organizadorId}' no encontrado`);
    }

    const eventos = await this.eventoRepository.buscarPorOrganizador(organizadorId);
    return eventos.map((e) => e.toJSON());
  };
}
