import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../usuarios/entities/user.entity';
import { CotizacionesService } from './cotizaciones.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @Roles(UserRole.CLIENTE)
  @Post()
  crear(@CurrentUser() user: User, @Body() dto: CreateQuoteDto) {
    return this.cotizacionesService.create(user.id, dto);
  }

  // Va antes de ':id' para que "mias" no se interprete como un id.
  @Get('mias')
  mias(@CurrentUser() user: User) {
    return this.cotizacionesService.misCotizaciones(user.id, user.role);
  }

  @Get(':id')
  detalle(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.cotizacionesService.findOne(id, user.id);
  }

  @Roles(UserRole.EMPRENDEDOR)
  @Patch(':id/responder')
  responder(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondQuoteDto,
  ) {
    return this.cotizacionesService.responder(id, user.id, dto);
  }

  @Roles(UserRole.CLIENTE)
  @Patch(':id/aceptar')
  aceptar(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.cotizacionesService.aceptar(id, user.id);
  }

  @Patch(':id/rechazar')
  rechazar(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.cotizacionesService.rechazar(id, user.id);
  }
}
