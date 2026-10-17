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

    /**
     * Возвращает участников организации.
     * Используется для mention-пикера в комментариях.
     *
     * q — поиск по name / email (case-insensitive, contains).
     * limit — максимум 50.
     */
    async getMembers(
        userId: string,
        organizationId: string,
        q: string | undefined,
        limit: number,
    ) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        const where = {
            organizationId,
            ...(q && q.trim().length > 0
                ? {
                    user: {
                        OR: [
                            { name: { contains: q.trim(), mode: 'insensitive' as const } },
                            { email: { contains: q.trim(), mode: 'insensitive' as const } },
                        ],
                    },
                }
                : {}),
        };

        const members = await this.prisma.client.organizationMember.findMany({
            where,
            take: limit,
            orderBy: { user: { name: 'asc' } },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                        status: true,
                    },
                },
            },
        });

        return members
            .filter((m) => m.user.status === 'ACTIVE')
            .map((m) => ({
                id: m.user.id,
                email: m.user.email,
                name: m.user.name,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
            }));
    }



}