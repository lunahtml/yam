var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend\src\modules\projects\services\projects.service.ts
import { Injectable, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { DESTRUCTIVE_ROLES, EDIT_ROLES } from '../../../common/types/roles.type.js';
let ProjectsService = class ProjectsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        await this.membership.assertWorkspaceMember(userId, data.workspaceId);
        return this.prisma.client.project.create({
            data: {
                workspaceId: data.workspaceId,
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
    async update(userId, id, data) {
        await this.membership.assertProjectRole(userId, id, EDIT_ROLES);
        return this.prisma.client.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
    async findById(userId, id) {
        const { project } = await this.membership.assertProjectMember(userId, id);
        return project;
    }
    async findByWorkspace(userId, workspaceId) {
        await this.membership.assertWorkspaceMember(userId, workspaceId);
        return this.prisma.client.project.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async archive(userId, id) {
        await this.membership.assertProjectRole(userId, id, DESTRUCTIVE_ROLES);
        return this.prisma.client.project.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }
    async remove(userId, id) {
        await this.membership.assertProjectRole(userId, id, DESTRUCTIVE_ROLES);
        return this.prisma.client.project.delete({
            where: { id },
        });
    }
};
ProjectsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], ProjectsService);
export { ProjectsService };
//# sourceMappingURL=projects.service.js.map