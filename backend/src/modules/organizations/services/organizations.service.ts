//backend/src/modules/organizations/services/organizations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    ORG_PRIVILEGED_ROLES,
} from '../../../common/types/roles.type.js';
import {
    CreateOrganizationDto,
} from '../contracts/create-organization.dto.js';
import {
    UpdateOrganizationDto,
} from '../contracts/update-organization.dto.js';
@Injectable()
export class OrganizationsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateOrganizationDto) {
        const organization = await this.prisma.client.organization.create({
            data: {
                name: data.name,
            },
        });

        // Создатель становится OWNER
        await this.prisma.client.organizationMember.create({
            data: {
                organizationId: organization.id,
                userId,
                role: 'OWNER',
            },
        });

        return organization;
    }

    async findById(userId: string, id: string) {
        await this.membership.assertOrganizationMember(userId, id);

        const organization = await this.prisma.client.organization.findUnique({
            where: { id },
            include: {
                _count: { select: { workspaces: true, members: true } },
            },
        });

        if (!organization) throw new NotFoundException('Organization not found');
        return organization;
    }

    async update(userId: string, id: string, data: UpdateOrganizationDto) {
        await this.membership.assertOrganizationRole(
            userId,
            id,
            ORG_PRIVILEGED_ROLES,
        );

        return this.prisma.client.organization.update({
            where: { id },
            data,
        });
    }

    async remove(userId: string, id: string) {
        await this.membership.assertOrganizationRole(
            userId,
            id,
            ORG_PRIVILEGED_ROLES,
        );

        return this.prisma.client.organization.delete({
            where: { id },
        });
    }

    async listMyOrganizations(userId: string) {
        const memberships = await this.prisma.client.organizationMember.findMany({
            where: { userId },
            include: {
                organization: {
                    include: {
                        _count: { select: { workspaces: true, members: true } },
                    },
                },
            },
        });

        return memberships.map((m) => ({
            ...m.organization,
            role: m.role,
        }));
    }
}