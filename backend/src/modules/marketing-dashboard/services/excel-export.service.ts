//backend/src/modules/marketing-dashboard/services/excel-export.service.ts
import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { MarketingMetrics } from './marketing-dashboard.service.js';

interface DashboardWithMetrics {
    periodFrom: Date;
    periodTo: Date;
    revenue: number;
    adBudget: number;
    marketingCosts: number;
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
    metrics?: MarketingMetrics;
}

@Injectable()
export class ExcelExportService {
    async exportDashboard(
        dashboard: DashboardWithMetrics,
        projectName: string,
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'YAM';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Метрики');

        // Заголовок
        sheet.mergeCells('A1:C1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Marketing Dashboard — ${projectName}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        sheet.mergeCells('A2:C2');
        const periodCell = sheet.getCell('A2');
        periodCell.value = `Период: ${this.formatDate(dashboard.periodFrom)} — ${this.formatDate(dashboard.periodTo)}`;
        periodCell.font = { italic: true, size: 11 };
        periodCell.alignment = { horizontal: 'center' };

        // Пустая строка
        sheet.addRow([]);

        // Заголовки таблицы
        const headerRow = sheet.addRow(['Метрика', 'Формула', 'Значение']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' },
        };
        headerRow.alignment = { horizontal: 'center' };

        // Метрики — секции
        const m = dashboard.metrics;
        if (!m) {
            // Только сырые данные
            this.addRawData(sheet, dashboard);
        } else {
            this.addSection(sheet, 'Воронка (конверсии)', [
                ['CTR', 'clicks / impressions * 100', `${m.funnel.ctr.toFixed(2)}%`],
                ['CR клик → лид', 'leads / clicks * 100', `${m.funnel.crClickLead.toFixed(2)}%`],
                ['MQL rate', 'mql / leads * 100', `${(m.funnel.crLeadMql).toFixed(2)}%`],
                ['MQL → SQL', 'sql / mql * 100', `${m.funnel.crMqlSql.toFixed(2)}%`],
                ['SQL → встреча', 'meetings / sql * 100', `${m.funnel.crSqlMeeting.toFixed(2)}%`],
                ['Встреча → КП', 'offers / meetings * 100', `${m.funnel.crMeetingOffer.toFixed(2)}%`],
                ['КП → сделка', 'deals / offers * 100', `${m.funnel.crOfferDeal.toFixed(2)}%`],
                ['Общая конверсия', 'deals / clicks * 100', `${m.funnel.crTotal.toFixed(2)}%`],
            ]);

            this.addSection(sheet, 'Стоимости', [
                ['CPC', 'adBudget / clicks', `${m.costs.cpc.toFixed(2)} ₽`],
                ['CPM', 'adBudget / impressions * 1000', `${m.costs.cpm.toFixed(2)} ₽`],
                ['CPL', 'marketingCosts / leads', `${m.costs.cpl.toFixed(2)} ₽`],
                ['CPQL', 'marketingCosts / mql', `${m.costs.cpql.toFixed(2)} ₽`],
                ['CPSQL', 'marketingCosts / sql', `${m.costs.cpsql.toFixed(2)} ₽`],
                ['CAC', 'marketingCosts / deals', `${m.costs.cac.toFixed(2)} ₽`],
                ['CPO', 'marketingCosts / offers', `${m.costs.cpo.toFixed(2)} ₽`],
            ]);

            this.addSection(sheet, 'ROI / ROMI / ROAS', [
                ['ROMI', '(revenue - marketingCosts) / marketingCosts * 100', `${m.roi.romi.toFixed(2)}%`],
                ['ROI', '(grossProfit - marketingCosts) / marketingCosts * 100', `${m.roi.roi.toFixed(2)}%`],
                ['ROAS', 'revenue / adBudget', `${m.roi.roas.toFixed(2)}x`],
                ['ROAS (полный)', 'revenue / marketingCosts', `${m.roi.roasFull.toFixed(2)}x`],
                ['Marketing cost ratio', 'marketingCosts / revenue * 100', `${m.roi.marketingShare.toFixed(2)}%`],
            ]);

            this.addSection(sheet, 'LTV / CAC', [
                ['LTV', 'avgCheck * avgPurchaseFreq * avgLifetimeMonths * avgGrossMargin', `${m.ltv.ltv.toFixed(2)} ₽`],
                ['LTV / CAC', 'ltv / cac', `${m.ltv.ltvCac.toFixed(2)}x`],
                ['Payback period', 'cac / (avgCheck * avgGrossMargin)', `${m.ltv.payback.toFixed(2)} мес.`],
            ]);

            this.addSection(sheet, 'Эффективность', [
                ['AOV', 'revenue / deals', `${m.efficiency.aov.toFixed(2)} ₽`],
                ['Retention', 'repeatClients / activeClients * 100', `${m.efficiency.retention.toFixed(2)}%`],
                ['Churn', '100 - retention', `${m.efficiency.churn.toFixed(2)}%`],
                ['Bounce rate', 'bounces / totalVisits * 100', `${m.efficiency.bounceRate.toFixed(2)}%`],
                ['Organic share', 'organicVisits / totalVisits * 100', `${m.efficiency.organicShare.toFixed(2)}%`],
                ['Доля рынка', 'som / tam * 100', `${m.efficiency.marketShare.toFixed(2)}%`],
                ['Доля SAM', 'som / sam * 100', `${m.efficiency.samShare.toFixed(2)}%`],
            ]);

            this.addSection(sheet, 'Юнит-экономика', [
                ['Маржа с клиента', 'avgCheck * avgGrossMargin', `${m.unit.marginPerClient.toFixed(2)} ₽`],
                ['Прибыль с клиента', '(avgCheck * avgGrossMargin) - cac', `${m.unit.profitPerClient.toFixed(2)} ₽`],
                ['Точка окупаемости', 'cac / (avgCheck * avgGrossMargin)', `${m.unit.breakEven.toFixed(2)}`],
                ['Выручка на клиента', 'avgRevenuePerClient', `${m.unit.revenuePerClient.toFixed(2)} ₽`],
                ['Прибыль', 'revenue - marketingCosts', `${m.unit.profit.toFixed(2)} ₽`],
            ]);
        }

        // Автоширина колонок
        sheet.columns.forEach((column) => {
            let maxLength = 10;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
                const len = cell.value ? String(cell.value).length : 0;
                if (len > maxLength) maxLength = len;
            });
            column.width = Math.min(maxLength + 4, 60);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer as ArrayBuffer);
    }

