//backend/src/common/services/membership.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ProjectRole, PRIVILEGED_ROLES } from '../types/roles.type.js';

@Injectable()
export class MembershipService {
    constructor(private prisma: PrismaService) { }

    async assertWorkspaceMember(userId: string, workspaceId: string) {
        const membership = await this.prisma.client.workspaceMember.findUnique({
            where: {
                workspaceId_userId: { workspaceId, userId },
            },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied to workspace');
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

        // 1. WorkspaceMember
        const wsMembership = await this.prisma.client.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId,
                },
            },
        });

        // 2. Если owner/admin воркспейса — их роль приоритетна
        if (
            wsMembership &&
            PRIVILEGED_ROLES.includes(wsMembership.role as ProjectRole)
        ) {
            return { project, membership: wsMembership };
        }

        // 3. ProjectMember — override для остальных
        const projMembership = await this.prisma.client.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId },
            },
        });

        if (projMembership) {
            return { project, membership: projMembership };
        }

        // 4. Fallback на WorkspaceMember
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
        const { project, membership } = await this.assertProjectMember(
            userId,
            projectId,
        );

        const role = membership.role as ProjectRole;

        if (!allowedRoles.includes(role)) {
            throw new ForbiddenException('Insufficient role');
        }

        return { project, membership };
    }

    async assertOrganizationMember(userId: string, organizationId: string) {
        const membership = await this.prisma.client.organizationMember.findUnique({
            where: {
                organizationId_userId: { organizationId, userId },
            },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied to organization');
        }

        return membership;
    }
}