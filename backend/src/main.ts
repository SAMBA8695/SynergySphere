import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (class-validator)
  
  app.useGlobalPipes(new ValidationPipe({ 
  whitelist: true, 
  transform: true,
  forbidNonWhitelisted: false,
  exceptionFactory: (errors) => {
    return new BadRequestException(errors.map(e => Object.values(e.constraints || {})).flat());
  }
}));

  // CORS
  app.enableCors();

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('SynergySphere API')
    .setDescription('Project Collaboration Backend — NestJS + Prisma + JWT')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);   // /docs  → Swagger UI
  SwaggerModule.setup('redoc', app, document, { // /redoc → ReDoc-style
    customSiteTitle: 'SynergySphere ReDoc',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📄 Swagger UI: http://localhost:${process.env.PORT ?? 3000}/docs`);
}
bootstrap();
