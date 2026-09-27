var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/sprints/services/metrics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { MembershipService } from '../../../common/services/membership.service.js';
import { EDIT_ROLES, DESTRUCTIVE_ROLES } from '../../../common/types/roles.type.js';
/**
 * Автоматический расчёт isAchieved на основе metricType,
 * targetValue и actualValue.
 *
 * - INCREASE: actualValue >= targetValue
 * - DECREASE: actualValue <= targetValue
 * - TARGET:   actualValue === targetValue
 */
function calculateAchieved(metric) {
    if (metric.actualValue === null || metric.actualValue === undefined) {
        return false;
    }
    switch (metric.metricType) {
        case 'INCREASE':
            return metric.actualValue >= metric.targetValue;
        case 'DECREASE':
            return metric.actualValue <= metric.targetValue;
        case 'TARGET':
            return metric.actualValue === metric.targetValue;
        default:
            return false;
    }
}
/**
 * Маппинг SprintMetric.key на поле MarketingDashboard.
 * Возвращает либо число (готовое), либо null, если ключ не поддерживается.
 */
function extractDashboardValue(key, dashboard) {
    const safe = (a, b) => (b === 0 ? 0 : a / b);
    switch (key) {
        case 'impressions':
            return dashboard.impressions;
        case 'clicks':
            return dashboard.clicks;
        case 'leads':
            return dashboard.leads;
        case 'mql':
            return dashboard.mql;
        case 'sql':
            return dashboard.sql;
        case 'meetings':
            return dashboard.meetings;
        case 'offers':
            return dashboard.offers;
        case 'deals':
            return dashboard.deals;
        case 'revenue':
            return dashboard.revenue;
        case 'adBudget':
            return dashboard.adBudget;
        case 'marketingCosts':
            return dashboard.marketingCosts;
        case 'grossProfit':
            return dashboard.grossProfit;
        case 'cpl':
            return safe(dashboard.marketingCosts, dashboard.leads);
        case 'cpc':
            return safe(dashboard.adBudget, dashboard.clicks);
        case 'cpm':
            return safe(dashboard.adBudget, dashboard.impressions) * 1000;
        case 'cac':
            return safe(dashboard.marketingCosts, dashboard.deals);
        case 'cpql':
            return safe(dashboard.marketingCosts, dashboard.mql);
        case 'cpsql':
            return safe(dashboard.marketingCosts, dashboard.sql);
        case 'cpo':
            return safe(dashboard.marketingCosts, dashboard.offers);
        case 'romi':
            return dashboard.marketingCosts === 0
                ? 0
                : ((dashboard.revenue - dashboard.marketingCosts) /
                    dashboard.marketingCosts) *
                    100;
        case 'roi':
            return dashboard.marketingCosts === 0
                ? 0
                : ((dashboard.grossProfit - dashboard.marketingCosts) /
                    dashboard.marketingCosts) *
                    100;
        case 'roas':
            return safe(dashboard.revenue, dashboard.adBudget);
        default:
            return null;
    }
}
let MetricsService = class MetricsService {
    prisma;
    membership;
    constructor(prisma, membership) {
        this.prisma = prisma;
        this.membership = membership;
    }
    async create(userId, sprintId, data) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: { projectId: true },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
        const actualValue = data.actualValue ?? null;
        const isAchieved = calculateAchieved({
            metricType: data.metricType,
            targetValue: data.targetValue,
            actualValue,
        });
        return this.prisma.client.sprintMetric.create({
            data: {
                sprintId,
                key: data.key,
                label: data.label,
                metricType: data.metricType,
                targetValue: data.targetValue,
                actualValue,
                unit: data.unit,
                xpReward: data.xpReward,
                isAchieved,
            },
        });
    }
    async update(userId, id, data) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: {
                metricType: true,
                targetValue: true,
                actualValue: true,
                sprint: { select: { projectId: true } },
            },
        });
        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }
        await this.membership.assertProjectRole(userId, metric.sprint.projectId, EDIT_ROLES);
        const nextType = data.metricType ?? metric.metricType;
        const nextTarget = data.targetValue ?? metric.targetValue;
        const nextActual = data.actualValue !== undefined ? data.actualValue : metric.actualValue;
        const isAchieved = calculateAchieved({
            metricType: nextType,
            targetValue: nextTarget,
            actualValue: nextActual,
        });
        return this.prisma.client.sprintMetric.update({
            where: { id },
            data: {
                label: data.label,
                metricType: data.metricType,
                targetValue: data.targetValue,
                actualValue: data.actualValue,
                unit: data.unit,
                xpReward: data.xpReward,
                isAchieved,
            },
        });
    }
    async remove(userId, id) {
        const metric = await this.prisma.client.sprintMetric.findUnique({
            where: { id },
            select: { sprint: { select: { projectId: true } } },
        });
        if (!metric) {
            throw new ForbiddenException('Access denied to metric');
        }
        await this.membership.assertProjectRole(userId, metric.sprint.projectId, DESTRUCTIVE_ROLES);
        return this.prisma.client.sprintMetric.delete({
            where: { id },
        });
    }
    /**
     * Пересчитать actualValue всех метрик спринта из MarketingDashboard,
     * попадающего в период спринта.
     *
     * Метрики, чей key не поддерживается — не трогаем.
     */
    async recalculate(userId, sprintId) {
        const sprint = await this.prisma.client.sprint.findUnique({
            where: { id: sprintId },
            select: {
                projectId: true,
                startDate: true,
                endDate: true,
                metrics: true,
            },
        });
        if (!sprint) {
            throw new ForbiddenException('Access denied to sprint');
        }
        await this.membership.assertProjectRole(userId, sprint.projectId, EDIT_ROLES);
        // Ищем дашборд, чей период пересекается с периодом спринта.
        // Берём самый свежий.
        const dashboard = await this.prisma.client.marketingDashboard.findFirst({
            where: {
                projectId: sprint.projectId,
                periodFrom: { lte: sprint.endDate },
                periodTo: { gte: sprint.startDate },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Если дашборда нет — всё равно пересчитываем isAchieved
        // по текущему actualValue (мог поменяться алгоритм).
        if (!dashboard) {
            let recalculated = 0;
            for (const metric of sprint.metrics) {
                const isAchieved = calculateAchieved({
                    metricType: metric.metricType,
                    targetValue: metric.targetValue,
                    actualValue: metric.actualValue,
                });
                if (isAchieved !== metric.isAchieved) {
                    await this.prisma.client.sprintMetric.update({
                        where: { id: metric.id },
                        data: { isAchieved },
                    });
                    recalculated++;
                }
            }
            return {
                updated: 0,
                recalculated,
                skipped: sprint.metrics.length,
                reason: 'No marketing dashboard found for sprint period',
            };
        }
        let updated = 0;
        let skipped = 0;
        for (const metric of sprint.metrics) {
            const value = extractDashboardValue(metric.key, dashboard);
            if (value === null) {
                // key не поддерживается — actualValue не трогаем,
                // но isAchieved пересчитываем по текущему.
                const isAchieved = calculateAchieved({
                    metricType: metric.metricType,
                    targetValue: metric.targetValue,
                    actualValue: metric.actualValue,
                });
                if (isAchieved !== metric.isAchieved) {
                    await this.prisma.client.sprintMetric.update({
                        where: { id: metric.id },
                        data: { isAchieved },
                    });
                }
                skipped++;
                continue;
            }
            const isAchieved = calculateAchieved({
                metricType: metric.metricType,
                targetValue: metric.targetValue,
                actualValue: value,
            });
            await this.prisma.client.sprintMetric.update({
                where: { id: metric.id },
                data: {
                    actualValue: value,
                    isAchieved,
                },
            });
            updated++;
        }
        return {
            updated,
            skipped,
            dashboardId: dashboard.id,
            period: {
                from: dashboard.periodFrom,
                to: dashboard.periodTo,
            },
        };
    }
};
MetricsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MembershipService])
], MetricsService);
export { MetricsService };
//# sourceMappingURL=metrics.service.js.map