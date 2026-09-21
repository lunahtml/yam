var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/tags/services/tags.service.ts
import { Injectable, ForbiddenException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
let TagsService = class TagsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        await this.membership.assertOrganizationMember(userId, data.organizationId);
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
    async findByOrganization(userId, organizationId) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        return this.prisma.client.tag.findMany({
            where: { organizationId },
            orderBy: { label: 'asc' },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                skill: { select: { id: true, name: true, label: true, type: true } },
            },
        });
    }
    async search(userId, organizationId, query) {
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
    async findById(userId, id) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
        });
        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }
        await this.membership.assertOrganizationMember(userId, tag.organizationId);
        return tag;
    }
    async update(userId, id, data) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }
        await this.membership.assertOrganizationMember(userId, tag.organizationId);
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
    async remove(userId, id) {
        const tag = await this.prisma.client.tag.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!tag) {
            throw new ForbiddenException('Access denied to tag');
        }
        await this.membership.assertOrganizationMember(userId, tag.organizationId);
        return this.prisma.client.tag.delete({
            where: { id },
        });
    }
};
TagsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], TagsService);
export { TagsService };
//# sourceMappingURL=tags.service.js.map