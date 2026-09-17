//backend/src/modules/views/services/views.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { CreateViewDto } from '../contracts/create-view.dto.js';
import { UpdateViewDto } from '../contracts/update-view.dto.js';

@Injectable()
export class ViewsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateViewDto) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: data.entityId },
            select: { projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectRole(
            userId,
            entity.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.view.create({
            data: {
                entityId: data.entityId,
                projectId: entity.projectId,
                name: data.name,
                type: data.type,
                config: (data.config ?? {}) as Prisma.InputJsonValue,
                isDefault: data.isDefault,
            },
        });
    }

    async findByEntity(userId: string, entityId: string) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: entityId },
            select: { projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectMember(userId, entity.projectId);

        return this.prisma.client.view.findMany({
            where: { entityId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async findById(userId: string, id: string) {
        const view = await this.prisma.client.view.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!view) {
            throw new ForbiddenException('Access denied to view');
        }

        await this.membership.assertProjectMember(userId, view.projectId);

        return this.prisma.client.view.findUnique({
            where: { id },
        });
    }

    async update(userId: string, id: string, data: UpdateViewDto) {
        const view = await this.prisma.client.view.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!view) {
            throw new ForbiddenException('Access denied to view');
        }

        await this.membership.assertProjectRole(
            userId,
            view.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.view.update({
            where: { id },
            data: {
                name: data.name,
                config: data.config
                    ? (data.config as Prisma.InputJsonValue)
                    : undefined,
                isDefault: data.isDefault,
            },
        });
    }

    async remove(userId: string, id: string) {
        const view = await this.prisma.client.view.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!view) {
            throw new ForbiddenException('Access denied to view');
        }

        await this.membership.assertProjectRole(
            userId,
            view.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.view.delete({
            where: { id },
        });
    }
}