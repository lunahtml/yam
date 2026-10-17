//backend/src/common/services/membership.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
// import { ProjectRole } from '../types/roles.type.js';
import { ProjectRole, PRIVILEGED_ROLES, EDIT_ROLES } from '../types/roles.type.js';
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

        // const PRIVILEGED: readonly string[] = ['owner', 'admin'];
        // if (wsMembership && PRIVILEGED.includes(wsMembership.role)) {
        //     return { project, membership: wsMembership };
        // }
        if (wsMembership && PRIVILEGED_ROLES.includes(wsMembership.role as ProjectRole)) {
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

    /**
 * Проверяет доступ к записи.
 * Возвращает { record, project, canEdit }.
 *
 * canEdit = true — только если юзер член ПРОЕКТА с ролью редактирования.
 * canEdit = false — если юзер только член ОРГАНИЗАЦИИ (read-only).
 *
 * Бросает ForbiddenException, если нет ни того, ни другого.
 */
    async assertRecordAccess(userId: string, recordId: string) {
        const record = await this.prisma.client.record.findUnique({
            where: { id: recordId },
            select: {
                id: true,
                projectId: true,
                entityId: true,
                sprintId: true,
                createdById: true,
                project: {
                    select: {
                        id: true,
                        workspaceId: true,
                        workspace: { select: { organizationId: true } },
                    },
                },
            },
        });

        if (!record) {
            throw new ForbiddenException('Access denied to record');
        }

        const { projectId } = record;
        const workspaceId = record.project.workspaceId;
        const organizationId = record.project.workspace.organizationId;

        // 1) Является ли членом проекта?
        const projMembership = await this.prisma.client.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        // 2) Или имеет привилегированную роль в workspace?
        const wsMembership = await this.prisma.client.workspaceMember.findUnique({
            where: {
                workspaceId_userId: { workspaceId, userId },
            },
        });

        const hasEditRole =
            (projMembership &&
                EDIT_ROLES.includes(projMembership.role as ProjectRole)) ||
            (wsMembership &&
                PRIVILEGED_ROLES.includes(wsMembership.role as ProjectRole));

        // 3) Или член организации (read-only)?
        const orgMembership = await this.prisma.client.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId, userId } },
        });

        if (!hasEditRole && !orgMembership) {
            throw new ForbiddenException('Access denied to record');
        }

        return {
            record,
            canEdit: hasEditRole,
        };
    }


}