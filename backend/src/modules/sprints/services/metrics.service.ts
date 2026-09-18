//backend/src/modules/sprints/services/metrics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateMetricDto,
    UpdateMetricDto,
} from '../contracts/create-metric.dto.js';

@Injectable()
export class MetricsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, sprintId: string, data: CreateMetricDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectRole(
            userId,
            sprint.projectId,
            EDIT_ROLES,
        );

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

    async update(userId: string, id: string, data: UpdateMetricDto) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });

        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }

        await this.membership.assertProjectRole(
            userId,
            metric.sprint.projectId,
            EDIT_ROLES,
        );

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

    async remove(userId: string, id: string) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });

        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }

        await this.membership.assertProjectRole(
            userId,
            metric.sprint.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.sprintMetric.delete({
            where: { id },
        });
    }
}