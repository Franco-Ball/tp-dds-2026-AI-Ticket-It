import { UnprocessableEntityError, NotFoundError } from "../errors/AppError.js";
import { TipoEntrada } from "./TipoEntrada.js";

export class Evento {
  constructor({
    id = null,
    nombre,
    descripcion,
    categoriaId,
    fecha,
    organizadorId,
    multimedia = [],
    tiposEntrada = [],
    puntajePromedio = 0,
    fechaCreacion = new Date().toISOString(),
  } = {}) {
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      throw new UnprocessableEntityError("El nombre del evento es requerido y no puede estar vacío");
    }
    if (!descripcion || typeof descripcion !== "string" || !descripcion.trim()) {
      throw new UnprocessableEntityError("La descripción del evento es requerida y no puede estar vacía");
    }
    if (!categoriaId || typeof categoriaId !== "string" || !categoriaId.trim()) {
      throw new UnprocessableEntityError("La categoría es requerida");
    }
    if (!fecha) {
      throw new UnprocessableEntityError("La fecha del evento es requerida");
    }
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      throw new UnprocessableEntityError("La fecha del evento no es válida");
    }
    if (!organizadorId || typeof organizadorId !== "string") {
      throw new UnprocessableEntityError("El ID del organizador es requerido");
    }

    if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
      throw new UnprocessableEntityError("El evento debe tener al menos un tipo de entrada");
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion.trim();
    this.categoriaId = categoriaId.trim();
    this.fecha = fechaObj.toISOString();
    this.organizadorId = organizadorId;
    this.multimedia = Array.isArray(multimedia) ? multimedia.filter((url) => typeof url === "string" && url.trim()) : [];
    
    // Instanciar TipoEntrada si vienen como objetos planos
    this.tiposEntrada = tiposEntrada.map((t, index) => {
      if (t instanceof TipoEntrada) return t;
      const tipoId = t.id || `tipo-${index + 1}`;
      return new TipoEntrada({ ...t, id: tipoId });
    });

    this.puntajePromedio = Number(puntajePromedio) || 0;
    this.fechaCreacion = fechaCreacion;
  }

  precioMinimo() {
    if (this.tiposEntrada.length === 0) return 0;
    return Math.min(...this.tiposEntrada.map((t) => t.precio));
  }

  precioMaximo() {
    if (this.tiposEntrada.length === 0) return 0;
    return Math.max(...this.tiposEntrada.map((t) => t.precio));
  }

  cupoTotalDisponible() {
    return this.tiposEntrada.reduce((sum, t) => sum + t.cupoDisponible, 0);
  }

  tuPrecioEstaEntre(min = null, max = null) {
    const minVal = min !== null && !isNaN(Number(min)) ? Number(min) : -Infinity;
    const maxVal = max !== null && !isNaN(Number(max)) ? Number(max) : Infinity;

    // Retorna true si al menos un tipo de entrada está dentro del rango
    return this.tiposEntrada.some((t) => t.precio >= minVal && t.precio <= maxVal);
  }

  obtenerTipoEntrada(tipoEntradaId) {
    const tipo = this.tiposEntrada.find((t) => t.id === tipoEntradaId);
    if (!tipo) {
      throw new NotFoundError(`Tipo de entrada '${tipoEntradaId}' no encontrado en el evento`);
    }
    return tipo;
  }

  esOrganizador(usuarioId) {
    return this.organizadorId === usuarioId;
  }

  esFechaFutura(ahora = new Date()) {
    return new Date(this.fecha) > ahora;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoriaId: this.categoriaId,
      fecha: this.fecha,
      organizadorId: this.organizadorId,
      multimedia: this.multimedia,
      tiposEntrada: this.tiposEntrada.map((t) => t.toJSON()),
      precioMinimo: this.precioMinimo(),
      precioMaximo: this.precioMaximo(),
      cupoTotalDisponible: this.cupoTotalDisponible(),
      puntajePromedio: this.puntajePromedio,
      fechaCreacion: this.fechaCreacion,
    };
  }
}
