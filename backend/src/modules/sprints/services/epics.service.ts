//backend/src/modules/sprints/services/epics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateEpicDto,
    UpdateEpicDto,
} from '../contracts/create-epic.dto.js';

@Injectable()
export class EpicsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateEpicDto) {
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

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        const epics = await this.prisma.client.epic.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { sprints: true } },
            },
        });

        // Для каждого эпика — сколько спринтов завершено
        const completedCounts = await this.prisma.client.sprint.groupBy({
            by: ['epicId'],
            where: {
                epicId: { in: epics.map((e) => e.id) },
                status: 'COMPLETED',
            },
            _count: { _all: true },
        });

        const completedMap = new Map(
            completedCounts
                .filter((row) => row.epicId !== null)
                .map((row) => [row.epicId as string, row._count._all]),
        );

        return epics.map((epic) => ({
            ...epic,
            completedSprints: completedMap.get(epic.id) ?? 0,
        }));
    }

    async findById(userId: string, id: string) {
        const epic = await this.prisma.client.epic.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!epic) {
            throw new ForbiddenException('Access denied to epic');
        }

        await this.membership.assertProjectMember(userId, epic.projectId);

        return this.prisma.client.epic.findUnique({
            where: { id },
            include: {
                sprints: {
                    orderBy: { number: 'desc' },
                    include: {
                        _count: {
                            select: {
                                increments: true,
                                metrics: true,
                                events: true,
                                records: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(userId: string, id: string, data: UpdateEpicDto) {
        const epic = await this.prisma.client.epic.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!epic) {
            throw new ForbiddenException('Access denied to epic');
        }

        await this.membership.assertProjectRole(
            userId,
            epic.projectId,
            EDIT_ROLES,
        );

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

    async remove(userId: string, id: string) {
        const epic = await this.prisma.client.epic.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!epic) {
            throw new ForbiddenException('Access denied to epic');
        }

        await this.membership.assertProjectRole(
            userId,
            epic.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.epic.delete({
            where: { id },
        });
    }
}