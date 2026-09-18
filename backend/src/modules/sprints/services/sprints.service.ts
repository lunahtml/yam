//backend/src/modules/sprints/services/sprints.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    EDIT_ROLES,
    DESTRUCTIVE_ROLES,
} from '../../../common/types/roles.type.js';
import { CreateSprintDto } from '../contracts/create-sprint.dto.js';
import { UpdateSprintDto } from '../contracts/update-sprint.dto.js';

@Injectable()
export class SprintsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateSprintDto) {
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
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.sprint.findMany({
            where: { projectId },
            orderBy: { number: 'desc' },
            include: {
                _count: {
                    select: { increments: true, metrics: true, events: true },
                },
            },
        });
    }

    async findById(userId: string, id: string) {
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
    async findRecords(userId: string, sprintId: string) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectMember(userId, sprint.projectId);

        // Находим все records, где data.sprintId = sprintId
        const indexes = await this.prisma.client.recordIndex.findMany({
            where: {
                projectId: sprint.projectId,
                fieldName: 'sprintId',
                valueText: sprintId,
            },
            select: { recordId: true },
        });

        const recordIds = indexes.map((i) => i.recordId);

        if (recordIds.length === 0) return [];

        return this.prisma.client.record.findMany({
            where: { id: { in: recordIds } },
            include: {
                creator: { select: { id: true, email: true, name: true } },
                entity: { select: { id: true, name: true, label: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(userId: string, id: string, data: UpdateSprintDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
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

        return this.prisma.client.sprint.update({
            where: { id },
            data: {
                name: data.name,
                goal: data.goal,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                status: data.status,
            },
        });
    }

    async remove(userId: string, id: string) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        await this.membership.assertProjectRole(
            userId,
            sprint.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.sprint.delete({
            where: { id },
        });
    }
}