import { Categoria } from "../models/Categoria.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { NotFoundError } from "../errors/AppError.js";

export class CategoriaService {
  constructor(categoriaRepository = CategoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  listarTodas = async () => {
    const categorias = await this.categoriaRepository.buscarTodos();
    return categorias.map((c) => c.toJSON());
  };

  obtenerPorId = async (id) => {
    const categoria = await this.categoriaRepository.buscarPorId(id);
    if (!categoria) {
      throw new NotFoundError(`Categoría '${id}' no encontrada`);
    }
    return categoria.toJSON();
  };

  crearCategoria = async ({ nombre, descripcion }) => {
    const nuevaCategoria = new Categoria({ nombre, descripcion });
    const guardada = await this.categoriaRepository.guardar(nuevaCategoria);
    return guardada.toJSON();
  };
}
