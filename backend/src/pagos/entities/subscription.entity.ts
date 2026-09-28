import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';

export enum PlanSuscripcion {
  GRATUITO = 'gratuito',
  PREMIUM = 'premium',
}

export enum SubscriptionEstado {
  ACTIVA = 'activa',
  CANCELADA = 'cancelada',
  VENCIDA = 'vencida',
}

/**
 * Suscripción del emprendedor. Implementa el modelo de ingresos híbrido
 * definido en la Sección 5 de la propuesta: plan gratuito por defecto,
 * con posibilidad de upgrade a premium (mayor visibilidad, cotizaciones
 * ilimitadas, métricas avanzadas).
 */
@Entity('suscripciones')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  emprendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorId' })
  emprendedor: User;

  @Column({ type: 'enum', enum: PlanSuscripcion, default: PlanSuscripcion.GRATUITO })
  plan: PlanSuscripcion;

  @Column({ type: 'enum', enum: SubscriptionEstado, default: SubscriptionEstado.ACTIVA })
  estado: SubscriptionEstado;

  @Column({ type: 'timestamptz', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaFin: Date;

  @Column('decimal', { precision: 10, scale: 0, default: 0 })
  montoMensual: number;

  @CreateDateColumn()
  createdAt: Date;
}
