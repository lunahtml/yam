//backend/src/modules/artifacts/services/artifacts.service.ts
import {
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { CreateArtifactDto } from '../contracts/create-artifact.dto.js';
import { UpdateArtifactDto } from '../contracts/update-artifact.dto.js';
import { ArtifactType } from '../../../generated/prisma/enums.js';

@Injectable()
export class ArtifactsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(
        userId: string,
        projectId: string,
        data: CreateArtifactDto,
    ) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        return this.prisma.client.artifact.create({
            data: {
                projectId,
                type: data.type,
                name: data.name,
                url: data.url || null,
                description: data.description,
                metadata: data.metadata as Prisma.InputJsonValue | undefined,
                isActive: data.isActive,
            },
        });
    }

    async findByProject(
        userId: string,
        projectId: string,
        type?: ArtifactType,
    ) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.artifact.findMany({
            where: {
                projectId,
                ...(type ? { type } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(userId: string, id: string) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { id: true, projectId: true },
        });

        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }

        await this.membership.assertProjectMember(userId, artifact.projectId);

        return this.prisma.client.artifact.findUnique({
            where: { id },
        });
    }

    async update(userId: string, id: string, data: UpdateArtifactDto) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }

        await this.membership.assertProjectRole(
            userId,
            artifact.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.artifact.update({
            where: { id },
            data: {
                type: data.type,
                name: data.name,
                url: data.url || null,
                description: data.description,
                metadata: data.metadata as Prisma.InputJsonValue | undefined,
                isActive: data.isActive,
            },
        });
    }

    async remove(userId: string, id: string) {
        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!artifact) {
            throw new ForbiddenException('Access denied to artifact');
        }

        await this.membership.assertProjectRole(
            userId,
            artifact.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.artifact.delete({
            where: { id },
        });
    }
}