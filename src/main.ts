import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the frontend hosted at https://jopesa-connect.vercel.app
  app.enableCors({
    origin: 'https://jopesa-connect.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, *, Accept, Authorization',
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
