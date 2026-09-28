import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';

/**
 * Publicación del feed (novedades, trabajos realizados, avisos).
 * Alcance MVP: componente de red social "Feed / Publicaciones".
 */
@Entity('publicaciones')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  autorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autorId' })
  autor: User;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ nullable: true })
  imagenUrl: string;

  @Column({ default: false })
  oculto: boolean; // moderación

  @CreateDateColumn()
  createdAt: Date;
}
