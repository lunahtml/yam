var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/metrics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let MetricsService = class MetricsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
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
        return this.prisma.client.sprintMetric.create({
            data: {
                sprintId,
                key: data.key,
                label: data.label,
                metricType: data.metricType,
                targetValue: data.targetValue,
                actualValue: data.actualValue,
                unit: data.unit,
                xpReward: data.xpReward,
            },
        });
    }
    async update(userId, id, data) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });
        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }
        await this.membership.assertProjectRole(userId, metric.sprint.projectId, EDIT_ROLES);
        return this.prisma.client.sprintMetric.update({
            where: { id },
            data: {
                label: data.label,
                metricType: data.metricType,
                targetValue: data.targetValue,
                actualValue: data.actualValue,
                unit: data.unit,
                xpReward: data.xpReward,
            },
        });
    }
    async remove(userId, id) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });
        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }
        await this.membership.assertProjectRole(userId, metric.sprint.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.sprintMetric.delete({
            where: { id },
        });
    }
};
MetricsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], MetricsService);
export { MetricsService };
//# sourceMappingURL=metrics.service.js.map