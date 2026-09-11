import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Carga las variables de entorno (backend/.env) en toda la app.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a PostgreSQL. `synchronize: true` solo sirve para desarrollo:
    // crea/actualiza las tablas automáticamente a partir de las entidades.
    // Antes de producción, hay que desactivarlo y usar migraciones de TypeORM.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'yaya'),
        password: config.get<string>('DB_PASSWORD', 'yaya'),
        database: config.get<string>('DB_NAME', 'yaya'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV', 'development') !== 'production',
      }),
    }),

    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
