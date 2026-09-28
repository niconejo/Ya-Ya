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

export enum QuoteEstado {
  PENDIENTE = 'pendiente',
  RESPONDIDA = 'respondida',
  ACEPTADA = 'aceptada',
  RECHAZADA = 'rechazada',
  EXPIRADA = 'expirada',
}

/**
 * Solicitud de cotización de un cliente a un emprendedor sobre un servicio.
 * Alcance MVP: "Solicitud de cotización" / "Recepción y respuesta a
 * solicitudes de cotización".
 */
@Entity('cotizaciones')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column()
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'text' })
  mensaje: string;

  @Column('decimal', { precision: 10, scale: 0, nullable: true })
  precioPropuesto: number;

  @Column({ type: 'enum', enum: QuoteEstado, default: QuoteEstado.PENDIENTE })
  estado: QuoteEstado;

  @CreateDateColumn()
  createdAt: Date;
}
