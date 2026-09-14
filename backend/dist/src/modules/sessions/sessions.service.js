var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sessions/sessions.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
let SessionsService = class SessionsService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async createSession(userId, deviceInfo) {
        const accessToken = this.jwt.sign({ sub: userId }, {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
            issuer: 'yam-api',
            audience: 'yam-client',
        });
        const selector = randomBytes(16).toString('hex');
        const verifier = randomBytes(32).toString('hex');
        const refreshToken = `${selector}.${verifier}`;
        await this.prisma.client.refreshToken.create({
            data: {
                userId,
                selector,
                tokenHash: await argon2.hash(verifier),
                device: deviceInfo.deviceId,
                ip: deviceInfo.ip,
                userAgent: deviceInfo.userAgent,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        const [selector, verifier] = refreshToken.split('.');
        if (!selector || !verifier) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const token = await this.prisma.client.refreshToken.findUnique({
            where: { selector },
        });
        if (!token || token.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        if (token.revokedAt) {
            await this.revokeAllSessions(token.userId);
            throw new UnauthorizedException('Token reuse detected');
        }
        const valid = await argon2.verify(token.tokenHash, verifier);
        if (!valid) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.client.refreshToken.update({
            where: { id: token.id },
            data: { revokedAt: new Date() },
        });
        const accessToken = this.jwt.sign({ sub: token.userId }, {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
            issuer: 'yam-api',
            audience: 'yam-client',
        });
        const newSelector = randomBytes(16).toString('hex');
        const newVerifier = randomBytes(32).toString('hex');
        const newRefreshToken = `${newSelector}.${newVerifier}`;
        await this.prisma.client.refreshToken.create({
            data: {
                userId: token.userId,
                selector: newSelector,
                tokenHash: await argon2.hash(newVerifier),
                device: token.device,
                ip: token.ip,
                userAgent: token.userAgent,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return { accessToken, refreshToken: newRefreshToken };
    }
    async revokeByToken(refreshToken) {
        const [selector, verifier] = refreshToken.split('.');
        if (!selector || !verifier) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const token = await this.prisma.client.refreshToken.findUnique({
            where: { selector },
        });
        if (!token || token.revokedAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const valid = await argon2.verify(token.tokenHash, verifier);
        if (!valid) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.client.refreshToken.update({
            where: { id: token.id },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async listSessions(userId) {
        return this.prisma.client.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            select: {
                id: true,
                device: true,
                ip: true,
                userAgent: true,
                createdAt: true,
            },
        });
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.client.refreshToken.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            throw new UnauthorizedException('Session not found');
        await this.prisma.client.refreshToken.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async revokeAllSessions(userId) {
        await this.prisma.client.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
};
SessionsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService])
], SessionsService);
export { SessionsService };
//# sourceMappingURL=sessions.service.js.map