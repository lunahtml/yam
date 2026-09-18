var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/skills/services/skills.service.ts
import { Injectable, ForbiddenException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
let SkillsService = class SkillsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, data) {
        await this.membership.assertOrganizationMember(userId, data.organizationId);
        const exists = await this.prisma.client.skill.findUnique({
            where: {
                organizationId_name: {
                    organizationId: data.organizationId,
                    name: data.name,
                },
            },
        });
        if (exists) {
            throw new ConflictException('Skill with this name already exists');
        }
        return this.prisma.client.skill.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                label: data.label,
                description: data.description,
                type: data.type,
                categoryId: data.categoryId,
            },
        });
    }
    async findByOrganization(userId, organizationId) {
        await this.membership.assertOrganizationMember(userId, organizationId);
        return this.prisma.client.skill.findMany({
            where: { organizationId },
            orderBy: [{ type: 'asc' }, { label: 'asc' }],
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async findById(userId, id) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
        });
        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }
        await this.membership.assertOrganizationMember(userId, skill.organizationId);
        return skill;
    }
    async update(userId, id, data) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }
        await this.membership.assertOrganizationMember(userId, skill.organizationId);
        return this.prisma.client.skill.update({
            where: { id },
            data: {
                label: data.label,
                description: data.description,
                type: data.type,
                categoryId: data.categoryId,
            },
        });
    }
    async remove(userId, id) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
            select: { organizationId: true },
        });
        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }
        await this.membership.assertOrganizationMember(userId, skill.organizationId);
        return this.prisma.client.skill.delete({
            where: { id },
        });
    }
};
SkillsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], SkillsService);
export { SkillsService };
//# sourceMappingURL=skills.service.js.map