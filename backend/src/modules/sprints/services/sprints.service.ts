//backend/src/modules/sprints/services/sprints.service.ts
import {
    Injectable,
    ForbiddenException,
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
import { CompleteSprintDto } from '../contracts/complete-sprint.dto.js';
import { AchievementsService } from '../../gamification/services/achievements.service.js';

@Injectable()
export class SprintsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
        private achievements: AchievementsService,
    ) { }

    async create(userId: string, projectId: string, data: CreateSprintDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

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

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        const sprints = await this.prisma.client.sprint.findMany({
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

        const sprintsWithAchieved = await Promise.all(
            sprints.map(async (sprint) => {
                const achievedMetrics = await this.prisma.client.sprintMetric.count({
                    where: { sprintId: sprint.id, isAchieved: true },
                });
                return { ...sprint, achievedMetrics };
            }),
        );

        return sprintsWithAchieved;
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
                sprintGoals: { orderBy: { order: 'asc' } },
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

    async findRecords(userId: string, sprintId: string) {
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
                epicId: data.epicId,
            },
            include: {
                epic: { select: { id: true, name: true, color: true } },
            },
        });
    }

    async complete(userId: string, id: string, data: CompleteSprintDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id },
            select: {
                id: true,
                projectId: true,
                number: true,
                status: true,
                epicId: true,
                sprintGoals: { select: { id: true } },
            },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        if (sprint.status !== 'ACTIVE') {
            throw new BadRequestException('Only active sprint can be completed');
        }

        await this.membership.assertProjectRole(
            userId,
            sprint.projectId,
            EDIT_ROLES,
        );

        const goalIds = new Set(sprint.sprintGoals.map((g) => g.id));
        const providedIds = new Set(data.goals.map((g) => g.id));

        if (data.goals.length !== goalIds.size) {
            throw new BadRequestException('All sprint goals must be evaluated');
        }

        for (const gid of goalIds) {
            if (!providedIds.has(gid)) {
                throw new BadRequestException(`Goal ${gid} was not evaluated`);
            }
        }

        const result = await this.prisma.client.$transaction(async (tx) => {
            for (const g of data.goals) {
                await tx.sprintGoal.update({
                    where: { id: g.id },
                    data: {
                        status:
                            g.action === 'ACHIEVED'
                                ? 'ACHIEVED'
                                : g.action === 'CARRIED_OVER'
                                    ? 'CARRIED_OVER'
                                    : g.action === 'MOVED_BACKLOG'
                                        ? 'MOVED_BACKLOG'
                                        : 'CANCELLED',
                        movedToBacklog: g.action === 'MOVED_BACKLOG',
                    },
                });
            }

            const completedSprint = await tx.sprint.update({
                where: { id },
                data: { status: 'COMPLETED' },
            });

            let nextSprint = null;

            if (data.createNextSprint && data.nextSprint) {
                const nextStartDate = new Date(data.nextSprint.startDate);
                const nextEndDate = new Date(data.nextSprint.endDate);

                if (nextEndDate <= nextStartDate) {
                    throw new BadRequestException(
                        'End date must be after start date',
                    );
                }

                const lastSprint = await tx.sprint.findFirst({
                    where: { projectId: sprint.projectId },
                    orderBy: { number: 'desc' },
                    select: { number: true },
                });

                const nextNumber = (lastSprint?.number ?? sprint.number) + 1;

                nextSprint = await tx.sprint.create({
                    data: {
                        projectId: sprint.projectId,
                        number: nextNumber,
                        name: data.nextSprint.name,
                        goal: data.nextSprint.goal,
                        startDate: nextStartDate,
                        endDate: nextEndDate,
                        status: 'PLANNED',
                        epicId: sprint.epicId,
                    },
                });

                const carriedGoals = await tx.sprintGoal.findMany({
                    where: { sprintId: id, status: 'CARRIED_OVER' },
                    orderBy: { order: 'asc' },
                });

                for (const goal of carriedGoals) {
                    await tx.sprintGoal.create({
                        data: {
                            sprintId: nextSprint.id,
                            text: goal.text,
                            description: goal.description,
                            status: 'PENDING',
                            order: goal.order,
                            carriedFromId: goal.id,
                        },
                    });
                }

                if (data.carryOverTasks) {
                    await tx.record.updateMany({
                        where: {
                            sprintId: id,
                            data: { path: ['status'], not: 'done' },
                        },
                        data: { sprintId: nextSprint.id },
                    });
                }
            }

            return { sprint: completedSprint, nextSprint };
        });

        // Триггеры автоматических ачивок для всех членов проекта
        try {
            const project = await this.prisma.client.project.findUnique({
                where: { id: sprint.projectId },
                select: { workspace: { select: { organizationId: true } } },
            });
            const organizationId = project?.workspace?.organizationId;

            if (organizationId) {
                const members = await this.prisma.client.projectMember.findMany({
                    where: { projectId: sprint.projectId },
                    select: { userId: true },
                });

                const completedCount = await this.prisma.client.sprint.count({
                    where: {
                        projectId: sprint.projectId,
                        status: 'COMPLETED',
                    },
                });

                for (const m of members) {
                    if (completedCount === 1) {
                        await this.achievements.grantAutomatic(
                            m.userId,
                            organizationId,
                            'first_sprint',
                            'Первый завершённый спринт',
                        );
                    }
                    if (completedCount === 10) {
                        await this.achievements.grantAutomatic(
                            m.userId,
                            organizationId,
                            'ten_sprints',
                            '10 завершённых спринтов',
                        );
                    }
                }
            }
        } catch (err) {
            console.error('Sprint achievements trigger error:', err);
        }

        return result;
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