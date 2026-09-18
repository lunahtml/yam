var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/entities/services/entities.service.ts
import { Injectable, ForbiddenException, ConflictException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES, } from '../../../common/types/roles.type.js';
import { ENTITY_TEMPLATES } from '../templates/entity-templates.js';
let EntitiesService = class EntitiesService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        const exists = await this.prisma.client.entity.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });
        if (exists) {
            throw new ConflictException('Entity with this name already exists in the project');
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
    async createFromTemplate(userId, projectId, templateKey) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        const template = ENTITY_TEMPLATES.find((t) => t.key === templateKey);
        if (!template) {
            throw new BadRequestException(`Unknown template: ${templateKey}`);
        }
        // Создаём entity
        // Проверка уникальности + автосуффикс
        let entityName = template.entity.name;
        let entityLabel = template.entity.label;
        const exists = await this.prisma.client.entity.findUnique({
            where: { projectId_name: { projectId, name: entityName } },
        });
        if (exists) {
            // Ищем свободный суффикс
            let counter = 2;
            while (true) {
                const candidate = `${template.entity.name}_${counter}`;
                const taken = await this.prisma.client.entity.findUnique({
                    where: { projectId_name: { projectId, name: candidate } },
                });
                if (!taken) {
                    entityName = candidate;
                    entityLabel = `${template.entity.label} ${counter}`;
                    break;
                }
                counter++;
            }
        }
        // Создаём entity
        const entity = await this.prisma.client.entity.create({
            data: {
                projectId,
                name: entityName,
                label: entityLabel,
                icon: template.entity.icon,
                isSystem: false,
            },
        });
        // Создаём поля
        for (const f of template.fields) {
            await this.prisma.client.field.create({
                data: {
                    entityId: entity.id,
                    name: f.name,
                    label: f.label,
                    type: f.type,
                    isRequired: f.isRequired ?? false,
                    options: f.options,
                },
            });
        }
        // Создаём default view
        await this.prisma.client.view.create({
            data: {
                entityId: entity.id,
                projectId,
                name: template.defaultView.name,
                type: template.defaultView.type,
                config: template.defaultView.config,
                isDefault: true,
            },
        });
        return entity;
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.entity.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { fields: true, records: true } },
            },
        });
    }
    async findById(userId, id) {
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
    async update(userId, id, data) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }
        await this.membership.assertProjectRole(userId, entity.projectId, EDIT_ROLES);
        return this.prisma.client.entity.update({
            where: { id },
            data: {
                label: data.label,
                icon: data.icon,
                color: data.color,
            },
        });
    }
    async remove(userId, id) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id },
            select: { projectId: true, isSystem: true, _count: { select: { records: true } } },
        });
        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }
        await this.membership.assertProjectRole(userId, entity.projectId, DESTRUCTIVE_ROLES);
        if (entity.isSystem) {
            throw new ForbiddenException('System entities cannot be deleted');
        }
        if (entity._count.records > 0) {
            throw new ConflictException(`Cannot delete entity with ${entity._count.records} records. Delete records first.`);
        }
        return this.prisma.client.entity.delete({
            where: { id },
        });
    }
};
EntitiesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], EntitiesService);
export { EntitiesService };
//# sourceMappingURL=entities.service.js.map