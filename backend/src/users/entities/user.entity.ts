import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CLIENTE = 'cliente',
  EMPRENDEDOR = 'emprendedor',
}

/**
 * Entidad base de usuario. Punto de partida para la actividad B2
 * (Modelado y creación de base de datos) — desde acá se desprenden
 * los perfiles de Emprendedor y Cliente definidos en el alcance del MVP.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  nombre: string;

  @Column({ unique: true, nullable: true })
  rut: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
  role: UserRole;

  @Column({ default: false })
  verificado: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
