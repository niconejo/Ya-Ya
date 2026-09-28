import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

const INDEX_NAME = 'servicios';

export interface ServicioSearchDocument {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  unidadPrecio: string;
  comuna: string | null;
  departmentId: string;
  departmentNombre: string;
  categoryId: string;
  categoryNombre: string;
  emprendedorId: string;
  emprendedorNombre: string;
  calificacionPromedio: number;
  cantidadTrabajosRealizados: number;
  activo: boolean;
  createdAtTimestamp: number;
}

export interface BuscarServiciosParams {
  q?: string;
  departmentId?: string;
  categoryId?: string;
  comuna?: string;
  precioMin?: number;
  precioMax?: number;
  ordenarPor?: 'relevancia' | 'calificacion' | 'precio_asc' | 'precio_desc' | 'recientes';
}

/**
 * Encapsula toda la comunicación con Meilisearch. Alcance B6: "Buscador de
 * servicios ordenar por similitud de la búsqueda, calificación y cantidad
 * de trabajos realizados, cercanía" (ver visión del producto).
 *
 * Nota sobre "cercanía": Meilisearch soporta búsqueda geográfica nativa
 * (_geo + sort por distancia) si en el futuro se agregan coordenadas
 * lat/lng al perfil del emprendedor o al servicio. Por ahora la
 * aproximación es exacta por comuna (facet), que cubre el caso de uso
 * del MVP sin necesitar geolocalización real.
 *
 * Todas las llamadas están envueltas en try/catch: si Meilisearch no está
 * corriendo (por ejemplo, alguien levantó el backend sin `docker compose
 * up` completo), el resto de la API sigue funcionando con Postgres — solo
 * se pierde temporalmente la búsqueda avanzada, no toda la aplicación.
 */
@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private readonly client: MeiliSearch;

  constructor(private readonly configService: ConfigService) {
    this.client = new MeiliSearch({
      host: this.configService.get<string>('MEILI_HOST', 'http://localhost:7700'),
      apiKey: this.configService.get<string>('MEILI_API_KEY', ''),
    });
  }

  async onModuleInit() {
    try {
      const index = this.client.index(INDEX_NAME);
      await index.updateSearchableAttributes([
        'titulo',
        'descripcion',
        'comuna',
        'categoryNombre',
        'emprendedorNombre',
      ]);
      await index.updateFilterableAttributes([
        'departmentId',
        'categoryId',
        'comuna',
        'activo',
        'precio',
      ]);
      await index.updateSortableAttributes([
        'precio',
        'calificacionPromedio',
        'cantidadTrabajosRealizados',
        'createdAtTimestamp',
      ]);
      this.logger.log('Índice de Meilisearch ("servicios") configurado correctamente');
    } catch (error) {
      this.logger.warn(
        `No se pudo configurar Meilisearch al arrancar (¿está corriendo?): ${(error as Error).message}`,
      );
    }
  }

  async indexarServicio(doc: ServicioSearchDocument): Promise<void> {
    try {
      const task = await this.client
        .index(INDEX_NAME)
        .addDocuments([doc], { primaryKey: 'id' });
      // Esperamos a que la tarea termine de verdad antes de responder al
      // cliente HTTP. Meilisearch indexa en segundo plano (async): sin este
      // await, una búsqueda hecha inmediatamente después de crear/editar un
      // servicio podría no encontrarlo todavía (visto en pruebas: ~500ms de
      // demora). Para el volumen de un MVP/piloto esto es aceptable; si el
      // volumen de escritura creciera mucho, se cambiaría a un enfoque de
      // cola (ej. Redis, que ya está en el stack) en vez de esperar en línea.
      await this.client.waitForTask(task.taskUid, { timeOutMs: 5000 });
    } catch (error) {
      this.logger.warn(`No se pudo indexar el servicio ${doc.id}: ${(error as Error).message}`);
    }
  }

  async eliminarDelIndice(id: string): Promise<void> {
    try {
      const task = await this.client.index(INDEX_NAME).deleteDocument(id);
      await this.client.waitForTask(task.taskUid, { timeOutMs: 5000 });
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar el servicio ${id} del índice: ${(error as Error).message}`,
      );
    }
  }

  async buscar(params: BuscarServiciosParams) {
    const filtros: string[] = ['activo = true'];
    if (params.departmentId) filtros.push(`departmentId = "${params.departmentId}"`);
    if (params.categoryId) filtros.push(`categoryId = "${params.categoryId}"`);
    if (params.comuna) filtros.push(`comuna = "${params.comuna}"`);
    if (params.precioMin !== undefined) filtros.push(`precio >= ${params.precioMin}`);
    if (params.precioMax !== undefined) filtros.push(`precio <= ${params.precioMax}`);

    let sort: string[] | undefined;
    switch (params.ordenarPor) {
      case 'calificacion':
        sort = ['calificacionPromedio:desc', 'cantidadTrabajosRealizados:desc'];
        break;
      case 'precio_asc':
        sort = ['precio:asc'];
        break;
      case 'precio_desc':
        sort = ['precio:desc'];
        break;
      case 'recientes':
        sort = ['createdAtTimestamp:desc'];
        break;
      default:
        sort = undefined; // sin "ordenarPor" explícito: manda la relevancia de texto de Meilisearch
    }

    const resultado = await this.client.index(INDEX_NAME).search(params.q ?? '', {
      filter: filtros.join(' AND '),
      sort,
      limit: 50,
    });

    return resultado.hits;
  }
}
