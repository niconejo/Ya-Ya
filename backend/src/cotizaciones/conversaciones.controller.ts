import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../usuarios/entities/user.entity';
import { ConversacionesService } from './conversaciones.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversaciones')
export class ConversacionesController {
  constructor(private readonly conversacionesService: ConversacionesService) {}

  /** Un cliente abre (o reutiliza) un chat directo con un emprendedor. */
  @Roles(UserRole.CLIENTE)
  @Post()
  iniciar(@CurrentUser() user: User, @Body() dto: StartConversationDto) {
    return this.conversacionesService.iniciar(user.id, dto.emprendedorId);
  }

  @Get('mias')
  mias(@CurrentUser() user: User) {
    return this.conversacionesService.misConversaciones(user.id);
  }

  @Get(':id/mensajes')
  mensajes(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.conversacionesService.listarMensajes(id, user.id);
  }

  @Post(':id/mensajes')
  enviar(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversacionesService.enviarMensaje(id, user.id, dto.contenido);
  }
}
