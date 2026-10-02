var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
let JwtStrategy = class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    prisma;
    redis;
    constructor(prisma, redis) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.['yam_access_token'] ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            issuer: 'yam-api',
            audience: 'yam-client',
        });
        this.prisma = prisma;
        this.redis = redis;
    }
    async validate(payload) {
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
};
JwtStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        RedisService])
], JwtStrategy);
export { JwtStrategy };
//# sourceMappingURL=jwt.strategy.js.map