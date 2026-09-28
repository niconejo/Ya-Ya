import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ServiciosService } from './servicios.service';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promocionesRepo: Repository<Promotion>,
    private readonly serviciosService: ServiciosService,
  ) {}

  async create(
    serviceId: string,
    emprendedorId: string,
    dto: CreatePromotionDto,
  ): Promise<Promotion> {
    // findOne + verificarDueno viven en ServiciosService: reutilizamos esa
    // regla en vez de duplicarla acá.
    const servicio = await this.serviciosService.findOne(serviceId);
    if (servicio.emprendedorId !== emprendedorId) {
      throw new ForbiddenException(
        'No puedes crear promociones sobre un servicio que no te pertenece',
      );
    }

    const promocion = this.promocionesRepo.create({
      ...dto,
      serviceId,
    });
    return this.promocionesRepo.save(promocion);
  }

  findActivasPorServicio(serviceId: string): Promise<Promotion[]> {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.promocionesRepo
      .createQueryBuilder('promocion')
      .where('promocion.serviceId = :serviceId', { serviceId })
      .andWhere('promocion.activo = true')
      .andWhere('promocion.fechaInicio <= :hoy', { hoy })
      .andWhere('promocion.fechaFin >= :hoy', { hoy })
      .getMany();
  }
}
