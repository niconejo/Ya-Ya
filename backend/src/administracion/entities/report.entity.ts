import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';

export enum ReportTipo {
  DISPUTA_TRANSACCION = 'disputa_transaccion',
  RESENA_REPORTADA = 'resena_reportada',
  PUBLICACION_REPORTADA = 'publicacion_reportada',
}

export enum ReportEstado {
  ABIERTO = 'abierto',
  EN_REVISION = 'en_revision',
  RESUELTO = 'resuelto',
  RECHAZADO = 'rechazado',
}

/**
 * Tabla única para disputas de transacciones y reportes de moderación
 * (reseñas o publicaciones). `contenidoId` referencia el id de la entidad
 * reportada (Transaction, Review o Post) según el valor de `tipo`.
 * Alcance MVP: "Gestión de disputas" y "Moderación de reseñas" (Admin).
 */
@Entity('reportes')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReportTipo })
  tipo: ReportTipo;

  @Column()
  contenidoId: string;

  @Column()
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'enum', enum: ReportEstado, default: ReportEstado.ABIERTO })
  estado: ReportEstado;

  @Column({ type: 'text', nullable: true })
  resolucion: string;

  @CreateDateColumn()
  createdAt: Date;
}
