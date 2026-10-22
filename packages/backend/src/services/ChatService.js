import { Mensaje } from "../models/Mensaje.js";
import { EstadoCompra } from "../models/enums.js";
import { MensajeRepository } from "../repositories/MensajeRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
  NotFoundError,
  ForbiddenError,
  UnprocessableEntityError,
} from "../errors/AppError.js";

export class ChatService {
  constructor(
    mensajeRepository = MensajeRepository,
    compraRepository = CompraRepository,
    eventoRepository = EventoRepository,
    usuarioRepository = UsuarioRepository
  ) {
    this.mensajeRepository = mensajeRepository;
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  enviarMensaje = async ({ compraId, usuarioId, mensaje }) => {
    // 1. Validar que la compra exista
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra '${compraId}' no encontrada`);
    }

    // 2. Validar que el evento exista
    const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${compra.eventoId}' no encontrado`);
    }

    // 3. Validar permisos: solo el comprador titular o el organizador del evento (CU-05, CU-06)
    const esComprador = compra.compradorId === usuarioId;
    const esOrganizador = evento.organizadorId === usuarioId;
    if (!esComprador && !esOrganizador) {
      throw new ForbiddenError("No tienes permiso para participar en el chat de esta compra");
    }

    // 4. Validar estado de la compra: no permitir mensajes en compras canceladas o reembolsadas
    if (compra.estado === EstadoCompra.CANCELADA || compra.estado === EstadoCompra.REEMBOLSADA) {
      throw new UnprocessableEntityError("No es posible enviar mensajes en una compra cancelada o reembolsada");
    }

    // 5. Crear y persistir el mensaje
    const nuevoMensaje = new Mensaje({
      compraId,
      usuarioId,
      mensaje,
    });

    const guardado = await this.mensajeRepository.guardar(nuevoMensaje);

    // 6. Enriquecer con datos del remitente
    const emisor = await this.usuarioRepository.buscarPorId(usuarioId);
    return {
      ...guardado.toJSON(),
      remitente: emisor
        ? {
            id: emisor.id,
            nombre: emisor.nombre,
            apellido: emisor.apellido,
            rol: emisor.rol,
          }
        : null,
    };
  };

  obtenerHistorial = async (compraId, usuarioId) => {
    // 1. Validar que la compra exista
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra '${compraId}' no encontrada`);
    }

    // 2. Validar que el evento exista
    const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${compra.eventoId}' no encontrado`);
    }

    // 3. Validar permisos: solo comprador titular u organizador
    const esComprador = compra.compradorId === usuarioId;
    const esOrganizador = evento.organizadorId === usuarioId;
    if (!esComprador && !esOrganizador) {
      throw new ForbiddenError("No tienes permiso para acceder al historial de este chat");
    }

    // 4. Obtener mensajes ordenados cronológicamente
    const mensajes = await this.mensajeRepository.buscarPorCompra(compraId);

    // 5. Enriquecer cada mensaje con remitente
    const resultado = [];
    for (const msg of mensajes) {
      const emisor = await this.usuarioRepository.buscarPorId(msg.usuarioId);
      resultado.push({
        ...msg.toJSON(),
        remitente: emisor
          ? {
              id: emisor.id,
              nombre: emisor.nombre,
              apellido: emisor.apellido,
              rol: emisor.rol,
            }
          : null,
      });
    }

    return resultado;
  };
}
