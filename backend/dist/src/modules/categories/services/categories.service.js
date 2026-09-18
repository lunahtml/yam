var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/categories/services/categories.service.ts
import { Injectable, ForbiddenException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
let CategoriesService = class CategoriesService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        await this.membership.assertOrganizationMember(userId, data.organizationId);
        const exists = await this.prisma.client.category.findUnique({
            where: {
                organizationId_scope_slug: {
                    organizationId: data.organizationId,
                    scope: data.scope,
                    slug: data.slug,
                },
            },
        });
        if (exists) {
            throw new ConflictException('Category with this slug already exists');
        }
        return this.prisma.client.category.create({
            data: {
                organizationId: data.organizationId,
                parentId: data.parentId,
                name: data.name,
                slug: data.slug,
                description: data.description,
                icon: data.icon,
                color: data.color,
                scope: data.scope,
            },
        });
    }
    async findByOrganization(userId, organizationId, scope) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        return this.prisma.client.category.findMany({
            where: {
                organizationId,
                ...(scope ? { scope: scope } : {}),
            },
            orderBy: [{ scope: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { children: true, tags: true, skills: true },
                },
            },
        });
    }
    async findById(userId, id) {
        const category = await this.prisma.client.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
            },
        });
        if (!category) {
            throw new ForbiddenException('Access denied');
        }
        await this.membership.assertOrganizationMember(userId, category.organizationId);
        return category;
    }
    async update(userId, id, data) {
        const category = await this.prisma.client.category.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!category) {
            throw new ForbiddenException('Access denied');
        }
        await this.membership.assertOrganizationMember(userId, category.organizationId);
        return this.prisma.client.category.update({
            where: { id },
            data: {
                parentId: data.parentId,
                name: data.name,
                slug: data.slug,
                description: data.description,
                icon: data.icon,
                color: data.color,
            },
        });
    }
    async remove(userId, id) {
        const category = await this.prisma.client.category.findUnique({
            where: { id },
            select: {
                organizationId: true,
                _count: { select: { children: true, tags: true, skills: true } },
            },
        });
        if (!category) {
            throw new ForbiddenException('Access denied');
        }
        await this.membership.assertOrganizationMember(userId, category.organizationId);
        if (category._count.children > 0 ||
            category._count.tags > 0 ||
            category._count.skills > 0) {
            throw new ConflictException('Cannot delete category with children, tags or skills');
        }
        return this.prisma.client.category.delete({
            where: { id },
        });
    }
};
CategoriesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], CategoriesService);
export { CategoriesService };
//# sourceMappingURL=categories.service.js.map