//backend/src/modules/workspaces/services/workspaces.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    DESTRUCTIVE_ROLES,
    EDIT_ROLES,
    ORG_PRIVILEGED_ROLES,
} from '../../../common/types/roles.type.js';
import {
    CreateWorkspaceDto,
    UpdateWorkspaceDto,
} from '../contracts/create-workspace.dto.js';

@Injectable()
export class WorkspacesService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateWorkspaceDto) {
        await this.membership.assertOrganizationRole(
            userId,
            data.organizationId,
            ORG_PRIVILEGED_ROLES,
        );

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

    async findById(userId: string, id: string) {
        await this.membership.assertWorkspaceMember(userId, id);

        const workspace = await this.prisma.client.workspace.findUnique({
            where: { id },
            include: {
                organization: { select: { id: true, name: true } },
                _count: { select: { projects: true, members: true } },
            },
        });

        if (!workspace) throw new NotFoundException('Workspace not found');
        return workspace;
    }

    async update(userId: string, id: string, data: UpdateWorkspaceDto) {
        await this.membership.assertWorkspaceRole(userId, id, EDIT_ROLES);

        return this.prisma.client.workspace.update({
            where: { id },
            data,
        });
    }

    async remove(userId: string, id: string) {
        await this.membership.assertWorkspaceRole(userId, id, DESTRUCTIVE_ROLES);

        return this.prisma.client.workspace.delete({
            where: { id },
        });
    }

    async listByOrganization(userId: string, organizationId: string) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.workspace.findMany({
            where: { organizationId },
            include: {
                _count: { select: { projects: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async listMyWorkspaces(userId: string) {
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
}