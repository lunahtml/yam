//backend\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { envSchema } from './config/env.schema.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { json, urlencoded } from 'express';
async function bootstrap() {
    const env = envSchema.parse(process.env);
    // БЫЛО: const app = await NestFactory.create(AppModule);
    // ПОЧЕМУ ИЗМЕНЕНО: без { bodyParser: false } Nest сам подключает body-parser
    // с лимитом ~100kb ДО того, как выполнится код ниже — из-за этого собственные
    // app.use(json({limit: '256kb'})) ниже фактически не работали (см. предыдущий разбор).
    const app = await NestFactory.create(AppModule, { bodyParser: false }); // ИЗМЕНЕНО
    app.use(json({ limit: '256kb' }));
    app.use(urlencoded({ extended: true, limit: '256kb' }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    app.use(cookieParser());
    app.use(helmet());
    app.enableCors({
        origin: env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
        credentials: true,
    });
    // ДОБАВЛЕНО: простая CSRF-защита.
    // ПОЧЕМУ: до перехода на cookie-based auth CSRF был невозможен — браузер не
    // прикладывал Authorization-заголовок автоматически к запросам с чужих сайтов.
    // Теперь, когда access/refresh токены лежат в cookie, браузер БУДЕТ автоматически
    // прикладывать их к любому запросу на ваш домен, включая инициированный сторонним
    // сайтом. sameSite: 'lax' уже блокирует это для большинства случаев (cross-site
    // POST с cookie не пройдёт), но эта проверка — дополнительный явный барьер:
    // обычная HTML-форма с чужого сайта не может добавить кастомный заголовок,
    // а fetch/XHR с вашего же фронтенда — может.
    app.use((req, res, next) => {
        const mutating = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (mutating.includes(req.method) && !req.path.startsWith('/auth/')) {
            if (req.headers['x-requested-with'] !== 'fetch') {
                res.status(403).json({ message: 'CSRF check failed' });
                return;
            }
        }
        next();
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(env.PORT);
    console.log(`🚀 YAM backend running on http://localhost:${env.PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map