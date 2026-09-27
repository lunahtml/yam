var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/sprint-retros.service.ts
import { Injectable, ForbiddenException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
let SprintRetrosService = class SprintRetrosService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async upsert(userId, sprintId, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true, status: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        if (sprint.status !== 'ACTIVE' && sprint.status !== 'COMPLETED') {
            throw new BadRequestException('Retro is allowed only for active or completed sprint');
        }
        await this.membership.assertProjectMember(userId, sprint.projectId);
        return this.prisma.client.sprintRetro.upsert({
            where: { sprintId_userId: { sprintId, userId } },
            create: {
                sprintId,
                userId,
                goalAchievement: data.goalAchievement,
                teamwork: data.teamwork,
                process: data.process,
                quality: data.quality,
                speed: data.speed,
                overall: data.overall,
                wellDone: data.wellDone,
                improvements: data.improvements,
                notes: data.notes,
            },
            update: {
                goalAchievement: data.goalAchievement,
                teamwork: data.teamwork,
                process: data.process,
                quality: data.quality,
                speed: data.speed,
                overall: data.overall,
                wellDone: data.wellDone,
                improvements: data.improvements,
                notes: data.notes,
            },
        });
    }
    async findBySprint(userId, sprintId) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectMember(userId, sprint.projectId);
        const retros = await this.prisma.client.sprintRetro.findMany({
            where: { sprintId },
            include: {
                user: {
                    select: { id: true, email: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const avg = (field) => {
            const values = retros
                .map((r) => r[field])
                .filter((v) => v !== null && v !== undefined);
            return values.length === 0
                ? 0
                : values.reduce((a, b) => a + b, 0) / values.length;
        };
        return {
            retros,
            averages: {
                goalAchievement: avg('goalAchievement'),
                teamwork: avg('teamwork'),
                process: avg('process'),
                quality: avg('quality'),
                speed: avg('speed'),
                overall: avg('overall'),
            },
            count: retros.length,
        };
    }
    async getMy(userId, sprintId) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectMember(userId, sprint.projectId);
        return this.prisma.client.sprintRetro.findUnique({
            where: { sprintId_userId: { sprintId, userId } },
        });
    }
};
SprintRetrosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], SprintRetrosService);
export { SprintRetrosService };
//# sourceMappingURL=sprint-retros.service.js.map