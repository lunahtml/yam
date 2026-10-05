var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/gamification/services/achievements.service.ts
import { Injectable, NotFoundException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { XpService } from './xp.service.js';
let AchievementsService = class AchievementsService {
    prisma;
    membership;
    xp;
    constructor(prisma, membership, xp) {
        this.prisma = prisma;
        this.membership = membership;
        this.xp = xp;
    }
    // ═══ CRUD ачивок ═══
    async create(userId, organizationId, data) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        const existing = await this.prisma.client.achievement.findUnique({
            where: {
                organizationId_code: { organizationId, code: data.code },
            },
        });
        if (existing) {
            throw new ConflictException('Achievement with this code already exists');
        }
        return this.prisma.client.achievement.create({
            data: {
                organizationId,
                code: data.code,
                label: data.label,
                description: data.description,
                icon: data.icon,
                xpReward: data.xpReward ?? 0,
                isAutomatic: data.isAutomatic ?? false,
            },
        });
    }
    async listByOrganization(userId, organizationId) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        return this.prisma.client.achievement.findMany({
            where: { organizationId },
            orderBy: [{ isAutomatic: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async remove(userId, id) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }
        await this.membership.assertOrganizationMember(userId, achievement.organizationId);
        return this.prisma.client.achievement.delete({ where: { id } });
    }
    // ═══ Выдача ═══
    async grantManual(grantedById, achievementId, data) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { id: achievementId },
            select: {
                organizationId: true,
                label: true,
                xpReward: true,
            },
        });
        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }
        // Проверяем только ВЫДАЮЩЕГО.
        // Получатель может быть member проекта, но не организации — это ок.
        await this.membership.assertOrganizationMember(grantedById, achievement.organizationId);
        const existing = await this.prisma.client.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId: data.userId,
                    achievementId,
                },
            },
        });
        if (existing) {
            throw new ConflictException('User already has this achievement');
        }
        const result = await this.prisma.client.userAchievement.create({
            data: {
                userId: data.userId,
                achievementId,
                grantedById,
                note: data.note,
            },
        });
        // Начисляем XP за ачивку
        if (achievement.xpReward > 0) {
            await this.xp.addXp(data.userId, achievement.xpReward, 'MANUAL_GRANT', achievementId, `Ачивка: ${achievement.label}`);
        }
        return result;
    }
    async grantAutomatic(userId, organizationId, code, note) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { organizationId_code: { organizationId, code } },
        });
        if (!achievement)
            return null;
        const existing = await this.prisma.client.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });
        if (existing)
            return null;
        const result = await this.prisma.client.userAchievement.create({
            data: {
                userId,
                achievementId: achievement.id,
                note,
            },
        });
        // Начисляем XP за ачивку
        if (achievement.xpReward > 0) {
            await this.xp.addXp(userId, achievement.xpReward, 'MANUAL_GRANT', achievement.id, `Ачивка: ${achievement.label}`);
        }
        return result;
    }
    async listByUser(userId, targetUserId) {
        const target = await this.prisma.client.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });
        if (!target) {
            throw new NotFoundException('User not found');
        }
        return this.prisma.client.userAchievement.findMany({
            where: { userId: targetUserId },
            orderBy: { grantedAt: 'desc' },
            include: {
                achievement: true,
                grantedBy: {
                    select: { id: true, email: true, name: true },
                },
            },
        });
    }
};
AchievementsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService,
        XpService])
], AchievementsService);
export { AchievementsService };
//# sourceMappingURL=achievements.service.js.map