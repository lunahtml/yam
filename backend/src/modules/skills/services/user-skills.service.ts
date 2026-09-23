//backend/src/modules/skills/services/user-skills.service.ts
import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    AddEvidenceDto,
    ManualLevelDto,
} from '../contracts/user-skill.dto.js';

const LEVEL_THRESHOLDS = [0, 10, 25, 50, 90, 140, 200, 280, 380, 500];

@Injectable()
export class UserSkillsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async getUserSkills(userId: string, targetUserId: string) {
        // проверяем, что запрашивающий имеет доступ хотя бы к одной организации с этим user'ом
        const target = await this.prisma.client.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });

        if (!target) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.client.userSkill.findMany({
            where: { userId: targetUserId },
            orderBy: [{ level: 'desc' }],
            include: {
                skill: {
                    select: {
                        id: true,
                        name: true,
                        label: true,
                        type: true,
                        category: { select: { id: true, name: true } },
                    },
                },
                context: { select: { id: true, name: true, slug: true } },
                evidences: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
    }
    async getUserSkillById(userId: string, id: string) {
        const userSkill = await this.prisma.client.userSkill.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!userSkill) {
            throw new NotFoundException('UserSkill not found');
        }

        await this.membership.assertOrganizationMember(
            userId,
            userSkill.organizationId,
        );

        return this.prisma.client.userSkill.findUnique({
            where: { id },
            include: {
                skill: {
                    select: {
                        id: true,
                        name: true,
                        label: true,
                        type: true,
                        description: true,
                        category: { select: { id: true, name: true } },
                    },
                },
                context: { select: { id: true, name: true, slug: true } },
                evidences: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: {
                            select: { id: true, email: true, name: true, avatarUrl: true },
                        },
                    },
                },
            },
        });
    }
    async getOrCreate(
        targetUserId: string,
        skillId: string,
        organizationId: string,
        contextId?: string | null,
    ) {
        const existing = await this.prisma.client.userSkill.findFirst({
            where: {
                userId: targetUserId,
                skillId,
                organizationId,
                contextId: contextId ?? null,
            },
        });

        if (existing) return existing;

        return this.prisma.client.userSkill.create({
            data: {
                userId: targetUserId,
                skillId,
                organizationId,
                contextId: contextId ?? null,
                level: 1,
                levelLabel: 'infant',
            },
        });
    }

    async addEvidence(
        currentUserId: string,
        userSkillId: string,
        data: AddEvidenceDto,
    ) {
        const userSkill = await this.prisma.client.userSkill.findUnique({
            where: { id: userSkillId },
            select: { organizationId: true, practiceCount: true },
        });

        if (!userSkill) {
            throw new NotFoundException('UserSkill not found');
        }

        await this.membership.assertOrganizationMember(
            currentUserId,
            userSkill.organizationId,
        );

        const evidence = await this.prisma.client.skillEvidence.create({
            data: {
                userSkillId,
                type: data.type,
                weight: data.weight,
                comment: data.comment,
                sourceId: data.sourceId,
                sourceType: data.sourceType,
                createdById: currentUserId,
            },
        });

        const newPracticeCount = userSkill.practiceCount + data.weight;
        const newLevel = this.calculateLevel(newPracticeCount);

        await this.prisma.client.userSkill.update({
            where: { id: userSkillId },
            data: {
                practiceCount: newPracticeCount,
                evidenceCount: { increment: 1 },
                level: newLevel,
                levelLabel: this.getLevelLabel(newLevel),
                lastUsedAt: new Date(),
            },
        });

        return evidence;
    }

    async setManualLevel(
        currentUserId: string,
        userSkillId: string,
        data: ManualLevelDto,
    ) {
        const userSkill = await this.prisma.client.userSkill.findUnique({
            where: { id: userSkillId },
            select: { organizationId: true },
        });

        if (!userSkill) {
            throw new NotFoundException('UserSkill not found');
        }

        await this.membership.assertOrganizationMember(
            currentUserId,
            userSkill.organizationId,
        );

        await this.prisma.client.skillEvidence.create({
            data: {
                userSkillId,
                type: 'MANUAL_GRANT',
                weight: data.level,
                comment: data.comment ?? 'Ручное изменение уровня',
                createdById: currentUserId,
            },
        });

        return this.prisma.client.userSkill.update({
            where: { id: userSkillId },
            data: {
                level: data.level,
                levelLabel: this.getLevelLabel(data.level),
                evidenceCount: { increment: 1 },
            },
        });
    }

    async deleteUserSkill(userId: string, id: string) {
        const userSkill = await this.prisma.client.userSkill.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!userSkill) {
            throw new NotFoundException('UserSkill not found');
        }

        await this.membership.assertOrganizationMember(
            userId,
            userSkill.organizationId,
        );

        return this.prisma.client.userSkill.delete({ where: { id } });
    }

    private calculateLevel(practiceCount: number): number {
        let level = 1;
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (practiceCount >= LEVEL_THRESHOLDS[i]) {
                level = i + 1;
            }
        }
        return Math.min(level, 10);
    }

    private getLevelLabel(level: number): string {
        if (level <= 2) return 'infant';
        if (level <= 4) return 'junior';
        if (level <= 6) return 'middle';
        if (level === 7) return 'middle+';
        if (level <= 9) return 'senior';
        return 'guru';
    }
}