import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Perfil público extendido del emprendedor (1:1 con User). Separado de
 * User para mantener esa tabla liviana, ya que estos campos solo aplican
 * a usuarios con role=emprendedor. Alcance MVP: "Creación de perfil
 * público con portafolio".
 */
@Entity('perfiles_emprendedor')
export class EmprendedorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  comuna: string;

  @Column({ nullable: true })
  telefonoContacto: string;

  // Campos denormalizados: se recalculan cuando cambian reviews/bookings,
  // para no tener que agregar (SUM/AVG) en cada consulta del buscador.
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  calificacionPromedio: number;

  @Column({ default: 0 })
  cantidadTrabajosRealizados: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
