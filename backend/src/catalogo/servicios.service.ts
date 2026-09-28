import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import {
  MeilisearchService,
  ServicioSearchDocument,
} from './meilisearch.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Service)
    private readonly serviciosRepo: Repository<Service>,
    private readonly meilisearchService: MeilisearchService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(emprendedorId: string, dto: CreateServiceDto): Promise<Service> {
    const servicio = this.serviciosRepo.create({
      ...dto,
      emprendedorId,
    });
    const guardado = await this.serviciosRepo.save(servicio);
    await this.sincronizarConIndice(guardado.id);
    return guardado;
  }

  /**
   * Listado público simple con filtros directos en SQL (categoría, comuna,
   * texto). Se mantiene desde B5 para casos donde no hace falta la
   * relevancia/orden avanzado de Meilisearch (ej. "ver todo un rubro").
   * La búsqueda con ranking real vive en `buscar()` (B6), más abajo.
   */
  findAll(query: QueryServiceDto): Promise<Service[]> {
    const qb = this.serviciosRepo
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.category', 'category')
      .where('servicio.activo = true');

    if (query.departmentId) {
      qb.andWhere('category.departmentId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query.categoryId) {
      qb.andWhere('servicio.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.comuna) {
      qb.andWhere('servicio.comuna ILIKE :comuna', {
        comuna: `%${query.comuna}%`,
      });
    }

    if (query.busqueda) {
      qb.andWhere(
        '(servicio.titulo ILIKE :busqueda OR servicio.descripcion ILIKE :busqueda)',
        { busqueda: `%${query.busqueda}%` },
      );
    }

    return qb.orderBy('servicio.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Service> {
    const servicio = await this.serviciosRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  /**
   * Servicios publicados por un emprendedor específico (para su propio
   * panel de gestión, incluye también los inactivos).
   */
  findByEmprendedor(emprendedorId: string): Promise<Service[]> {
    return this.serviciosRepo.find({
      where: { emprendedorId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    emprendedorId: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const servicio = await this.findOne(id);
    this.verificarDueno(servicio, emprendedorId);

    Object.assign(servicio, dto);
    const guardado = await this.serviciosRepo.save(servicio);
    await this.sincronizarConIndice(guardado.id);
    return guardado;
  }

  /**
   * "Eliminar" un servicio en realidad lo desactiva (activo=false) en vez
   * de borrarlo de la base de datos: así no se pierden cotizaciones,
   * reservas o reseñas históricas que ya lo referencian. Se saca del
   * índice de búsqueda para que deje de aparecer en resultados.
   */
  async deactivate(id: string, emprendedorId: string): Promise<Service> {
    const servicio = await this.findOne(id);
    this.verificarDueno(servicio, emprendedorId);

    servicio.activo = false;
    const guardado = await this.serviciosRepo.save(servicio);
    await this.meilisearchService.eliminarDelIndice(guardado.id);
    return guardado;
  }

  /**
   * Búsqueda avanzada (B6): texto + filtros + orden por relevancia,
   * calificación del emprendedor o precio, vía Meilisearch.
   */
  buscar(params: {
    q?: string;
    departmentId?: string;
    categoryId?: string;
    comuna?: string;
    precioMin?: number;
    precioMax?: number;
    ordenarPor?: 'relevancia' | 'calificacion' | 'precio_asc' | 'precio_desc' | 'recientes';
  }) {
    return this.meilisearchService.buscar(params);
  }

  /**
   * Reconstruye el índice completo desde Postgres. Útil para la primera
   * carga, o si Meilisearch estuvo caído y se perdió sincronización.
   */
  async reindexarTodos(): Promise<number> {
    const servicios = await this.serviciosRepo.find({
      where: { activo: true },
      relations: ['category'],
    });
    for (const servicio of servicios) {
      await this.sincronizarConIndice(servicio.id, servicio);
    }
    return servicios.length;
  }

  private async sincronizarConIndice(
    id: string,
    servicioPrecargado?: Service,
  ): Promise<void> {
    const servicio = servicioPrecargado ?? (await this.findOne(id));
    const [emprendedor, perfil] = await Promise.all([
      this.usuariosService.findById(servicio.emprendedorId),
      this.usuariosService.getOrCreateEmprendedorProfile(servicio.emprendedorId),
    ]);

    const doc: ServicioSearchDocument = {
      id: servicio.id,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      precio: Number(servicio.precio),
      unidadPrecio: servicio.unidadPrecio,
      comuna: servicio.comuna ?? null,
      departmentId: servicio.category?.departmentId ?? '',
      departmentNombre: servicio.category?.department?.nombre ?? '',
      categoryId: servicio.categoryId,
      categoryNombre: servicio.category?.nombre ?? '',
      emprendedorId: servicio.emprendedorId,
      emprendedorNombre: emprendedor.nombre,
      calificacionPromedio: Number(perfil.calificacionPromedio),
      cantidadTrabajosRealizados: perfil.cantidadTrabajosRealizados,
      activo: servicio.activo,
      createdAtTimestamp: new Date(servicio.createdAt).getTime(),
    };

    await this.meilisearchService.indexarServicio(doc);
  }

  private verificarDueno(servicio: Service, emprendedorId: string): void {
    if (servicio.emprendedorId !== emprendedorId) {
      throw new ForbiddenException(
        'No puedes modificar un servicio que no te pertenece',
      );
    }
  }
}
