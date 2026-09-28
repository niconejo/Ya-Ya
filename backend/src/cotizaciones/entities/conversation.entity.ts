import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';
import { Quote } from './quote.entity';

/**
 * Hilo de conversación entre un cliente y un emprendedor. Puede originarse
 * a partir de una cotización, o abrirse directamente desde el perfil del
 * emprendedor. Alcance MVP: "Chat con emprendedores".
 */
@Entity('conversaciones')
@Unique(['clienteId', 'emprendedorId'])
export class Conversation {
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

  @Column({ nullable: true })
  quoteId: string;

  @ManyToOne(() => Quote, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;

  @CreateDateColumn()
  createdAt: Date;
}
