//backend/src/modules/skills/services/skills.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import {
    CreateSkillDto,
    UpdateSkillDto,
} from '../contracts/create-skill.dto.js';

@Injectable()
export class SkillsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, data: CreateSkillDto) {
        await this.membership.assertOrganizationMember(
            userId,
            data.organizationId,
        );

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

    async findByOrganization(userId: string, organizationId: string) {
        await this.membership.assertOrganizationMember(userId, organizationId);

        return this.prisma.client.skill.findMany({
            where: { organizationId },
            orderBy: [{ type: 'asc' }, { label: 'asc' }],
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async findById(userId: string, id: string) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
        });

        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }

        await this.membership.assertOrganizationMember(
            userId,
            skill.organizationId,
        );

        return skill;
    }

    async update(userId: string, id: string, data: UpdateSkillDto) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }

        await this.membership.assertOrganizationMember(
            userId,
            skill.organizationId,
        );

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

    async remove(userId: string, id: string) {
        const skill = await this.prisma.client.skill.findUnique({
            where: { id },
            select: { organizationId: true },
        });

        if (!skill) {
            throw new ForbiddenException('Access denied to skill');
        }

        await this.membership.assertOrganizationMember(
            userId,
            skill.organizationId,
        );

        return this.prisma.client.skill.delete({
            where: { id },
        });
    }
}