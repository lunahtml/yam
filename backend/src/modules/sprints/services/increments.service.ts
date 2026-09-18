//backend/src/modules/sprints/services/increments.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateIncrementDto,
    UpdateIncrementDto,
} from '../contracts/create-increment.dto.js';

@Injectable()
export class IncrementsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, sprintId: string, data: CreateIncrementDto) {
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

        return this.prisma.client.increment.create({
            data: {
                sprintId,
                projectId: sprint.projectId,
                name: data.name,
                description: data.description,
                icon: data.icon,
                xp: data.xp,
                createdById: userId,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.increment.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                sprint: { select: { id: true, name: true, number: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });
    }

    async update(userId: string, id: string, data: UpdateIncrementDto) {
        const inc = await this.prisma.client.increment.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!inc) {
            throw new ForbiddenException('Access denied to increment');
        }

        await this.membership.assertProjectRole(
            userId,
            inc.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.increment.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                xp: data.xp,
            },
        });
    }

    async remove(userId: string, id: string) {
        const inc = await this.prisma.client.increment.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!inc) {
            throw new ForbiddenException('Access denied to increment');
        }

        await this.membership.assertProjectRole(
            userId,
            inc.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.increment.delete({
            where: { id },
        });
    }
}