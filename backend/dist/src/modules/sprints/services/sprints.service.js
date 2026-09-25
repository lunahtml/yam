var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/sprints.service.ts
import { Injectable, ForbiddenException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES, } from '../../../common/types/roles.type.js';
let SprintsService = class SprintsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        // Автонумерация спринтов
        const lastSprint = await this.prisma.client.sprint.findFirst({
            where: { projectId },
            orderBy: { number: 'desc' },
            select: { number: true },
        });
        const number = (lastSprint?.number ?? 0) + 1;
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (endDate <= startDate) {
            throw new BadRequestException('End date must be after start date');
        }
        return this.prisma.client.sprint.create({
            data: {
                projectId,
                number,
                name: data.name,
                goal: data.goal,
                description: data.description,
                startDate,
                endDate,
                status: 'PLANNED',
                epicId: data.epicId,
            },
            include: {
                epic: { select: { id: true, name: true, color: true } },
            },
        });
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.sprint.findMany({
            where: { projectId },
            orderBy: { number: 'desc' },
            include: {
                epic: { select: { id: true, name: true, color: true } },
                _count: {
                    select: {
                        increments: true,
                        metrics: true,
                        events: true,
                        records: true,
                    },
                },
            },
        });
    }
    async findById(userId, id) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectMember(userId, sprint.projectId);
        return this.prisma.client.sprint.findUnique({
            where: { id },
            include: {
                epic: { select: { id: true, name: true, color: true } },
                metrics: { orderBy: { createdAt: 'asc' } },
                events: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, email: true, name: true } },
                    },
                },
                increments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, email: true, name: true } },
                    },
                },
            },
        });
    }
    async findRecords(userId, sprintId) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectMember(userId, sprint.projectId);
        return this.prisma.client.record.findMany({
            where: { sprintId },
            include: {
                creator: { select: { id: true, email: true, name: true } },
                entity: { select: { id: true, name: true, label: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(userId, id, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
        return this.prisma.client.sprint.update({
            where: { id },
            data: {
                name: data.name,
                goal: data.goal,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                status: data.status,
                epicId: data.epicId,
            },
            include: {
                epic: { select: { id: true, name: true, color: true } },
            },
        });
    }
    async remove(userId, id) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.sprint.delete({
            where: { id },
        });
    }
};
SprintsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], SprintsService);
export { SprintsService };
//# sourceMappingURL=sprints.service.js.map