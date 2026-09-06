//backend\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 YAM backend running on http://localhost:${port}`);
}

bootstrap();