import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { DepartamentosService } from './departamentos.service';
import { slugify } from './slugify.util';

// Rubros iniciales de la plataforma, agrupados por el departamento (área
// general) al que pertenecen. Hasta que exista un panel de administración
// para gestionarlos (B14), se siembran al arrancar la app si la tabla
// está vacía. El nombre del departamento debe existir en
// DEPARTAMENTOS_INICIALES (departamentos.service.ts).
const CATEGORIAS_INICIALES: { nombre: string; departamento: string }[] = [
  { nombre: 'Gasfitería', departamento: 'Hogar y Exterior' },
  { nombre: 'Electricidad', departamento: 'Hogar y Exterior' },
  { nombre: 'Jardinería', departamento: 'Hogar y Exterior' },
  { nombre: 'Limpieza', departamento: 'Hogar y Exterior' },
  { nombre: 'Salud y Bienestar', departamento: 'Salud y Bienestar' },
  { nombre: 'Tatuajes', departamento: 'Vestuario y Estilo' },
  { nombre: 'Belleza y Peluquería', departamento: 'Vestuario y Estilo' },
  { nombre: 'Costura y Diseño de Moda', departamento: 'Vestuario y Estilo' },
  { nombre: 'Eventos y Entretención', departamento: 'Entretención' },
  { nombre: 'Soporte Técnico', departamento: 'Tecnología' },
  { nombre: 'Diseño Gráfico', departamento: 'Tecnología' },
  { nombre: 'Repostería', departamento: 'Gastronomía' },
  { nombre: 'Otros', departamento: 'Otros' },
];

@Injectable()
export class CategoriasService implements OnModuleInit {
  private readonly logger = new Logger(CategoriasService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    private readonly departamentosService: DepartamentosService,
  ) {}

  async onModuleInit() {
    const count = await this.categoriesRepo.count();
    if (count > 0) return;

    // Los departamentos se siembran en su propio onModuleInit; como Nest
    // no garantiza el orden entre módulos distintos, se asegura acá
    // explícitamente antes de intentar asociar categorías a ellos.
    const departamentos = await this.departamentosService.findAll();
    const idPorNombre = new Map(departamentos.map((d) => [d.nombre, d.id]));

    const categorias = CATEGORIAS_INICIALES.map(({ nombre, departamento }) => {
      const departmentId = idPorNombre.get(departamento);
      if (!departmentId) {
        throw new Error(
          `Departamento "${departamento}" no existe. Revisa DEPARTAMENTOS_INICIALES.`,
        );
      }
      return this.categoriesRepo.create({
        nombre,
        slug: slugify(nombre),
        departmentId,
      });
    });

    await this.categoriesRepo.save(categorias);
    this.logger.log(`Seed: ${categorias.length} categorías iniciales creadas`);
  }

  findAll(departmentId?: string): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: departmentId ? { departmentId } : {},
      order: { nombre: 'ASC' },
    });
  }
}
