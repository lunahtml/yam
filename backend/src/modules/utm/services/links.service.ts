//backend/src/modules/utm/services/links.service.ts
import {
    Injectable,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
import { UrlBuilderService, UtmParams } from './url-builder.service.js';
import {
    CreateLinkDto,
    UpdateLinkDto,
    GenerateLinksDto,
} from '../contracts/link.dto.js';

interface RuleCondition {
    field: string;
    operator: 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith' | 'in';
    value: string | string[];
}

@Injectable()
export class LinksService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
        private urlBuilder: UrlBuilderService,
    ) { }

    /**
     * Создать одну UTM-ссылку вручную.
     */
    async create(userId: string, projectId: string, data: CreateLinkDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const params: UtmParams = {
            source: data.source,
            medium: data.medium,
            campaign: data.campaign,
            content: data.content,
            term: data.term,
        };

        const fullUrl = this.urlBuilder.build(data.baseUrl, params);

        return this.prisma.client.utmLink.create({
            data: {
                projectId,
                artifactId: data.artifactId,
                campaignId: data.campaignId,
                source: data.source,
                medium: data.medium,
                campaign: data.campaign,
                content: data.content,
                term: data.term,
                baseUrl: data.baseUrl,
                fullUrl,
                label: data.label,
                notes: data.notes,
                createdById: userId,
            },
        });
    }

    /**
     * Массовая генерация ссылок по правилам.
     * Возвращает массив сгенерированных ссылок.
     */
    async generate(userId: string, projectId: string, data: GenerateLinksDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        const artifact = await this.prisma.client.artifact.findUnique({
            where: { id: data.artifactId },
            select: { id: true, name: true, type: true, url: true },
        });

        if (!artifact) {
            throw new BadRequestException('Artifact not found');
        }

        const campaign = data.campaignId
            ? await this.prisma.client.utmCampaign.findUnique({
                where: { id: data.campaignId },
                select: { id: true, name: true },
            })
            : null;

        // Найти подходящее правило
        const rules = await this.prisma.client.utmRule.findMany({
            where: { projectId, isActive: true },
            orderBy: { priority: 'desc' },
        });

        const matchedRule = rules.find((rule) =>
            this.matchesConditions(
                rule.conditions as unknown as RuleCondition[],
                {
                    'artifact.type': artifact.type,
                    'artifact.name': artifact.name,
                    'artifact.url': artifact.url ?? '',
                },
            ),
        );

        // Если правило не найдено — используем дефолтное
        const rule = matchedRule ?? {
            sourceTemplate: '{{source}}',
            mediumTemplate: '{{medium}}',
            campaignTemplate: '{{campaign}}',
            contentTemplate: null,
            termTemplate: null,
        };

        const links = [];

        for (let i = 0; i < data.count; i++) {
            const index = i + 1;

            const source = this.urlBuilder.renderTemplate(
                rule.sourceTemplate,
                this.buildVars(artifact, campaign, index, data.contentPrefix),
            );

            const medium = this.urlBuilder.renderTemplate(
                rule.mediumTemplate,
                this.buildVars(artifact, campaign, index, data.contentPrefix),
            );

            const campaignName = rule.campaignTemplate
                ? this.urlBuilder.renderTemplate(
                    rule.campaignTemplate,
                    this.buildVars(artifact, campaign, index, data.contentPrefix),
                )
                : campaign?.name;

            const content = rule.contentTemplate
                ? this.urlBuilder.renderTemplate(
                    rule.contentTemplate,
                    this.buildVars(artifact, campaign, index, data.contentPrefix),
                )
                : data.contentPrefix
                    ? `${data.contentPrefix}_${index}`
                    : undefined;

            const term = rule.termTemplate
                ? this.urlBuilder.renderTemplate(
                    rule.termTemplate,
                    this.buildVars(artifact, campaign, index, data.contentPrefix),
                )
                : undefined;

            const baseUrl = data.baseUrl || artifact.url;

            if (!baseUrl) {
                throw new BadRequestException('Base URL is required');
            }

            const fullUrl = this.urlBuilder.build(baseUrl, {
                source,
                medium,
                campaign: campaignName,
                content,
                term,
            });

            links.push({
                projectId,
                artifactId: artifact.id,
                campaignId: campaign?.id,
                source,
                medium,
                campaign: campaignName,
                content,
                term,
                baseUrl,
                fullUrl,
                label: `${artifact.name} #${index}`,
                createdById: userId,
            });
        }

        // Массовое создание
        await this.prisma.client.utmLink.createMany({ data: links });

        // Вернуть созданные
        return this.prisma.client.utmLink.findMany({
            where: {
                projectId,
                artifactId: artifact.id,
                createdAt: {
                    gte: new Date(Date.now() - 5000),
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByProject(
        userId: string,
        projectId: string,
        filters?: { campaignId?: string; artifactId?: string },
    ) {
        await this.membership.assertProjectMember(userId, projectId);

        return this.prisma.client.utmLink.findMany({
            where: {
                projectId,
                ...(filters?.campaignId ? { campaignId: filters.campaignId } : {}),
                ...(filters?.artifactId ? { artifactId: filters.artifactId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                artifact: { select: { id: true, name: true, type: true } },
                campaignRef: { select: { id: true, name: true, label: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });
    }

    async update(userId: string, id: string, data: UpdateLinkDto) {
        const link = await this.prisma.client.utmLink.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!link) {
            throw new ForbiddenException('Access denied to link');
        }

        await this.membership.assertProjectRole(
            userId,
            link.projectId,
            EDIT_ROLES,
        );

        return this.prisma.client.utmLink.update({
            where: { id },
            data: {
                label: data.label,
                notes: data.notes,
            },
        });
    }

    async remove(userId: string, id: string) {
        const link = await this.prisma.client.utmLink.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!link) {
            throw new ForbiddenException('Access denied to link');
        }

        await this.membership.assertProjectRole(
            userId,
            link.projectId,
            DESTRUCTIVE_ROLES,
        );

        return this.prisma.client.utmLink.delete({
            where: { id },
        });
    }

    /**
     * Проверка условий правила.
     */
    private matchesConditions(
        conditions: RuleCondition[],
        values: Record<string, string>,
    ): boolean {
        if (!conditions || conditions.length === 0) return true;

        return conditions.every((cond) => {
            const actualValue = values[cond.field];
            if (actualValue === undefined) return false;

            switch (cond.operator) {
                case 'eq':
                    return actualValue === cond.value;
                case 'ne':
                    return actualValue !== cond.value;
                case 'contains':
                    return actualValue.includes(String(cond.value));
                case 'startsWith':
                    return actualValue.startsWith(String(cond.value));
                case 'endsWith':
                    return actualValue.endsWith(String(cond.value));
                case 'in':
                    return Array.isArray(cond.value)
                        ? cond.value.includes(actualValue)
                        : false;
                default:
                    return false;
            }
        });
    }

    private buildVars(
        artifact: { name: string; type: string; url: string | null },
        campaign: { name: string } | null,
        index: number,
        contentPrefix?: string,
    ): Record<string, string | number | undefined> {
        return {
            source: undefined,
            medium: undefined,
            campaign: campaign?.name,
            index,
            date: new Date().toISOString().slice(0, 10),
            'artifact.name': artifact.name,
            'artifact.type': artifact.type,
            'artifact.url': artifact.url ?? '',
            contentPrefix,
        };
    }
}