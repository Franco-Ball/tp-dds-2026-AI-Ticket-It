import { Evento } from "../models/Evento.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { ReseniaRepository } from "../repositories/ReseniaRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class EventoService {
  constructor(
    eventoRepository = EventoRepository,
    categoriaRepository = CategoriaRepository,
    usuarioRepository = UsuarioRepository,
    reseniaRepository = ReseniaRepository
  ) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
    this.usuarioRepository = usuarioRepository;
    this.reseniaRepository = reseniaRepository;
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

    // Calcular reputación actual del organizador si ya tiene
    const repInfo = await this.reseniaRepository.calcularReputacionOrganizador(organizadorId);

    const nuevoEvento = new Evento({
      nombre,
      descripcion,
      categoriaId,
      fecha: fechaObj.toISOString(),
      organizadorId,
      multimedia,
      tiposEntrada,
      puntajePromedio: repInfo.reputacion || 0,
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

    // Enriquecer con datos del organizador y reputación histórica (CU-10)
    const organizador = await this.usuarioRepository.buscarPorId(evento.organizadorId);
    if (organizador) {
      const repInfo = await this.reseniaRepository.calcularReputacionOrganizador(organizador.id);
      eventoJSON.organizador = {
        id: organizador.id,
        nombre: organizador.nombre,
        apellido: organizador.apellido,
        email: organizador.email,
        reputacion: repInfo.reputacion,
        totalResenias: repInfo.totalResenias,
      };

      // Reseñas de eventos anteriores de este organizador (CU-10)
      const reseniasOrg = await this.reseniaRepository.buscarPorOrganizador(organizador.id);
      eventoJSON.reseniasAnteriores = reseniasOrg.slice(0, 5).map((r) => r.toJSON());
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
