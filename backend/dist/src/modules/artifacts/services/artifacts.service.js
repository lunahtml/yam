var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/artifacts/services/artifacts.service.ts
import { Injectable, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let ArtifactsService = class ArtifactsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        return this.prisma.client.artifact.create({
            data: {
                projectId,
                type: data.type,
                name: data.name,
                url: data.url || null,
                description: data.description,
                metadata: data.metadata,
                isActive: data.isActive,
            },
        });
    }
    async findByProject(userId, projectId, type) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.artifact.findMany({
            where: {
                projectId,
                ...(type ? { type } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(userId, id) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { id: true, projectId: true },
        });
        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }
        await this.membership.assertProjectMember(userId, artifact.projectId);
        return this.prisma.client.artifact.findUnique({
            where: { id },
        });
    }
    async update(userId, id, data) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }
        await this.membership.assertProjectRole(userId, artifact.projectId, EDIT_ROLES);
        return this.prisma.client.artifact.update({
            where: { id },
            data: {
                type: data.type,
                name: data.name,
                url: data.url || null,
                description: data.description,
                metadata: data.metadata,
                isActive: data.isActive,
            },
        });
    }
    async remove(userId, id) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }
        await this.membership.assertProjectRole(userId, artifact.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.artifact.delete({
            where: { id },
        });
    }
};
ArtifactsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], ArtifactsService);
export { ArtifactsService };
//# sourceMappingURL=artifacts.service.js.map