import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';

export enum CollaborationTipo {
  REFERIDO = 'referido',
  PROYECTO_CONJUNTO = 'proyecto_conjunto',
}

export enum CollaborationEstado {
  PROPUESTA = 'propuesta',
  ACEPTADA = 'aceptada',
  RECHAZADA = 'rechazada',
  COMPLETADA = 'completada',
}

/**
 * Colaboración entre dos emprendedores (mismo rubro u otro): derivación de
 * trabajo o proyecto conjunto. Diferenciador clave de Ya-Ya frente a un
 * marketplace tradicional (ver Sección 4.1 / 5 de la propuesta).
 */
@Entity('colaboraciones')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emprendedorOrigenId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorOrigenId' })
  emprendedorOrigen: User;

  @Column()
  emprendedorDestinoId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorDestinoId' })
  emprendedorDestino: User;

  @Column({ type: 'enum', enum: CollaborationTipo })
  tipo: CollaborationTipo;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: CollaborationEstado,
    default: CollaborationEstado.PROPUESTA,
  })
  estado: CollaborationEstado;

  @CreateDateColumn()
  createdAt: Date;
}
