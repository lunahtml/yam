//backend/src/modules/utm/services/sources.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateSourceDto,
    UpdateSourceDto,
} from '../contracts/source.dto.js';

@Injectable()
export class SourcesService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateSourceDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const exists = await this.prisma.client.utmSource.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });

        if (exists) {
            throw new ConflictException('Source with this name already exists');
        }

        return this.prisma.client.utmSource.create({
            data: {
                projectId,
                name: data.name,
                label: data.label,
                icon: data.icon,
                isSystem: false,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.utmSource.findMany({
            where: { projectId },
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });
    }

    async update(userId: string, id: string, data: UpdateSourceDto) {
        const source = await this.prisma.client.utmSource.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!source) {
            throw new ForbiddenException('Access denied to source');
        }

        await this.membership.assertProjectRole(
            userId,
            source.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.utmSource.update({
            where: { id },
            data: {
                label: data.label,
                icon: data.icon,
            },
        });
    }

    async remove(userId: string, id: string) {
        const source = await this.prisma.client.utmSource.findUnique({
            where: { id },
            select: { projectId: true, isSystem: true },
        });

        if (!source) {
            throw new ForbiddenException('Access denied to source');
        }

        await this.membership.assertProjectRole(
            userId,
            source.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.utmSource.delete({
            where: { id },
        });
    }
}