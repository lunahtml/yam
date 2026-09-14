var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/auth/services/security.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let SecurityService = class SecurityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkBruteforce(email, ip) {
        const recentAttempts = await this.prisma.client.loginAttempt.count({
            where: {
                email,
                success: false,
                createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
            },
        });
        if (recentAttempts >= 5) {
            throw new UnauthorizedException('Too many failed attempts. Try later.');
        }
        const ipAttempts = await this.prisma.client.loginAttempt.count({
            where: {
                ip,
                success: false,
                createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
            },
        });
        if (ipAttempts >= 10) {
            throw new UnauthorizedException('Too many failed attempts. Try later.');
        }
    }
    async logFailedAttempt(userId, email, deviceInfo) {
        await this.prisma.client.loginAttempt.create({
            data: {
                userId,
                email,
                ip: deviceInfo.ip,
                userAgent: deviceInfo.userAgent,
                success: false,
            },
        });
    }
    async logSuccessfulAttempt(userId, email, deviceInfo) {
        await this.prisma.client.loginAttempt.create({
            data: {
                userId,
                email,
                ip: deviceInfo.ip,
                userAgent: deviceInfo.userAgent,
                success: true,
            },
        });
    }
    async isNewDevice(userId, deviceInfo) {
        const knownSession = await this.prisma.client.refreshToken.findFirst({
            where: {
                userId,
                device: deviceInfo.deviceId,
                revokedAt: null,
            },
        });
        return !knownSession;
    }
};
SecurityService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], SecurityService);
export { SecurityService };
//# sourceMappingURL=security.service.js.map