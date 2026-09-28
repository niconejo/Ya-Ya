import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';
import { Booking } from '../../agenda/entities/booking.entity';

export enum TransactionEstado {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  REEMBOLSADO = 'reembolsado',
}

/**
 * Pago asociado a un Booking. Registra el monto, la comisión retenida por
 * la plataforma y la referencia de la pasarela de pago (Mercado Pago).
 * Alcance MVP: "Contratación y pago en línea" + modelo de ingresos híbrido.
 */
@Entity('transacciones')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

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

  @Column('decimal', { precision: 10, scale: 0 })
  monto: number;

  @Column('decimal', { precision: 10, scale: 0, default: 0 })
  comision: number;

  @Column({ default: 'mercado_pago' })
  metodoPago: string;

  @Column({ nullable: true })
  referenciaPasarela: string;

  @Column({ type: 'enum', enum: TransactionEstado, default: TransactionEstado.PENDIENTE })
  estado: TransactionEstado;

  @CreateDateColumn()
  createdAt: Date;
}
