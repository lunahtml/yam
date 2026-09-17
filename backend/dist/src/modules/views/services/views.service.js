var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/views/services/views.service.ts
import { Injectable, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let ViewsService = class ViewsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        const entity = await this.prisma.client.entity.findUnique({
            where: { id: data.entityId },
            select: { projectId: true },
        });
        if (!entity) {
            throw new ForbiddenException('Access denied to entity');
        }
        await this.membership.assertProjectRole(userId, entity.projectId, EDIT_ROLES);
        return this.prisma.client.view.create({
            data: {
                entityId: data.entityId,
                projectId: entity.projectId,
                name: data.name,
                type: data.type,
                config: (data.config ?? {}),
                isDefault: data.isDefault,
            },
        });
    }
    async findByEntity(userId, entityId) {
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
    async findById(userId, id) {
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
    async update(userId, id, data) {
        const view = await this.prisma.client.view.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!view) {
            throw new ForbiddenException('Access denied to view');
        }
        await this.membership.assertProjectRole(userId, view.projectId, EDIT_ROLES);
        return this.prisma.client.view.update({
            where: { id },
            data: {
                name: data.name,
                config: data.config
                    ? data.config
                    : undefined,
                isDefault: data.isDefault,
            },
        });
    }
    async remove(userId, id) {
        const view = await this.prisma.client.view.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!view) {
            throw new ForbiddenException('Access denied to view');
        }
        await this.membership.assertProjectRole(userId, view.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.view.delete({
            where: { id },
        });
    }
};
ViewsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], ViewsService);
export { ViewsService };
//# sourceMappingURL=views.service.js.map