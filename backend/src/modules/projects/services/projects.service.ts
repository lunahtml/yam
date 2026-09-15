//backend\src\modules\projects\services\projects.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { DESTRUCTIVE_ROLES, EDIT_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateProjectDto,
    UpdateProjectDto,
} from '../contracts/create-project.dto.js';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateProjectDto) {
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

    async update(userId: string, id: string, data: UpdateProjectDto) {
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

    async findById(userId: string, id: string) {
        const { project } = await this.membership.assertProjectMember(userId, id);
        return project;
    }

    async findByWorkspace(userId: string, workspaceId: string) {
        await this.membership.assertWorkspaceMember(userId, workspaceId);

        return this.prisma.client.project.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async archive(userId: string, id: string) {
        await this.membership.assertProjectRole(userId, id, DESTRUCTIVE_ROLES);

        return this.prisma.client.project.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }

    async remove(userId: string, id: string) {
        await this.membership.assertProjectRole(userId, id, DESTRUCTIVE_ROLES);

        return this.prisma.client.project.delete({
            where: { id },
        });
    }
}