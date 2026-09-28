import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { slugify } from './slugify.util';

// Áreas generales iniciales. Cada una agrupa varias categorías puntuales
// (ver CATEGORIAS_INICIALES en categorias.service.ts). Al igual que las
// categorías, se siembran al arrancar la app hasta que exista un panel
// de administración real (B14) para gestionarlas.
export const DEPARTAMENTOS_INICIALES = [
  'Hogar y Exterior',
  'Salud y Bienestar',
  'Vestuario y Estilo',
  'Entretención',
  'Tecnología',
  'Gastronomía',
  'Otros',
];

@Injectable()
export class DepartamentosService implements OnModuleInit {
  private readonly logger = new Logger(DepartamentosService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepo: Repository<Department>,
  ) {}

  async onModuleInit() {
    const count = await this.departmentsRepo.count();
    if (count > 0) return;

    const departamentos = DEPARTAMENTOS_INICIALES.map((nombre) =>
      this.departmentsRepo.create({ nombre, slug: slugify(nombre) }),
    );
    await this.departmentsRepo.save(departamentos);
    this.logger.log(`Seed: ${departamentos.length} departamentos iniciales creados`);
  }

  findAll(): Promise<Department[]> {
    return this.departmentsRepo.find({ order: { nombre: 'ASC' } });
  }

  findBySlug(slug: string): Promise<Department | null> {
    return this.departmentsRepo.findOne({ where: { slug } });
  }
}
