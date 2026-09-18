//backend/src/modules/tags/services/tags.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    CreateTagDto,
    UpdateTagDto,
} from '../contracts/create-tag.dto.js';

@Injectable()
export class TagsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateTagDto) {
        await this.membership.assertOrganizationMember(
            userId,
            data.organizationId,
        );

        const exists = await this.prisma.client.tag.findUnique({
            where: {
                organizationId_name: {
                    organizationId: data.organizationId,
                    name: data.name,
                },
            },
        });

        if (exists) {
            throw new ConflictException('Tag with this name already exists');
        }

        return this.prisma.client.tag.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                label: data.label,
                description: data.description,
                icon: data.icon,
                color: data.color,
                categoryId: data.categoryId,
                skillId: data.skillId,
                createdById: userId,
            },
        });
    }

    async findByOrganization(userId: string, organizationId: string) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.tag.findMany({
            where: { organizationId },
            orderBy: { label: 'asc' },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                skill: { select: { id: true, name: true, type: true } },
            },
        });
    }

    async search(userId: string, organizationId: string, query: string) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.tag.findMany({
            where: {
                organizationId,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { label: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 20,
            orderBy: { label: 'asc' },
        });
    }

    async findById(userId: string, id: string) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }

        await this.membership.assertOrganizationMember(
            userId,
            tag.organizationId,
        );

        return tag;
    }

    async update(userId: string, id: string, data: UpdateTagDto) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }

        await this.membership.assertOrganizationMember(
            userId,
            tag.organizationId,
        );

        return this.prisma.client.tag.update({
            where: { id },
            data: {
                label: data.label,
                description: data.description,
                icon: data.icon,
                color: data.color,
                categoryId: data.categoryId,
                skillId: data.skillId,
            },
        });
    }

    async remove(userId: string, id: string) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }

        await this.membership.assertOrganizationMember(
            userId,
            tag.organizationId,
        );

        return this.prisma.client.tag.delete({
            where: { id },
        });
    }
}