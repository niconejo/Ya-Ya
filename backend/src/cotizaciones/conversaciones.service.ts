import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UserRole } from '../usuarios/entities/user.entity';

@Injectable()
export class ConversacionesService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * Devuelve la conversación existente entre un cliente y un emprendedor,
   * o la crea si es la primera vez. Hay un único hilo por par
   * (cliente, emprendedor): así el historial completo queda en un solo
   * lugar, aunque se hayan pedido varias cotizaciones distintas.
   */
  async obtenerOCrear(
    clienteId: string,
    emprendedorId: string,
    quoteId?: string,
  ): Promise<Conversation> {
    let conversacion = await this.conversationsRepo.findOne({
      where: { clienteId, emprendedorId },
    });

    if (!conversacion) {
      conversacion = await this.conversationsRepo.save(
        this.conversationsRepo.create({ clienteId, emprendedorId, quoteId }),
      );
    } else if (quoteId && !conversacion.quoteId) {
      conversacion.quoteId = quoteId;
      conversacion = await this.conversationsRepo.save(conversacion);
    }

    return conversacion;
  }

  /**
   * Un cliente abre un chat directo con un emprendedor (sin cotización
   * formal de por medio). Alcance MVP: "Chat con emprendedores".
   */
  async iniciar(clienteId: string, emprendedorId: string): Promise<Conversation> {
    if (clienteId === emprendedorId) {
      throw new BadRequestException('No puedes iniciar una conversación contigo mismo');
    }

    const emprendedor = await this.usuariosService.findById(emprendedorId);
    if (emprendedor.role !== UserRole.EMPRENDEDOR) {
      throw new BadRequestException('Solo puedes iniciar conversaciones con emprendedores');
    }

    return this.obtenerOCrear(clienteId, emprendedorId);
  }

  misConversaciones(userId: string): Promise<Conversation[]> {
    return this.conversationsRepo.find({
      where: [{ clienteId: userId }, { emprendedorId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async enviarMensaje(
    conversationId: string,
    senderId: string,
    contenido: string,
  ): Promise<Message> {
    const conversacion = await this.obtenerConversacionValidada(
      conversationId,
      senderId,
    );

    return this.messagesRepo.save(
      this.messagesRepo.create({
        conversationId: conversacion.id,
        senderId,
        contenido,
      }),
    );
  }

  /**
   * Devuelve el historial en orden cronológico y marca como leídos los
   * mensajes que envió la otra persona (leerlos = abrir la conversación).
   */
  async listarMensajes(conversationId: string, userId: string): Promise<Message[]> {
    await this.obtenerConversacionValidada(conversationId, userId);

    const mensajes = await this.messagesRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    const idsNoLeidos = mensajes
      .filter((m) => m.senderId !== userId && !m.leido)
      .map((m) => m.id);

    if (idsNoLeidos.length > 0) {
      await this.messagesRepo.update({ id: In(idsNoLeidos) }, { leido: true });
    }

    return mensajes;
  }

  /**
   * Regla de seguridad central del chat: solo el cliente o el emprendedor
   * de una conversación pueden leerla o escribir en ella.
   */
  private async obtenerConversacionValidada(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversacion = await this.conversationsRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversacion) throw new NotFoundException('Conversación no encontrada');

    if (conversacion.clienteId !== userId && conversacion.emprendedorId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }
    return conversacion;
  }
}
