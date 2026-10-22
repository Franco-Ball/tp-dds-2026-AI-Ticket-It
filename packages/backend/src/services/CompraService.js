import { Compra } from "../models/Compra.js";
import { EstadoCompra, RolUsuario } from "../models/enums.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
  NotFoundError,
  ForbiddenError,
  UnprocessableEntityError,
} from "../errors/AppError.js";

export class CompraService {
  constructor(
    compraRepository = CompraRepository,
    eventoRepository = EventoRepository,
    usuarioRepository = UsuarioRepository
  ) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  crearCompra = async ({ compradorId, eventoId, tipoEntradaId, cantidad }) => {
    // 1. Validar comprador
    const comprador = await this.usuarioRepository.buscarPorId(compradorId);
    if (!comprador) {
      throw new NotFoundError(`Comprador '${compradorId}' no encontrado`);
    }

    // 2. Validar evento
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${eventoId}' no encontrado`);
    }

    // 3. Validar fecha futura del evento
    if (!evento.esFechaFutura()) {
      throw new UnprocessableEntityError("No es posible adquirir entradas para un evento que ya finalizó");
    }

    // 4. Validar tipo de entrada y cupo (CU-12)
    const tipoEntrada = evento.obtenerTipoEntrada(tipoEntradaId);
    if (!tipoEntrada.hayCupoPara(cantidad)) {
      throw new UnprocessableEntityError(
        `Cupo insuficiente para '${tipoEntrada.nombre}'. Disponibles: ${tipoEntrada.cupoDisponible}, solicitadas: ${cantidad}`
      );
    }

    // 5. Decrementar cupo atómicamente
    tipoEntrada.decrementarCupo(cantidad);

    // 6. Crear compra en estado PENDIENTE con reserva de 15 minutos
    const nuevaCompra = new Compra({
      compradorId,
      eventoId,
      tipoEntradaId,
      cantidad,
      precioUnitario: tipoEntrada.precio,
      estado: EstadoCompra.PENDIENTE,
    });

    const compraGuardada = await this.compraRepository.guardar(nuevaCompra);
    await this.eventoRepository.guardar(evento);

