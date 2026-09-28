import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Área o departamento general (ej. "Hogar y Exterior", "Salud y
 * Bienestar", "Vestuario y Estilo", "Entretención"). Agrupa varias
 * categorías/rubros específicos, para que el buscador pueda navegarse
 * en dos niveles: primero el área amplia, después el rubro puntual.
 *
 * Ejemplo: el departamento "Hogar y Exterior" agrupa las categorías
 * Gasfitería, Electricidad, Jardinería y Limpieza.
 */
@Entity('departamentos')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ unique: true })
  slug: string;
}
