import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../usuarios/entities/user.entity';
import { CategoriasService } from './categorias.service';
import { DepartamentosService } from './departamentos.service';
import { ServiciosService } from './servicios.service';
import { PromocionesService } from './promociones.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { SearchServiceDto } from './dto/search-service.dto';

@Controller('catalogo')
export class CatalogoController {
  constructor(
    private readonly categoriasService: CategoriasService,
    private readonly departamentosService: DepartamentosService,
    private readonly serviciosService: ServiciosService,
    private readonly promocionesService: PromocionesService,
  ) {}

  // ---- Departamentos (áreas generales) ----

  @Get('departamentos')
  listarDepartamentos() {
    return this.departamentosService.findAll();
  }

  // ---- Categorías (públicas, de solo lectura hasta que exista panel admin) ----

  @Get('categorias')
  listarCategorias(@Query('departmentId') departmentId?: string) {
    return this.categoriasService.findAll(departmentId);
  }

  // ---- Servicios ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRENDEDOR)
  @Post('servicios')
  crearServicio(@CurrentUser() user: User, @Body() dto: CreateServiceDto) {
    return this.serviciosService.create(user.id, dto);
  }

  @Get('servicios')
  buscarServicios(@Query() query: QueryServiceDto) {
    return this.serviciosService.findAll(query);
  }

  /**
   * Búsqueda avanzada (B6): texto libre + filtros + orden por relevancia,
   * calificación o precio. Va antes de 'servicios/:id' para no chocar con
   * esa ruta (por eso vive bajo su propio path 'buscar').
   */
  @Get('buscar')
  buscarAvanzado(@Query() query: SearchServiceDto) {
    return this.serviciosService.buscar(query);
  }

  /**
   * Reconstruye el índice de Meilisearch desde cero a partir de Postgres.
   * Protegido para ADMIN: en uso normal la sincronización es automática
   * (cada create/update/deactivate reindexa su propio servicio); esto es
   * un mecanismo de recuperación manual.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('buscar/reindexar')
  async reindexar() {
    const total = await this.serviciosService.reindexarTodos();
    return { reindexados: total };
  }

  /**
   * Los propios servicios del emprendedor autenticado (incluye inactivos).
   * Va ANTES de ':id' a propósito: si no, Nest interpretaría "mios" como
   * un id y nunca llegaría a este método.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRENDEDOR)
  @Get('servicios/mios')
  misServicios(@CurrentUser() user: User) {
    return this.serviciosService.findByEmprendedor(user.id);
  }

  @Get('servicios/:id')
  obtenerServicio(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRENDEDOR)
  @Patch('servicios/:id')
  actualizarServicio(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.serviciosService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRENDEDOR)
  @Delete('servicios/:id')
  desactivarServicio(@CurrentUser() user: User, @Param('id') id: string) {
    return this.serviciosService.deactivate(id, user.id);
  }

  // ---- Promociones ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRENDEDOR)
  @Post('servicios/:id/promociones')
  crearPromocion(
    @CurrentUser() user: User,
    @Param('id') servicioId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promocionesService.create(servicioId, user.id, dto);
  }

  @Get('servicios/:id/promociones')
  listarPromocionesActivas(@Param('id') servicioId: string) {
    return this.promocionesService.findActivasPorServicio(servicioId);
  }
}