    return this.enriquecerCompra(compraGuardada, evento, tipoEntrada);
  };

  registrarPago = async (compraId, usuarioId, datosPago = {}) => {
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra '${compraId}' no encontrada`);
    }

    if (compra.compradorId !== usuarioId) {
      throw new ForbiddenError("No tienes permiso para pagar esta compra");
    }

    const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
    const tipoEntrada = evento ? evento.obtenerTipoEntrada(compra.tipoEntradaId) : null;

    // Verificar si expiró la reserva de 15 minutos
    if (compra.haExpirado()) {
      compra.actualizarEstado(
        EstadoCompra.CANCELADA,
        usuarioId,
        "Cancelada automáticamente por expiración del plazo de 15 minutos para el pago"
      );
      if (tipoEntrada) {
        tipoEntrada.reintegrarCupo(compra.cantidad);
        await this.eventoRepository.guardar(evento);
      }
      await this.compraRepository.guardar(compra);
      throw new UnprocessableEntityError(
        "El plazo de 15 minutos para completar el pago ha expirado. El cupo fue liberado."
      );
    }

    const motivo = datosPago.metodoPago
      ? `Pago confirmado vía ${datosPago.metodoPago}`
      : "Pago registrado exitosamente";

    compra.actualizarEstado(EstadoCompra.CONFIRMADA, usuarioId, motivo);
    await this.compraRepository.guardar(compra);

    return this.enriquecerCompra(compra, evento, tipoEntrada);
  };

  actualizarEstado = async (compraId, usuarioId, rolUsuario, nuevoEstado, motivo = "") => {
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra '${compraId}' no encontrada`);
    }

    const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${compra.eventoId}' asociado a la compra no encontrado`);
    }
    const tipoEntrada = evento.obtenerTipoEntrada(compra.tipoEntradaId);

    // Reglas de negocio según estado solicitado
    if (nuevoEstado === EstadoCompra.CANCELADA) {
      // Solo una compra PENDIENTE puede pasar a CANCELADA
      if (compra.compradorId !== usuarioId && evento.organizadorId !== usuarioId) {
        throw new ForbiddenError("No tienes permiso para cancelar esta compra");
      }
      compra.actualizarEstado(EstadoCompra.CANCELADA, usuarioId, motivo || "Cancelada por el usuario");
      tipoEntrada.reintegrarCupo(compra.cantidad);
    } else if (nuevoEstado === EstadoCompra.REEMBOLSADA) {
      // CU-07 y CU-08: Cancelación y reembolso de compra CONFIRMADA
      if (compra.compradorId !== usuarioId && evento.organizadorId !== usuarioId) {
        throw new ForbiddenError("No tienes permiso para solicitar el reembolso de esta compra");
      }

      if (compra.estado === EstadoCompra.UTILIZADA) {
        throw new UnprocessableEntityError("No es posible cancelar una compra que ya fue utilizada");
      }

      if (!evento.esFechaFutura()) {
        throw new UnprocessableEntityError(
          "No es posible cancelar o reembolsar una compra si el evento ya se realizó"
        );
      }

      compra.actualizarEstado(
        EstadoCompra.REEMBOLSADA,
        usuarioId,
        motivo || "Cancelación y reembolso solicitado antes del evento"
      );
      tipoEntrada.reintegrarCupo(compra.cantidad);
    } else if (nuevoEstado === EstadoCompra.UTILIZADA) {
      // Solo el organizador dueño del evento puede marcar la entrada como UTILIZADA
      if (evento.organizadorId !== usuarioId) {
        throw new ForbiddenError("Solo el organizador del evento puede marcar una entrada como utilizada");
      }

      if (compra.estado !== EstadoCompra.CONFIRMADA) {
        throw new UnprocessableEntityError("Solo compras en estado CONFIRMADA pueden ser marcadas como utilizadas");
      }

      compra.actualizarEstado(EstadoCompra.UTILIZADA, usuarioId, motivo || "Entrada validada en puerta del evento");
    } else {
      throw new UnprocessableEntityError(`Transición directa al estado '${nuevoEstado}' no permitida vía este endpoint`);
    }

    await this.compraRepository.guardar(compra);
    await this.eventoRepository.guardar(evento);

    return this.enriquecerCompra(compra, evento, tipoEntrada);
  };

  obtenerMisCompras = async (compradorId) => {
    const compras = await this.compraRepository.buscarPorComprador(compradorId);
    const ahora = new Date();

    const resultado = [];
    for (const compra of compras) {
      const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
      const tipoEntrada = evento ? evento.obtenerTipoEntrada(compra.tipoEntradaId) : null;

      // Limpieza pasiva de pendientes expiradas
      if (compra.haExpirado(ahora)) {
        compra.actualizarEstado(
          EstadoCompra.CANCELADA,
          compradorId,
          "Expiración automática por superar 15 minutos en estado PENDIENTE"
        );
        if (tipoEntrada && evento) {
          tipoEntrada.reintegrarCupo(compra.cantidad);
          await this.eventoRepository.guardar(evento);
        }
        await this.compraRepository.guardar(compra);
      }

      resultado.push(this.enriquecerCompra(compra, evento, tipoEntrada, ahora));
    }

    return resultado;
  };

  obtenerComprasDeEvento = async (eventoId, organizadorId) => {
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${eventoId}' no encontrado`);
    }

    // CU-02: Solo el organizador creador puede consultar las compras de su evento
    if (evento.organizadorId !== organizadorId) {
      throw new ForbiddenError("No tienes permiso para ver las compras de un evento que no organizas");
    }

    const compras = await this.compraRepository.buscarPorEvento(eventoId);

    // Enriquecer cada compra con datos del comprador
    const comprasEnriquecidas = [];
    let totalRecaudado = 0;
    let totalEntradasVendidas = 0;

    for (const compra of compras) {
      const comprador = await this.usuarioRepository.buscarPorId(compra.compradorId);
      const tipoEntrada = evento.obtenerTipoEntrada(compra.tipoEntradaId);

      if (compra.estado === EstadoCompra.CONFIRMADA || compra.estado === EstadoCompra.UTILIZADA) {
        totalRecaudado += compra.total;
        totalEntradasVendidas += compra.cantidad;
      }

      comprasEnriquecidas.push({
        ...compra.toJSON(),
        comprador: comprador
          ? {
              id: comprador.id,
              nombre: comprador.nombre,
              apellido: comprador.apellido,
              email: comprador.email,
            }
          : null,
        tipoEntrada: tipoEntrada ? tipoEntrada.toJSON() : null,
      });
    }

    // Desglose de cupos por tipo de entrada (CU-02)
    const cuposPorTipoEntrada = evento.tiposEntrada.map((t) => {
      const vendidasDeEsteTipo = compras
        .filter(
          (c) =>
            c.tipoEntradaId === t.id &&
            (c.estado === EstadoCompra.CONFIRMADA ||
              c.estado === EstadoCompra.UTILIZADA ||
              c.estado === EstadoCompra.PENDIENTE)
        )
        .reduce((sum, c) => sum + c.cantidad, 0);

      return {
        tipoEntradaId: t.id,
        nombre: t.nombre,
        precio: t.precio,
        cupoTotal: t.cupoTotal,
        cupoDisponible: t.cupoDisponible,
        entradasVendidas: vendidasDeEsteTipo,
      };
    });

    return {
      eventoId: evento.id,
      nombreEvento: evento.nombre,
      fechaEvento: evento.fecha,
      cuposPorTipoEntrada,
      totalRecaudado,
      totalEntradasVendidas,
      compras: comprasEnriquecidas,
    };
  };

  obtenerPorId = async (compraId, usuarioId, rolUsuario) => {
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra '${compraId}' no encontrada`);
    }

    const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento '${compra.eventoId}' no encontrado`);
    }

    // Validar acceso: comprador titular o el organizador del evento
    const esCompradorTitular = compra.compradorId === usuarioId;
    const esOrganizadorDuenio = evento.organizadorId === usuarioId;

    if (!esCompradorTitular && !esOrganizadorDuenio) {
      throw new ForbiddenError("No tienes permiso para ver los detalles de esta compra");
    }

    const tipoEntrada = evento.obtenerTipoEntrada(compra.tipoEntradaId);
    return this.enriquecerCompra(compra, evento, tipoEntrada);
  };

  enriquecerCompra(compra, evento, tipoEntrada, ahora = new Date()) {
    const compraJSON = compra.toJSON();

    if (evento) {
      compraJSON.evento = {
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        descripcion: evento.descripcion,
        multimedia: evento.multimedia,
        organizadorId: evento.organizadorId,
      };

      // Cálculo de días faltantes (CU-01)
      const diasFaltantesInfo = compra.calcularDiasFaltantes(evento.fecha, ahora);
      if (diasFaltantesInfo) {
        compraJSON.diasFaltantes = diasFaltantesInfo.diasFaltantes;
        compraJSON.eventoFinalizado = diasFaltantesInfo.eventoFinalizado;
      } else {
        compraJSON.diasFaltantes = null;
        compraJSON.eventoFinalizado = null;
      }
    }

    if (tipoEntrada) {
      compraJSON.tipoEntrada = tipoEntrada.toJSON();
    }

    return compraJSON;
  }
}
