import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Endpoint mínimo para confirmar que el backend está levantado y
   * respondiendo. El frontend lo consulta al cargar la página de inicio
   * (ver frontend/src/app/page.tsx) para validar que todo el entorno
   * (Docker, backend, base de datos) está correctamente conectado.
   */
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'yaya-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
