import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CotizacionesService } from './cotizaciones.service';
import { ConversacionesService } from './conversaciones.service';
import { CotizacionesController } from './cotizaciones.controller';
import { ConversacionesController } from './conversaciones.controller';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quote, Conversation, Message]),
    CatalogoModule,
    UsuariosModule,
  ],
  controllers: [CotizacionesController, ConversacionesController],
  providers: [CotizacionesService, ConversacionesService],
  exports: [TypeOrmModule, CotizacionesService, ConversacionesService],
})
export class CotizacionesModule {}
