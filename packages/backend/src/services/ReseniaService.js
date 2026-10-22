import { Resenia } from "../models/Resenia.js";
import { EstadoCompra } from "../models/enums.js";
import { ReseniaRepository } from "../repositories/ReseniaRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../errors/AppError.js";

export class ReseniaService {
  constructor(
    reseniaRepository = ReseniaRepository,
    compraRepository = CompraRepository,
    eventoRepository = EventoRepository,
    usuarioRepository = UsuarioRepository
  ) {
    this.reseniaRepository = reseniaRepository;
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  crearResenia = async ({ compradorId, eventoId, puntuacion, detalle }) => {
    // 1. Validar evento existente
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${eventoId}' no encontrado`);
    }

    // 2. Validar usuario existente
    const comprador = await this.usuarioRepository.buscarPorId(compradorId);
    if (!comprador) {
      throw new NotFoundError(`Usuario '${compradorId}' no encontrado`);
    }

    // 3. Validar elegibilidad (CU-09): debe tener al menos una entrada en estado UTILIZADA
    const comprasUsuario = await this.compraRepository.buscarPorComprador(compradorId);
    const tieneEntradaUtilizada = comprasUsuario.some(
      (c) => c.eventoId === eventoId && c.estado === EstadoCompra.UTILIZADA
    );

    if (!tieneEntradaUtilizada) {
      throw new UnprocessableEntityError(
        "Solo puedes calificar un evento si posees una entrada en estado UTILIZADA"
      );
    }

    // 4. Validar unicidad: una sola reseña por comprador por evento
    const reseniaPrevia = await this.reseniaRepository.buscarPorCompradorYEvento(
      compradorId,
      eventoId
    );
    if (reseniaPrevia) {
      throw new ConflictError("Ya has emitido una reseña para este evento");
    }

    // 5. Crear y persistir la reseña
    const nuevaResenia = new Resenia({
      compradorId,
      eventoId,
      organizadorId: evento.organizadorId,
      puntuacion,
      detalle,
    });

    const guardada = await this.reseniaRepository.guardar(nuevaResenia);

    // 6. Actualizar reputación en todos los eventos del organizador (CU-10, CU-11)
    const repInfo = await this.reseniaRepository.calcularReputacionOrganizador(
      evento.organizadorId
    );
    if (repInfo.reputacion !== null) {
      const eventosOrg = await this.eventoRepository.buscarPorOrganizador(
        evento.organizadorId
      );
      for (const ev of eventosOrg) {
        ev.puntajePromedio = repInfo.reputacion;
        await this.eventoRepository.guardar(ev);
      }
    }

    return {
      ...guardada.toJSON(),
      comprador: {
        id: comprador.id,
        nombre: comprador.nombre,
        apellido: comprador.apellido,
      },
    };
  };

  obtenerReseniasDeEvento = async (eventoId) => {
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${eventoId}' no encontrado`);
    }

    const resenias = await this.reseniaRepository.buscarPorEvento(eventoId);

    const resultado = [];
    for (const r of resenias) {
      const comprador = await this.usuarioRepository.buscarPorId(r.compradorId);
      resultado.push({
        ...r.toJSON(),
        comprador: comprador
          ? {
              id: comprador.id,
              nombre: comprador.nombre,
              apellido: comprador.apellido,
            }
          : null,
      });
    }

    return resultado;
  };

  obtenerReseniasDeOrganizador = async (organizadorId) => {
    const organizador = await this.usuarioRepository.buscarPorId(organizadorId);
    if (!organizador) {
      throw new NotFoundError(`Organizador '${organizadorId}' no encontrado`);
    }

    const resenias = await this.reseniaRepository.buscarPorOrganizador(organizadorId);
    const repInfo = await this.reseniaRepository.calcularReputacionOrganizador(organizadorId);

    const reseniasEnriquecidas = [];
    for (const r of resenias) {
      const comprador = await this.usuarioRepository.buscarPorId(r.compradorId);
      const evento = await this.eventoRepository.buscarPorId(r.eventoId);

      reseniasEnriquecidas.push({
        ...r.toJSON(),
        nombreEvento: evento ? evento.nombre : "Evento",
        comprador: comprador
          ? {
              id: comprador.id,
              nombre: comprador.nombre,
              apellido: comprador.apellido,
            }
          : null,
      });
    }

    return {
      organizadorId: organizador.id,
      nombreOrganizador: `${organizador.nombre} ${organizador.apellido}`,
      reputacion: repInfo.reputacion,
      totalResenias: repInfo.totalResenias,
      resenias: reseniasEnriquecidas,
    };
  };
}
