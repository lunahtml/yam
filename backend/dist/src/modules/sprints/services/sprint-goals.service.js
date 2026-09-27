var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/sprint-goals.service.ts
import { Injectable, ForbiddenException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES, } from '../../../common/types/roles.type.js';
let SprintGoalsService = class SprintGoalsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, sprintId, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true, status: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        if (sprint.status === 'COMPLETED' || sprint.status === 'CANCELLED') {
            throw new BadRequestException('Cannot add goals to a completed or cancelled sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
        const lastGoal = await this.prisma.client.sprintGoal.findFirst({
            where: { sprintId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });
        return this.prisma.client.sprintGoal.create({
            data: {
                sprintId,
                text: data.text,
                description: data.description,
                order: (lastGoal?.order ?? -1) + 1,
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
        return this.prisma.client.sprintGoal.findMany({
            where: { sprintId },
            orderBy: { order: 'asc' },
        });
    }
    async update(userId, id, data) {
        const goal = await this.prisma.client.sprintGoal.findUnique({
            where: { id },
            select: {
                sprint: { select: { projectId: true, status: true } },
            },
        });
        if (!goal) {
            throw new ForbiddenException('Access denied to goal');
        }
        if (goal.sprint.status === 'COMPLETED') {
            throw new BadRequestException('Cannot edit goals of a completed sprint');
        }
        await this.membership.assertProjectRole(userId, goal.sprint.projectId, EDIT_ROLES);
        return this.prisma.client.sprintGoal.update({
            where: { id },
            data: {
                text: data.text,
                description: data.description,
                order: data.order,
            },
        });
    }
    async remove(userId, id) {
        const goal = await this.prisma.client.sprintGoal.findUnique({
            where: { id },
            select: {
                sprint: { select: { projectId: true, status: true } },
            },
        });
        if (!goal) {
            throw new ForbiddenException('Access denied to goal');
        }
        if (goal.sprint.status === 'COMPLETED') {
            throw new BadRequestException('Cannot delete goals of a completed sprint');
        }
        await this.membership.assertProjectRole(userId, goal.sprint.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.sprintGoal.delete({
            where: { id },
        });
    }
};
SprintGoalsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], SprintGoalsService);
export { SprintGoalsService };
//# sourceMappingURL=sprint-goals.service.js.map