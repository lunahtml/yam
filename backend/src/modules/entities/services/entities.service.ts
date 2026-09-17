//backend/src/modules/entities/services/entities.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    EDIT_ROLES,
    DESTRUCTIVE_ROLES,
} from '../../../common/types/roles.type.js';
import { CreateEntityDto } from '../contracts/create-entity.dto.js';
import { UpdateEntityDto } from '../contracts/update-entity.dto.js';

@Injectable()
export class EntitiesService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateEntityDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const exists = await this.prisma.client.entity.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });

        if (exists) {
            throw new ConflictException(
                'Entity with this name already exists in the project',
            );
        }

        // Если указан moduleId — проверяем, что модуль из того же проекта
        if (data.moduleId) {
            const module = await this.prisma.client.projectModule.findUnique({
                where: { id: data.moduleId },
                select: { projectId: true },
            });

            if (!module || module.projectId !== projectId) {
                throw new ConflictException('Module does not belong to this project');
            }
        }

        return this.prisma.client.entity.create({
            data: {
                projectId,
                moduleId: data.moduleId,
                name: data.name,
                label: data.label,
                icon: data.icon,
                color: data.color,
                isSystem: false,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.entity.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { fields: true, records: true } },
            },
        });
    }

    async findById(userId: string, id: string) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id },
            select: { id: true, projectId: true },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectMember(userId, entity.projectId);

        return this.prisma.client.entity.findUnique({
            where: { id },
            include: {
                fields: { orderBy: { createdAt: 'asc' } },
                _count: { select: { records: true } },
            },
        });
    }

    async update(userId: string, id: string, data: UpdateEntityDto) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id },
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

        return this.prisma.client.entity.update({
            where: { id },
            data: {
                label: data.label,
                icon: data.icon,
                color: data.color,
            },
        });
    }

    async remove(userId: string, id: string) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id },
            select: { projectId: true, isSystem: true, _count: { select: { records: true } } },
        });

        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }

        await this.membership.assertProjectRole(
            userId,
            entity.projectId,
            DESTRUCTIVE_ROLES,
        );

        if (entity.isSystem) {
            throw new ForbiddenException('System entities cannot be deleted');
        }

        if (entity._count.records > 0) {
            throw new ConflictException(
                `Cannot delete entity with ${entity._count.records} records. Delete records first.`,
            );
        }

        return this.prisma.client.entity.delete({
            where: { id },
        });
    }
}