import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';

/**
 * Bloque de disponibilidad horaria del emprendedor (día + rango de horas).
 * Alcance MVP: "Gestión de agenda y disponibilidad".
 */
@Entity('disponibilidades')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emprendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorId' })
  emprendedor: User;

  // 0 = domingo ... 6 = sábado
  @Column({ type: 'smallint' })
  diaSemana: number;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ default: true })
  disponible: boolean;
}
