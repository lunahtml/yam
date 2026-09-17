var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/utm/services/rules.service.ts
import { Injectable, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
let RulesService = class RulesService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        return this.prisma.client.utmRule.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
                priority: data.priority,
                isActive: data.isActive,
                conditions: data.conditions,
                sourceTemplate: data.sourceTemplate,
                mediumTemplate: data.mediumTemplate,
                campaignTemplate: data.campaignTemplate,
                contentTemplate: data.contentTemplate,
                termTemplate: data.termTemplate,
            },
        });
    }
    async findByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        return this.prisma.client.utmRule.findMany({
            where: { projectId },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async update(userId, id, data) {
        const rule = await this.prisma.client.utmRule.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!rule) {
            throw new ForbiddenException('Access denied to rule');
        }
        await this.membership.assertProjectRole(userId, rule.projectId, EDIT_ROLES);
        return this.prisma.client.utmRule.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                priority: data.priority,
                isActive: data.isActive,
                conditions: data.conditions
                    ? data.conditions
                    : undefined,
                sourceTemplate: data.sourceTemplate,
                mediumTemplate: data.mediumTemplate,
                campaignTemplate: data.campaignTemplate,
                contentTemplate: data.contentTemplate,
                termTemplate: data.termTemplate,
            },
        });
    }
    async remove(userId, id) {
        const rule = await this.prisma.client.utmRule.findUnique({
            where: { id },
            select: { projectId: true },
        });
        if (!rule) {
            throw new ForbiddenException('Access denied to rule');
        }
        await this.membership.assertProjectRole(userId, rule.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.utmRule.delete({
            where: { id },
        });
    }
};
RulesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], RulesService);
export { RulesService };
//# sourceMappingURL=rules.service.js.map