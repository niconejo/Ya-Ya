import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que el frontend (Next.js, otro origen) consuma la API en desarrollo.
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Valida automáticamente el body de cada request contra los DTOs
  // (class-validator). whitelist=true descarta campos que no estén
  // declarados en el DTO, para que nadie mande campos extra (ej. "role: admin"
  // colado en un body que no lo pide) y que el sistema los ignore silenciosamente.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Ya-Ya backend corriendo en http://localhost:${port}`);
}

bootstrap();
