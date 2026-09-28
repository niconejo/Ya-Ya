import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Service } from './service.entity';

/**
 * Promoción o descuento sobre un servicio. Alcance MVP: "Creación de
 * promociones y descuentos" (funcionalidad del emprendedor).
 */
@Entity('promociones')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  titulo: string;

  @Column('decimal', { precision: 5, scale: 2 })
  porcentajeDescuento: number;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
