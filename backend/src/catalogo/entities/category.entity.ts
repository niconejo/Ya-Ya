import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from './department.entity';

/**
 * Rubro/categoría de servicio (ej. Gasfitería, Electricidad, Jardinería,
 * Tatuajes, Soporte técnico). Sirve para clasificar servicios y para el
 * buscador/filtrado (alcance MVP: "buscar por categoría, ubicación, precio").
 *
 * Cada categoría pertenece a un Department (área general): así el
 * buscador puede filtrar/navegar tanto por área amplia como por rubro
 * específico.
 */
@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  departmentId: string;

  // eager: true porque casi siempre que se carga un Service o una Category
  // se quiere mostrar también a qué área general pertenece (ej. para
  // agrupar resultados de búsqueda), y así se evita repetir esa relación
  // manualmente en cada consulta.
  @ManyToOne(() => Department, { eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
