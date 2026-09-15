//backend\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { envSchema } from './config/env.schema.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
    const env = envSchema.parse(process.env);

    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.getHttpAdapter().getInstance().set('trust proxy', 1);

    app.use(cookieParser());
    app.use(helmet());
    app.enableCors({
        origin: env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(env.PORT);
    console.log(`🚀 YAM backend running on http://localhost:${env.PORT}`);
}

bootstrap();