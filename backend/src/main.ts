import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que el frontend (Next.js, otro origen) consuma la API en desarrollo.
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Ya-Ya backend corriendo en http://localhost:${port}`);
}

bootstrap();
