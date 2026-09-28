import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Department } from './entities/department.entity';
import { Service } from './entities/service.entity';
import { Promotion } from './entities/promotion.entity';
import { DepartamentosService } from './departamentos.service';
import { CategoriasService } from './categorias.service';
import { ServiciosService } from './servicios.service';
import { PromocionesService } from './promociones.service';
import { MeilisearchService } from './meilisearch.service';
import { CatalogoController } from './catalogo.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Category, Service, Promotion]),
    UsuariosModule,
  ],
  controllers: [CatalogoController],
  providers: [
    DepartamentosService,
    CategoriasService,
    ServiciosService,
    PromocionesService,
    MeilisearchService,
  ],
  exports: [TypeOrmModule, ServiciosService],
})
export class CatalogoModule {}
