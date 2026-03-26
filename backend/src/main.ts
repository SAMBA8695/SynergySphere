import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

// backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    exceptionFactory: (errors) => {
      return new BadRequestException(errors.map(e => Object.values(e.constraints || {})).flat());
    }
  }));

  // Updated CORS configuration
  app.enableCors({
    origin: [
      'https://synergy-sphere-collab.vercel.app', // Your actual Vercel URL
      'http://localhost:3000'                  // For local testing
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ensure the app uses the port provided by the hosting environment (Render/Railway)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
