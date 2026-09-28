import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';
import { Category } from './category.entity';

export enum UnidadPrecio {
  POR_HORA = 'por_hora',
  POR_TRABAJO = 'por_trabajo',
  POR_VISITA = 'por_visita',
}

/**
 * Servicio publicado por un emprendedor: precio, descripción y portafolio.
 * Corresponde al alcance MVP "Publicación de servicios con precios y
 * descripción" y es la entidad central que consultan clientes al buscar.
 */
@Entity('servicios')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emprendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorId' })
  emprendedor: User;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 0 })
  precio: number;

  @Column({ type: 'enum', enum: UnidadPrecio, default: UnidadPrecio.POR_TRABAJO })
  unidadPrecio: UnidadPrecio;

  @Column({ nullable: true })
  comuna: string;

  // URLs de fotos del portafolio (Cloudinary u otro storage), guardadas como JSON.
  @Column({ type: 'json', default: () => "'[]'" })
  portafolioUrls: string[];

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
