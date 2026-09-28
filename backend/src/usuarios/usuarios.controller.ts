import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateEmprendedorProfileDto } from './dto/update-emprendedor-profile.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Devuelve el usuario autenticado (a partir del JWT enviado en el
   * header Authorization: Bearer <token>). Es el endpoint que el
   * frontend usa apenas el usuario inicia sesión, para saber quién es
   * y con qué rol.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: User) {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.updateNombre(user.id, dto.nombre ?? user.nombre);
  }

  /**
   * Perfil propio de emprendedor (edición): bio, comuna, teléfono de
   * contacto. Solo lo puede editar el propio emprendedor autenticado.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('emprendedores/me')
  updateMyEmprendedorProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateEmprendedorProfileDto,
  ) {
    if (user.role !== UserRole.EMPRENDEDOR) {
      throw new NotFoundException(
        'Solo los usuarios con rol emprendedor tienen perfil de emprendedor',
      );
    }
    return this.usuariosService.updateEmprendedorProfile(user.id, dto);
  }

  /**
   * Perfil público de un emprendedor (lo que ve un cliente al entrar a
   * su ficha desde el buscador). No requiere autenticación.
   */
  @Get('emprendedores/:id')
  getPublicEmprendedorProfile(@Param('id') id: string) {
    return this.usuariosService.getPublicEmprendedorProfile(id);
  }
}
