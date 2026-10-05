var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/increments.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { XpService } from '../../gamification/services/xp.service.js';
import { AchievementsService } from '../../gamification/services/achievements.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let IncrementsService = class IncrementsService {
    prisma;
    membership;
    xp;
    achievements;
    constructor(prisma, membership, xp, achievements) {
        this.prisma = prisma;
        this.membership = membership;
        this.xp = xp;
        this.achievements = achievements;
    }
    async create(userId, sprintId, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
        const increment = await this.prisma.client.increment.create({
            data: {
                sprintId,
                projectId: sprint.projectId,
                name: data.name,
                description: data.description,
                icon: data.icon,
                xp: data.xp,
                createdById: userId,
            },
        });
        if (data.xp > 0) {
            await this.xp.addXp(userId, data.xp, 'INCREMENT', increment.id, `Инкремент: ${data.name}`);
        }
        // Триггеры автоматических ачивок
        try {
            const project = await this.prisma.client.project.findUnique({
                where: { id: sprint.projectId },
                select: { workspace: { select: { organizationId: true } } },
            });
            const organizationId = project?.workspace?.organizationId;
            if (organizationId) {
                const incCount = await this.prisma.client.increment.count({
                    where: { createdById: userId },
                });
                if (incCount === 1) {
                    await this.achievements.grantAutomatic(userId, organizationId, 'first_increment', 'Первый инкремент');
                }
                if (incCount === 10) {
                    await this.achievements.grantAutomatic(userId, organizationId, 'ten_increments', '10 инкрементов');
                }
            }
        }
        catch (err) {
            console.error('Increment achievements trigger error:', err);
        }
        return increment;
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.increment.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                sprint: { select: { id: true, name: true, number: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });
    }
    async update(userId, id, data) {
        const inc = await this.prisma.client.increment.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!inc) {
            throw new ForbiddenException('Access denied to increment');
        }
        await this.membership.assertProjectRole(userId, inc.projectId, EDIT_ROLES);
        return this.prisma.client.increment.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                xp: data.xp,
            },
        });
    }
    async remove(userId, id) {
        const inc = await this.prisma.client.increment.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!inc) {
            throw new ForbiddenException('Access denied to increment');
        }
        await this.membership.assertProjectRole(userId, inc.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.increment.delete({
            where: { id },
        });
    }
};
IncrementsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService,
        XpService,
        AchievementsService])
], IncrementsService);
export { IncrementsService };
//# sourceMappingURL=increments.service.js.map