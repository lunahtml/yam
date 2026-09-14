//backend/src/modules/auth/services/security.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { DeviceInfo } from '../../../common/types/device-info.type.js';

@Injectable()
export class SecurityService {
    constructor(private prisma: PrismaService) { }

    async checkBruteforce(email: string, ip: string) {
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

    async logFailedAttempt(
        userId: string | null,
        email: string,
        deviceInfo: DeviceInfo,
    ) {
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

    async logSuccessfulAttempt(
        userId: string,
        email: string,
        deviceInfo: DeviceInfo,
    ) {
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

    async isNewDevice(
        userId: string,
        deviceInfo: DeviceInfo,
    ): Promise<boolean> {
        const knownSession = await this.prisma.client.refreshToken.findFirst({
            where: {
                userId,
                device: deviceInfo.deviceId,
                revokedAt: null,
            },
        });

        return !knownSession;
    }
}