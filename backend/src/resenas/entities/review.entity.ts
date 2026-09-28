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

/**
 * Reseña y calificación de un servicio. Se vincula siempre a un Booking
 * completado (no a un emprendedor "en general"), lo que garantiza que la
 * reseña sea "verificada": solo quien efectivamente contrató y completó
 * el servicio puede calificarlo. Alcance MVP: "Sistema de reseñas y
 * valoraciones verificadas".
 */
@Entity('resenas')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  autorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autorId' })
  autor: User;

  @Column()
  emprendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendedorId' })
  emprendedor: User;

  @Column({ type: 'smallint' })
  calificacion: number; // 1 a 5

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ default: false })
  oculta: boolean; // para moderación (ver módulo admin)

  @CreateDateColumn()
  createdAt: Date;
}
