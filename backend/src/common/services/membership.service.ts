//backend/src/common/services/membership.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ProjectRole } from '../types/roles.type.js';
import { OrgRole } from '../../generated/prisma/enums.js';

@Injectable()
export class MembershipService {
    constructor(private prisma: PrismaService) { }

    async assertWorkspaceMember(userId: string, workspaceId: string) {
        const membership = await this.prisma.client.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied to workspace');
        }

        return membership;
    }

    async assertWorkspaceRole(
        userId: string,
        workspaceId: string,
        allowedRoles: readonly string[],
    ) {
        const membership = await this.assertWorkspaceMember(userId, workspaceId);

        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Insufficient role');
        }

        return membership;
    }

    async assertProjectMember(userId: string, projectId: string) {
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

        const PRIVILEGED: readonly string[] = ['owner', 'admin'];
        if (wsMembership && PRIVILEGED.includes(wsMembership.role)) {
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

    async assertProjectRole(
        userId: string,
        projectId: string,
        allowedRoles: readonly ProjectRole[],
    ) {
        const { project, membership } = await this.assertProjectMember(userId, projectId);

        if (!allowedRoles.includes(membership.role as ProjectRole)) {
            throw new ForbiddenException('Insufficient role');
        }

        return { project, membership };
    }

    async assertOrganizationMember(userId: string, organizationId: string) {
        const membership = await this.prisma.client.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId, userId } },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied to organization');
        }

        return membership;
    }

    async assertOrganizationRole(
        userId: string,
        organizationId: string,
        allowedRoles: readonly OrgRole[],
    ) {
        const membership = await this.assertOrganizationMember(userId, organizationId);

        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenException('Insufficient role');
        }

        return membership;
    }
}