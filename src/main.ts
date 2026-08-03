import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = new Set<string>([
    'https://jopesa.netlify.app',
    'https://jopesa-connect.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    ...(process.env.CORS_ALLOWED_ORIGINS?.split(',').map((value) => value.trim()).filter(Boolean) ?? []),
  ]);

  const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;
    return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      || /^(https?:\/\/)?[\w-]+\.vercel\.app$/.test(origin)
      || /^(https?:\/\/)?[\w-]+\.netlify\.app$/.test(origin);
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('JOPESA Backend API')
    .setDescription('API documentation for JOPESA (JO ex-students association) backend')
    .setVersion('1.0.0')
    .addTag('health', 'Health check endpoints')
    .addTag('alumni', 'Alumni management endpoints')
    .addTag('batch', 'Batch finder endpoints')
    .addTag('events', 'Events management endpoints')
    .addTag('announcements', 'Announcements endpoints')
    .addTag('documents', 'Documents management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();