    async exportHistory(
        dashboards: DashboardWithMetrics[],
        projectName: string,
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'YAM';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('История периодов');

        // Заголовок
        sheet.mergeCells('A1:F1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `История периодов — ${projectName}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        // Заголовки колонок
        const headerRow = sheet.addRow([
            'Период с',
            'Период по',
            'Выручка',
            'Рекламный бюджет',
            'Маркетинговые затраты',
            'Прибыль',
        ]);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' },
        };

        // Данные
        dashboards.forEach((d) => {
            sheet.addRow([
                this.formatDate(d.periodFrom),
                this.formatDate(d.periodTo),
                d.revenue,
                d.adBudget,
                d.marketingCosts,
                d.revenue - d.marketingCosts,
            ]);
        });

        // Автоширина
        sheet.columns.forEach((column) => {
            let maxLength = 15;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
                const len = cell.value ? String(cell.value).length : 0;
                if (len > maxLength) maxLength = len;
            });
            column.width = Math.min(maxLength + 4, 40);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer as ArrayBuffer);
    }

    private addSection(
        sheet: ExcelJS.Worksheet,
        title: string,
        rows: [string, string, string][],
    ) {
        // Заголовок секции
        const sectionRow = sheet.addRow([title, '', '']);
        sectionRow.font = { bold: true, size: 12 };
        sectionRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
        };

        // Строки секции
        rows.forEach(([label, formula, value]) => {
            sheet.addRow([label, formula, value]);
        });

        // Пустая строка
        sheet.addRow([]);
    }

    private addRawData(
        sheet: ExcelJS.Worksheet,
        d: DashboardWithMetrics,
    ) {
        this.addSection(sheet, 'Сырые данные', [
            ['Рекламный бюджет', 'adBudget', `${d.adBudget} ₽`],
            ['Маркетинговые затраты', 'marketingCosts', `${d.marketingCosts} ₽`],
            ['Выручка', 'revenue', `${d.revenue} ₽`],
            ['Валовая прибыль', 'grossProfit', `${d.grossProfit} ₽`],
            ['Показы', 'impressions', String(d.impressions)],
            ['Клики', 'clicks', String(d.clicks)],
            ['Лиды', 'leads', String(d.leads)],
            ['MQL', 'mql', String(d.mql)],
            ['SQL', 'sql', String(d.sql)],
            ['Встречи', 'meetings', String(d.meetings)],
            ['КП', 'offers', String(d.offers)],
            ['Сделки', 'deals', String(d.deals)],
        ]);
    }

    private formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('ru-RU');
    }
}