//backend/src/modules/sprints/services/sprint-goals.service.ts
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
import {
    CreateSprintGoalDto,
    UpdateSprintGoalDto,
} from '../contracts/sprint-goal.dto.js';

@Injectable()
export class SprintGoalsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, sprintId: string, data: CreateSprintGoalDto) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true, status: true },
        });

        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }

        if (sprint.status === 'COMPLETED' || sprint.status === 'CANCELLED') {
            throw new BadRequestException(
                'Cannot add goals to a completed or cancelled sprint',
            );
        }

        await this.membership.assertProjectRole(
            userId,
            sprint.projectId,
            EDIT_ROLES,
        );

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

    async findBySprint(userId: string, sprintId: string) {
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

    async update(userId: string, id: string, data: UpdateSprintGoalDto) {
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
            throw new BadRequestException(
                'Cannot edit goals of a completed sprint',
            );
        }

        await this.membership.assertProjectRole(
            userId,
            goal.sprint.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.sprintGoal.update({
            where: { id },
            data: {
                text: data.text,
                description: data.description,
                order: data.order,
            },
        });
    }

    async remove(userId: string, id: string) {
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
            throw new BadRequestException(
                'Cannot delete goals of a completed sprint',
            );
        }

        await this.membership.assertProjectRole(
            userId,
            goal.sprint.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.sprintGoal.delete({
            where: { id },
        });
    }
}