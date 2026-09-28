import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';
import { Service } from '../../catalogo/entities/service.entity';

export enum BookingEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  COMPLETADO = 'completado',
}

/**
 * Reserva de un servicio en una fecha/hora concreta, con abono parcial.
 * Alcance MVP: "Agendar previamente abonando una parte del total".
 * Es la entidad que conecta con Transaction (pago) y con Review (reseña),
 * ya que una reseña solo debería poder crearse sobre un Booking COMPLETADO.
 */
@Entity('reservas')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  clienteId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clienteId' })
  cliente: User;

  @Column()
  emprendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorId' })
  emprendedor: User;

  @Column({ type: 'timestamptz' })
  fechaAgendada: Date;

  @Column('decimal', { precision: 10, scale: 0 })
  montoTotal: number;

  @Column('decimal', { precision: 10, scale: 0 })
  montoAbono: number;

  @Column({ type: 'enum', enum: BookingEstado, default: BookingEstado.PENDIENTE })
  estado: BookingEstado;

  @CreateDateColumn()
  createdAt: Date;
}
