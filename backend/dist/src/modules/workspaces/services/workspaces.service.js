var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/workspaces/services/workspaces.service.ts
import { Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { DESTRUCTIVE_ROLES, EDIT_ROLES, ORG_PRIVILEGED_ROLES, } from '../../../common/types/roles.type.js';
let WorkspacesService = class WorkspacesService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        await this.membership.assertOrganizationRole(userId, data.organizationId, ORG_PRIVILEGED_ROLES);
        const workspace = await this.prisma.client.workspace.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
            },
        });
        await this.prisma.client.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId,
                role: 'owner',
            },
        });
        return workspace;
    }
    async findById(userId, id) {
        await this.membership.assertWorkspaceMember(userId, id);
        const workspace = await this.prisma.client.workspace.findUnique({
            where: { id },
            include: {
                organization: { select: { id: true, name: true } },
                _count: { select: { projects: true, members: true } },
            },
        });
        if (!workspace)
            throw new NotFoundException('Workspace not found');
        return workspace;
    }
    async update(userId, id, data) {
        await this.membership.assertWorkspaceRole(userId, id, EDIT_ROLES);
        return this.prisma.client.workspace.update({
            where: { id },
            data,
        });
    }
    async remove(userId, id) {
        await this.membership.assertWorkspaceRole(userId, id, DESTRUCTIVE_ROLES);
        return this.prisma.client.workspace.delete({
            where: { id },
        });
    }
    async listByOrganization(userId, organizationId) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        return this.prisma.client.workspace.findMany({
            where: { organizationId },
            include: {
                _count: { select: { projects: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listMyWorkspaces(userId) {
        const memberships = await this.prisma.client.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        organization: { select: { id: true, name: true } },
                        _count: { select: { projects: true, members: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return memberships.map((m) => ({
            ...m.workspace,
            role: m.role,
        }));
    }
};
WorkspacesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], WorkspacesService);
export { WorkspacesService };
//# sourceMappingURL=workspaces.service.js.map