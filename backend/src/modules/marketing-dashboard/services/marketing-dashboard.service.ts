//backend/src/modules/marketing-dashboard/services/marketing-dashboard.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES } from '../../../common/types/roles.type.js';
import {
    CreateDashboardDto,
    UpdateDashboardDto,
} from '../contracts/create-dashboard.dto.js';

interface DashboardRecord {
    id: string;
    projectId: string;
    period: string;
    adBudget: number;
    marketingCosts: number;
    revenue: number;
    grossProfit: number;
    impressions: number;
    clicks: number;
    leads: number;
    mql: number;
    sql: number;
    meetings: number;
    offers: number;
    deals: number;
    avgCheck: number;
    avgGrossMargin: number;
    avgLifetimeMonths: number;
    avgPurchaseFreq: number;
    avgRevenuePerClient: number;
    activeClients: number;
    repeatClients: number;
    retention: number;
    avgProductPrice: number;
    operationalCosts: number;
    organicVisits: number;
    totalVisits: number;
    bounces: number;
    newClients: number;
    tam: number;
    sam: number;
    som: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface MarketingMetrics {
    funnel: {
        ctr: number;
        crClickLead: number;
        crLeadMql: number;
        crMqlSql: number;
        crSqlMeeting: number;
        crMeetingOffer: number;
        crOfferDeal: number;
        crTotal: number;
    };
    costs: {
        cpc: number;
        cpm: number;
        cpl: number;
        cpql: number;
        cpsql: number;
        cac: number;
        cpo: number;
    };
    roi: {
        romi: number;
        roi: number;
        roas: number;
        roasFull: number;
        marketingShare: number;
    };
    ltv: {
        ltv: number;
        ltvCac: number;
        payback: number;
    };
    efficiency: {
        aov: number;
        retention: number;
        churn: number;
        bounceRate: number;
        organicShare: number;
        marketShare: number;
        samShare: number;
    };
    unit: {
        marginPerClient: number;
        profitPerClient: number;
        breakEven: number;
        revenuePerClient: number;
        profit: number;
    };
}

@Injectable()
export class MarketingDashboardService {
    constructor(
        private prisma: PrismaService,
        private membership: MembershipService,
    ) { }

    async create(userId: string, projectId: string, data: CreateDashboardDto) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);

        return this.prisma.client.marketingDashboard.create({
            data: { projectId, ...data },
        });
    }

    async update(userId: string, id: string, data: UpdateDashboardDto) {
        // 1. Достаём projectId без выброса NotFoundException
        const existing = await this.prisma.client.marketingDashboard.findUnique({
            where: { id },
            select: { projectId: true },
        });

        // 2. Не раскрываем существование — отдаём 403
        if (!existing) {
            throw new ForbiddenException('Access denied to dashboard');
        }

        // 3. Проверка прав
        await this.membership.assertProjectRole(
            userId,
            existing.projectId,
            EDIT_ROLES,
        );

        // 4. Обновление
        return this.prisma.client.marketingDashboard.update({
            where: { id },
            data,
        });
    }

    async getByProject(userId: string, projectId: string) {
        await this.membership.assertProjectMember(userId, projectId);

        const dashboard = await this.prisma.client.marketingDashboard.findFirst({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });

        if (!dashboard) return null;

        return {
            ...dashboard,
            metrics: this.calculateMetrics(dashboard),
        };
    }

    private calculateMetrics(d: DashboardRecord): MarketingMetrics {
        const safe = (a: number, b: number) => (b === 0 ? 0 : a / b);

        const ctr = safe(d.clicks, d.impressions) * 100;
        const crClickLead = safe(d.leads, d.clicks) * 100;
        const crLeadMql = safe(d.mql, d.leads) * 100;
        const crMqlSql = safe(d.sql, d.mql) * 100;
        const crSqlMeeting = safe(d.meetings, d.sql) * 100;
        const crMeetingOffer = safe(d.offers, d.meetings) * 100;
        const crOfferDeal = safe(d.deals, d.offers) * 100;
        const crTotal = safe(d.deals, d.clicks) * 100;

        const cpc = safe(d.adBudget, d.clicks);
        const cpm = safe(d.adBudget, d.impressions) * 1000;
        const cpl = safe(d.marketingCosts, d.leads);
        const cpql = safe(d.marketingCosts, d.mql);
        const cpsql = safe(d.marketingCosts, d.sql);
        const cac = safe(d.marketingCosts, d.deals);
        const cpo = safe(d.marketingCosts, d.offers);

        const romi =
            d.marketingCosts === 0
                ? 0
                : ((d.revenue - d.marketingCosts) / d.marketingCosts) * 100;
        const roi =
            d.marketingCosts === 0
                ? 0
                : ((d.grossProfit - d.marketingCosts) / d.marketingCosts) * 100;
        const roas = safe(d.revenue, d.adBudget);
        const roasFull = safe(d.revenue, d.marketingCosts);
        const marketingShare = safe(d.marketingCosts, d.revenue) * 100;

        const ltv =
            d.avgCheck * d.avgPurchaseFreq * d.avgLifetimeMonths * d.avgGrossMargin;
        const ltvCac = safe(ltv, cac);
        const payback = safe(cac, d.avgCheck * d.avgGrossMargin);

        const aov = safe(d.revenue, d.deals);
        const retention = safe(d.repeatClients, d.activeClients) * 100;
        const churn = 100 - retention;
        const bounceRate = safe(d.bounces, d.totalVisits) * 100;
        const organicShare = safe(d.organicVisits, d.totalVisits) * 100;
        const marketShare = safe(d.som, d.tam) * 100;
        const samShare = safe(d.som, d.sam) * 100;

        const marginPerClient = d.avgCheck * d.avgGrossMargin;
        const profitPerClient = marginPerClient - cac;
        const breakEven = safe(cac, marginPerClient);
        const revenuePerClient = d.avgRevenuePerClient;
        const profit = d.revenue - d.marketingCosts;

        return {
            funnel: {
                ctr,
                crClickLead,
                crLeadMql,
                crMqlSql,
                crSqlMeeting,
                crMeetingOffer,
                crOfferDeal,
                crTotal,
            },
            costs: { cpc, cpm, cpl, cpql, cpsql, cac, cpo },
            roi: { romi, roi, roas, roasFull, marketingShare },
            ltv: { ltv, ltvCac, payback },
            efficiency: {
                aov,
                retention,
                churn,
                bounceRate,
                organicShare,
                marketShare,
                samShare,
            },
            unit: {
                marginPerClient,
                profitPerClient,
                breakEven,
                revenuePerClient,
                profit,
            },
        };
    }
}