var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/marketing-dashboard/services/marketing-dashboard.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES } from '../../../common/types/roles.type.js';
let MarketingDashboardService = class MarketingDashboardService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, projectId, data) {
        await this.membership.assertProjectRole(userId, projectId, EDIT_ROLES);
        return this.prisma.client.marketingDashboard.create({
            data: { projectId, ...data },
        });
    }
    async update(userId, id, data) {
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
        await this.membership.assertProjectRole(userId, existing.projectId, EDIT_ROLES);
        // 4. Обновление
        return this.prisma.client.marketingDashboard.update({
            where: { id },
            data,
        });
    }
    async getByProject(userId, projectId) {
        await this.membership.assertProjectMember(userId, projectId);
        const dashboard = await this.prisma.client.marketingDashboard.findFirst({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
        if (!dashboard)
            return null;
        return {
            ...dashboard,
            metrics: this.calculateMetrics(dashboard),
        };
    }
    calculateMetrics(d) {
        const safe = (a, b) => (b === 0 ? 0 : a / b);
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
        const romi = d.marketingCosts === 0
            ? 0
            : ((d.revenue - d.marketingCosts) / d.marketingCosts) * 100;
        const roi = d.marketingCosts === 0
            ? 0
            : ((d.grossProfit - d.marketingCosts) / d.marketingCosts) * 100;
        const roas = safe(d.revenue, d.adBudget);
        const roasFull = safe(d.revenue, d.marketingCosts);
        const marketingShare = safe(d.marketingCosts, d.revenue) * 100;
        const ltv = d.avgCheck * d.avgPurchaseFreq * d.avgLifetimeMonths * d.avgGrossMargin;
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
};
MarketingDashboardService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], MarketingDashboardService);
export { MarketingDashboardService };
//# sourceMappingURL=marketing-dashboard.service.js.map