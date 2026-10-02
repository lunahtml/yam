//backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { RedisService } from '../../../infra/redis/redis.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.['yam_access_token'] ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
            issuer: 'yam-api',
            audience: 'yam-client',
        });
    }

    async validate(payload: { sub: string; jti?: string; tv?: number }) {
        if (payload.jti) {
            const revoked = await this.redis.isJtiRevoked(payload.jti);
            if (revoked) {
                throw new UnauthorizedException('Token revoked');
            }
        }

        const user = await this.prisma.client.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User not found or inactive');
        }

        if ((payload.tv ?? 0) !== user.tokenVersion) {
            throw new UnauthorizedException('Token invalidated');
        }

        return {
            userId: user.id,
            email: user.email,
        };
    }
}