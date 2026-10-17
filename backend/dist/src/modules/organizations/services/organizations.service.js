var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/organizations/services/organizations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { ORG_PRIVILEGED_ROLES, } from '../../../common/types/roles.type.js';
let OrganizationsService = class OrganizationsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
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
    async findById(userId, id) {
        await this.membership.assertOrganizationMember(userId, id);
        const organization = await this.prisma.client.organization.findUnique({
            where: { id },
            include: {
                _count: { select: { workspaces: true, members: true } },
            },
        });
        if (!organization)
            throw new NotFoundException('Organization not found');
        return organization;
    }
    async update(userId, id, data) {
        await this.membership.assertOrganizationRole(userId, id, ORG_PRIVILEGED_ROLES);
        return this.prisma.client.organization.update({
            where: { id },
            data,
        });
    }
    async remove(userId, id) {
        await this.membership.assertOrganizationRole(userId, id, ORG_PRIVILEGED_ROLES);
        return this.prisma.client.organization.delete({
            where: { id },
        });
    }
    async listMyOrganizations(userId) {
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
    async getMembers(userId, organizationId, q, limit) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        const where = {
            organizationId,
            ...(q && q.trim().length > 0
                ? {
                    user: {
                        OR: [
                            { name: { contains: q.trim(), mode: 'insensitive' } },
                            { email: { contains: q.trim(), mode: 'insensitive' } },
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
};
OrganizationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], OrganizationsService);
export { OrganizationsService };
//# sourceMappingURL=organizations.service.js.map