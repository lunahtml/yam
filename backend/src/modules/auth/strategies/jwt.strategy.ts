//backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express'; // ДОБАВЛЕНО: нужен тип для кастомного экстрактора, читающего cookie
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma: PrismaService) {
        super({
            // БЫЛО: jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ПОЧЕМУ ИЗМЕНЕНО: access-токен раньше передавался фронтендом через заголовок
            // Authorization, а фронтенд хранил его в localStorage — это уязвимо к краже
            // через XSS. Теперь токен лежит в httpOnly cookie (недоступна для JS),
            // поэтому его нужно читать оттуда. Bearer-заголовок оставлен как fallback —
            // не мешает и пригодится, если в будущем появится мобильный клиент или
            // прямой доступ к API не из браузера.
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.['yam_access_token'] ?? null, // ДОБАВЛЕНО
                ExtractJwt.fromAuthHeaderAsBearerToken(), // ОСТАВЛЕНО как fallback
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
            issuer: 'yam-api',
            audience: 'yam-client',
        });
    }

    async validate(payload: { sub: string }) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User not found or inactive');
        }

        return {
            userId: user.id,
            email: user.email,
        };
    }
}