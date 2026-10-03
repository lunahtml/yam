//backend/src/modules/gamification/services/achievements.service.ts
import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateAchievementDto,
    GrantAchievementDto,
} from '../contracts/achievement.dto.js';

@Injectable()
export class AchievementsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    // ═══ CRUD ачивок ═══

    async create(
        userId: string,
        organizationId: string,
        data: CreateAchievementDto,
    ) {
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

    async listByOrganization(userId: string, organizationId: string) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.achievement.findMany({
            where: { organizationId },
            orderBy: [{ isAutomatic: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async remove(userId: string, id: string) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }

        await this.membership.assertOrganizationMember(
            userId,
            achievement.organizationId,
        );

        return this.prisma.client.achievement.delete({ where: { id } });
    }

    // ═══ Выдача ═══

    async grantManual(
        grantedById: string,
        achievementId: string,
        data: GrantAchievementDto,
    ) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { id: achievementId },
            select: { organizationId: true },
        });

        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }

        await this.membership.assertOrganizationMember(
            grantedById,
            achievement.organizationId,
        );

        // Проверяем, что target — member той же организации
        await this.membership.assertOrganizationMember(
            data.userId,
            achievement.organizationId,
        );

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

        return this.prisma.client.userAchievement.create({
            data: {
                userId: data.userId,
                achievementId,
                grantedById,
                note: data.note,
            },
        });
    }

    async grantAutomatic(
        userId: string,
        organizationId: string,
        code: string,
        note?: string,
    ) {
        const achievement = await this.prisma.client.achievement.findUnique({
            where: { organizationId_code: { organizationId, code } },
        });

        if (!achievement) return null;

        const existing = await this.prisma.client.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });

        if (existing) return null;

        return this.prisma.client.userAchievement.create({
            data: {
                userId,
                achievementId: achievement.id,
                note,
            },
        });
    }

    async listByUser(userId: string, targetUserId: string) {
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
}