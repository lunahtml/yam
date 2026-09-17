var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/common/services/membership.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
// import { ProjectRole } from '../types/roles.type.js';
import { PRIVILEGED_ROLES } from '../types/roles.type.js';
let MembershipService = class MembershipService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertWorkspaceMember(userId, workspaceId) {
        const membership = await this.prisma.client.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException('Access denied to workspace');
        }
        return membership;
    }
    async assertWorkspaceRole(userId, workspaceId, allowedRoles) {
        const membership = await this.assertWorkspaceMember(userId, workspaceId);
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Insufficient role');
        }
        return membership;
    }
    async assertProjectMember(userId, projectId) {
        const project = await this.prisma.client.project.findUnique({
            where: { id: projectId },
            select: { id: true, workspaceId: true, name: true, status: true },
        });
        if (!project) {
            throw new ForbiddenException('Access denied to project');
        }
        const wsMembership = await this.prisma.client.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId,
                },
            },
        });
        // const PRIVILEGED: readonly string[] = ['owner', 'admin'];
        // if (wsMembership && PRIVILEGED.includes(wsMembership.role)) {
        //     return { project, membership: wsMembership };
        // }
        if (wsMembership && PRIVILEGED_ROLES.includes(wsMembership.role)) {
            return { project, membership: wsMembership };
        }
        const projMembership = await this.prisma.client.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (projMembership) {
            return { project, membership: projMembership };
        }
        if (wsMembership) {
            return { project, membership: wsMembership };
        }
        throw new ForbiddenException('Access denied to project');
    }
    async assertProjectRole(userId, projectId, allowedRoles) {
        const { project, membership } = await this.assertProjectMember(userId, projectId);
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Insufficient role');
        }
        return { project, membership };
    }
    async assertOrganizationMember(userId, organizationId) {
        const membership = await this.prisma.client.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException('Access denied to organization');
        }
        return membership;
    }
    async assertOrganizationRole(userId, organizationId, allowedRoles) {
        const membership = await this.assertOrganizationMember(userId, organizationId);
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Insufficient role');
        }
        return membership;
    }
};
MembershipService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], MembershipService);
export { MembershipService };
//# sourceMappingURL=membership.service.js.map