//backend/src/modules/utm/services/rules.service.ts
import {
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateRuleDto,
    UpdateRuleDto,
} from '../contracts/rule.dto.js';

@Injectable()
export class RulesService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateRuleDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        return this.prisma.client.utmRule.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
                priority: data.priority,
                isActive: data.isActive,
                conditions: data.conditions as Prisma.InputJsonValue,
                sourceTemplate: data.sourceTemplate,
                mediumTemplate: data.mediumTemplate,
                campaignTemplate: data.campaignTemplate,
                contentTemplate: data.contentTemplate,
                termTemplate: data.termTemplate,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.utmRule.findMany({
            where: { projectId },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async update(userId: string, id: string, data: UpdateRuleDto) {
        const rule = await this.prisma.client.utmRule.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!rule) {
            throw new ForbiddenException('Access denied to rule');
        }

        await this.membership.assertProjectRole(
            userId,
            rule.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.utmRule.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                priority: data.priority,
                isActive: data.isActive,
                conditions: data.conditions
                    ? (data.conditions as Prisma.InputJsonValue)
                    : undefined,
                sourceTemplate: data.sourceTemplate,
                mediumTemplate: data.mediumTemplate,
                campaignTemplate: data.campaignTemplate,
                contentTemplate: data.contentTemplate,
                termTemplate: data.termTemplate,
            },
        });
    }

    async remove(userId: string, id: string) {
        const rule = await this.prisma.client.utmRule.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!rule) {
            throw new ForbiddenException('Access denied to rule');
        }

        await this.membership.assertProjectRole(
            userId,
            rule.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.utmRule.delete({
            where: { id },
        });
    }
}