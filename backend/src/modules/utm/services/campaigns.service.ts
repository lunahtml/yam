//backend/src/modules/utm/services/campaigns.service.ts
import {
    Injectable,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateCampaignDto,
    UpdateCampaignDto,
} from '../contracts/campaign.dto.js';

@Injectable()
export class CampaignsService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateCampaignDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const exists = await this.prisma.client.utmCampaign.findUnique({
            where: { projectId_name: { projectId, name: data.name } },
        });

        if (exists) {
            throw new ConflictException('Campaign with this name already exists');
        }

        return this.prisma.client.utmCampaign.create({
            data: {
                projectId,
                name: data.name,
                label: data.label,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
    }

    async findByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.utmCampaign.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { utmLinks: true } },
            },
        });
    }

    async update(userId: string, id: string, data: UpdateCampaignDto) {
        const campaign = await this.prisma.client.utmCampaign.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!campaign) {
            throw new ForbiddenException('Access denied to campaign');
        }

        await this.membership.assertProjectRole(
            userId,
            campaign.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.utmCampaign.update({
            where: { id },
            data: {
                label: data.label,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async remove(userId: string, id: string) {
        const campaign = await this.prisma.client.utmCampaign.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!campaign) {
            throw new ForbiddenException('Access denied to campaign');
        }

        await this.membership.assertProjectRole(
            userId,
            campaign.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.utmCampaign.delete({
            where: { id },
        });
    }
}