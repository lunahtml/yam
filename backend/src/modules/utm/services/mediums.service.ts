//backend/src/modules/utm/services/mediums.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateMediumDto,
    UpdateMediumDto,
} from '../contracts/medium.dto.js';

@Injectable()
export class MediumsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateMediumDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const exists = await this.prisma.client.utmMedium.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });

        if (exists) {
            throw new ConflictException('Medium with this name already exists');
        }

        return this.prisma.client.utmMedium.create({
            data: {
                projectId,
                name: data.name,
                label: data.label,
                isSystem: false,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.utmMedium.findMany({
            where: { projectId },
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });
    }

    async update(userId: string, id: string, data: UpdateMediumDto) {
        const medium = await this.prisma.client.utmMedium.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!medium) {
            throw new ForbiddenException('Access denied to medium');
        }

        await this.membership.assertProjectRole(
            userId,
            medium.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.utmMedium.update({
            where: { id },
            data: {
                label: data.label,
            },
        });
    }

    async remove(userId: string, id: string) {
        const medium = await this.prisma.client.utmMedium.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!medium) {
            throw new ForbiddenException('Access denied to medium');
        }

        await this.membership.assertProjectRole(
            userId,
            medium.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.utmMedium.delete({
            where: { id },
        });
    }
}