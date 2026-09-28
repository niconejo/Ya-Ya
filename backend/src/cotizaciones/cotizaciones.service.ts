import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteEstado } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';
import { ConversacionesService } from './conversaciones.service';
import { ServiciosService } from '../catalogo/servicios.service';
import { UserRole } from '../usuarios/entities/user.entity';

/**
 * Flujo de estados de una cotización:
 *
 *   PENDIENTE ──(emprendedor responde con precio)──► RESPONDIDA
 *       │                                                │
 *       │                                    (cliente acepta) ──► ACEPTADA
 *       │                                                │
 *       └──(emprendedor o cliente rechaza)───────────────┴──► RECHAZADA
 *
 * EXPIRADA queda definido en el enum pero todavía sin uso: requiere un
 * proceso programado (cron) que se puede agregar más adelante.
 */
@Injectable()
export class CotizacionesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepo: Repository<Quote>,
    private readonly serviciosService: ServiciosService,
    private readonly conversacionesService: ConversacionesService,
  ) {}

  async create(clienteId: string, dto: CreateQuoteDto): Promise<Quote> {
    const servicio = await this.serviciosService.findOne(dto.serviceId);

    if (!servicio.activo) {
      throw new BadRequestException('Este servicio ya no está disponible');
    }
    if (servicio.emprendedorId === clienteId) {
      throw new BadRequestException('No puedes cotizar tu propio servicio');
    }

    const cotizacion = await this.quotesRepo.save(
      this.quotesRepo.create({
        clienteId,
        emprendedorId: servicio.emprendedorId,
        serviceId: servicio.id,
        mensaje: dto.mensaje,
        precioPropuesto: dto.precioPropuesto,
      }),
    );

    // Toda cotización abre (o reutiliza) el chat con el emprendedor y deja
    // el mensaje inicial del cliente como primer mensaje del hilo.
    const conversacion = await this.conversacionesService.obtenerOCrear(
      clienteId,
      servicio.emprendedorId,
      cotizacion.id,
    );
    await this.conversacionesService.enviarMensaje(
      conversacion.id,
      clienteId,
      `Solicitud de cotización para "${servicio.titulo}": ${dto.mensaje}`,
    );

    return cotizacion;
  }

  async findOne(id: string, userId: string): Promise<Quote> {
    const cotizacion = await this.buscarPorId(id);
    this.verificarParticipante(cotizacion, userId);
    return cotizacion;
  }

  /**
   * Un cliente ve las cotizaciones que pidió; un emprendedor ve las que
   * recibió. Mismo endpoint, el resultado depende del rol.
   */
  misCotizaciones(userId: string, role: UserRole): Promise<Quote[]> {
    const where =
      role === UserRole.EMPRENDEDOR
        ? { emprendedorId: userId }
        : { clienteId: userId };

    return this.quotesRepo.find({
      where,
      relations: ['service'],
      order: { createdAt: 'DESC' },
    });
  }

  async responder(
    id: string,
    emprendedorId: string,
    dto: RespondQuoteDto,
  ): Promise<Quote> {
    const cotizacion = await this.buscarPorId(id);

    if (cotizacion.emprendedorId !== emprendedorId) {
      throw new ForbiddenException('Esta cotización no fue dirigida a ti');
    }
    if (cotizacion.estado !== QuoteEstado.PENDIENTE) {
      throw new BadRequestException('Solo se puede responder una cotización pendiente');
    }

    cotizacion.precioPropuesto = dto.precioPropuesto;
    cotizacion.estado = QuoteEstado.RESPONDIDA;
    const guardada = await this.quotesRepo.save(cotizacion);

    const conversacion = await this.conversacionesService.obtenerOCrear(
      cotizacion.clienteId,
      cotizacion.emprendedorId,
      cotizacion.id,
    );
    await this.conversacionesService.enviarMensaje(
      conversacion.id,
      emprendedorId,
      dto.mensaje ?? `Te envié una cotización por $${dto.precioPropuesto}.`,
    );

    return guardada;
  }

  async aceptar(id: string, clienteId: string): Promise<Quote> {
    const cotizacion = await this.buscarPorId(id);

    if (cotizacion.clienteId !== clienteId) {
      throw new ForbiddenException('Esta cotización no es tuya');
    }
    if (cotizacion.estado !== QuoteEstado.RESPONDIDA) {
      throw new BadRequestException('Solo se puede aceptar una cotización ya respondida');
    }

    cotizacion.estado = QuoteEstado.ACEPTADA;
    return this.quotesRepo.save(cotizacion);
  }

  /**
   * Puede rechazar el emprendedor (no quiere/puede tomar el trabajo) o el
   * cliente (no le convence el precio), mientras la cotización siga
   * abierta (pendiente o respondida).
   */
  async rechazar(id: string, userId: string): Promise<Quote> {
    const cotizacion = await this.buscarPorId(id);
    this.verificarParticipante(cotizacion, userId);

    const abiertas = [QuoteEstado.PENDIENTE, QuoteEstado.RESPONDIDA];
    if (!abiertas.includes(cotizacion.estado)) {
      throw new BadRequestException('Esta cotización ya está cerrada');
    }

    cotizacion.estado = QuoteEstado.RECHAZADA;
    return this.quotesRepo.save(cotizacion);
  }

  private async buscarPorId(id: string): Promise<Quote> {
    const cotizacion = await this.quotesRepo.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return cotizacion;
  }

  private verificarParticipante(cotizacion: Quote, userId: string): void {
    if (cotizacion.clienteId !== userId && cotizacion.emprendedorId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta cotización');
    }
  }
}
