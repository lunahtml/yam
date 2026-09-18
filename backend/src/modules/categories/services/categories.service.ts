//backend/src/modules/categories/services/categories.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { CreateCategoryDto, UpdateCategoryDto } from '../contracts/create-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateCategoryDto) {
        await this.membership.assertOrganizationMember(
            userId,
            data.organizationId,
        );

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

    async findByOrganization(
        userId: string,
        organizationId: string,
        scope?: string,
    ) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.category.findMany({
            where: {
                organizationId,
                ...(scope ? { scope: scope as any } : {}),
            },
            orderBy: [{ scope: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { children: true, tags: true, skills: true },
                },
            },
        });
    }

    async findById(userId: string, id: string) {
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

        await this.membership.assertOrganizationMember(
            userId,
            category.organizationId,
        );

        return category;
    }

    async update(userId: string, id: string, data: UpdateCategoryDto) {
        const category = await this.prisma.client.category.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!category) {
            throw new ForbiddenException('Access denied');
        }

        await this.membership.assertOrganizationMember(
            userId,
            category.organizationId,
        );

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

    async remove(userId: string, id: string) {
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

        await this.membership.assertOrganizationMember(
            userId,
            category.organizationId,
        );

        if (
            category._count.children > 0 ||
            category._count.tags > 0 ||
            category._count.skills > 0
        ) {
            throw new ConflictException(
                'Cannot delete category with children, tags or skills',
            );
        }

        return this.prisma.client.category.delete({
            where: { id },
        });
    }
}