import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from './auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT') || 4000;
  const JWT_SECRET = configService.get<string>('JWT_SECRET');


  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  console.log(`Server running on port ${PORT}`);
  console.log(`API Versioning Header: ${JWT_SECRET}`);
  
  const config = new DocumentBuilder()
    .setTitle('skills app')
    .setDescription('The skills API description')
    .setVersion('1.0')
    .addTag('skills')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalGuards(new RolesGuard(new Reflector()));

  await app.listen(PORT);
}

bootstrap();
