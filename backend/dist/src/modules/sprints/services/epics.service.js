var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/epics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let EpicsService = class EpicsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        return this.prisma.client.epic.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
                color: data.color,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.epic.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(userId, id, data) {
        const epic = await this.prisma.client.epic.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!epic) {
            throw new ForbiddenException('Access denied to epic');
        }
        await this.membership.assertProjectRole(userId, epic.projectId, EDIT_ROLES);
        return this.prisma.client.epic.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                status: data.status,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
    async remove(userId, id) {
        const epic = await this.prisma.client.epic.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!epic) {
            throw new ForbiddenException('Access denied to epic');
        }
        await this.membership.assertProjectRole(userId, epic.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.epic.delete({
            where: { id },
        });
    }
};
EpicsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], EpicsService);
export { EpicsService };
//# sourceMappingURL=epics.service.js.map