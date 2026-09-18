//frontend/src/pages/dashboard/marketing/MetricsTable.tsx
import {
    TrendingDown,
    TrendingUp,
    DollarSign,
    Users,
    Zap,
    Calculator,
    Target,
    ShoppingCart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashboardForm, MarketingMetrics } from '../../../types/api';
import './MetricsTable.css';

interface MetricRow {
    label: string;
    value: number;
    formula: string;
    description: string;
    unit: string;
    status: 'good' | 'warning' | 'bad' | 'neutral';
}

interface MetricsGroup {
    title: string;
    icon: LucideIcon;
    rows: MetricRow[];
}

function getStatus(
    value: number,
    bad: number,
    good: number,
    higherIsBetter: boolean,
): 'good' | 'warning' | 'bad' | 'neutral' {
    if (value === 0) return 'neutral';

    if (higherIsBetter) {
        if (value >= good) return 'good';
        if (value >= bad) return 'warning';
        return 'bad';
    } else {
        if (value <= good) return 'good';
        if (value <= bad) return 'warning';
        return 'bad';
    }
}

function buildGroups(m: MarketingMetrics, d: DashboardForm): MetricsGroup[] {
    const safe = (a: number, b: number) => (b === 0 ? 0 : a / b);

    const mqlRate = safe(d.mql, d.leads) * 100;
    const leadToSale = safe(d.deals, d.leads) * 100;
    const mqlToSale = safe(d.deals, d.mql) * 100;
    const sqlToSale = safe(d.deals, d.sql) * 100;
    const margin = safe(d.grossProfit, d.revenue) * 100;
    const repeatPurchaseRate = safe(d.repeatClients, d.activeClients) * 100;

    return [
        {
            title: 'Воронка (конверсии)',
            icon: TrendingDown,
            rows: [
                { label: 'CTR', value: m.funnel.ctr, formula: 'clicks / impressions * 100', description: 'Кликабельность объявлений. Норма: > 3%', unit: '%', status: getStatus(m.funnel.ctr, 1, 3, true) },
                { label: 'CR клик → лид', value: m.funnel.crClickLead, formula: 'leads / clicks * 100', description: 'Конверсия клика в лид. Норма: > 5%', unit: '%', status: getStatus(m.funnel.crClickLead, 2, 5, true) },
                { label: 'MQL rate', value: mqlRate, formula: 'mql / leads * 100', description: 'Доля лидов, прошедших маркетинговую квалификацию', unit: '%', status: getStatus(mqlRate, 20, 40, true) },
                { label: 'MQL → SQL', value: m.funnel.crMqlSql, formula: 'sql / mql * 100', description: 'Квалификация продажами. Норма: > 50%', unit: '%', status: getStatus(m.funnel.crMqlSql, 30, 50, true) },
                { label: 'SQL → встреча', value: m.funnel.crSqlMeeting, formula: 'meetings / sql * 100', description: 'Назначение встреч. Норма: > 60%', unit: '%', status: getStatus(m.funnel.crSqlMeeting, 40, 60, true) },
                { label: 'Встреча → КП', value: m.funnel.crMeetingOffer, formula: 'offers / meetings * 100', description: 'Отправка КП после встречи. Норма: > 70%', unit: '%', status: getStatus(m.funnel.crMeetingOffer, 50, 70, true) },
                { label: 'CR КП → сделка', value: m.funnel.crOfferDeal, formula: 'deals / offers * 100', description: 'Закрытие сделки. Норма: > 40%', unit: '%', status: getStatus(m.funnel.crOfferDeal, 20, 40, true) },
                { label: 'Конверсия lead → sale', value: leadToSale, formula: 'deals / leads * 100', description: 'Сквозная конверсия из лида в сделку', unit: '%', status: getStatus(leadToSale, 1, 5, true) },
                { label: 'Конверсия MQL → sale', value: mqlToSale, formula: 'deals / mql * 100', description: 'Сквозная конверсия из MQL в сделку', unit: '%', status: getStatus(mqlToSale, 5, 15, true) },
                { label: 'Конверсия SQL → sale', value: sqlToSale, formula: 'deals / sql * 100', description: 'Сквозная конверсия из SQL в сделку', unit: '%', status: getStatus(sqlToSale, 10, 30, true) },
                { label: 'Общая конверсия', value: m.funnel.crTotal, formula: 'deals / clicks * 100', description: 'Сквозная конверсия из клика в сделку', unit: '%', status: getStatus(m.funnel.crTotal, 1, 3, true) },
            ],
        },
        {
            title: 'Стоимости',
            icon: DollarSign,
            rows: [
                { label: 'CPC', value: m.costs.cpc, formula: 'adBudget / clicks', description: 'Цена за клик. Чем ниже — тем лучше', unit: '₽', status: getStatus(m.costs.cpc, 100, 50, false) },
                { label: 'CPM', value: m.costs.cpm, formula: 'adBudget / impressions * 1000', description: 'Цена за 1000 показов', unit: '₽', status: getStatus(m.costs.cpm, 500, 200, false) },
                { label: 'CPL', value: m.costs.cpl, formula: 'marketingCosts / leads', description: 'Цена за лид', unit: '₽', status: getStatus(m.costs.cpl, 2000, 800, false) },
                { label: 'CPQL', value: m.costs.cpql, formula: 'marketingCosts / mql', description: 'Цена за MQL', unit: '₽', status: getStatus(m.costs.cpql, 5000, 2000, false) },
                { label: 'CPSQL', value: m.costs.cpsql, formula: 'marketingCosts / sql', description: 'Цена за SQL', unit: '₽', status: getStatus(m.costs.cpsql, 10000, 5000, false) },
                { label: 'CAC', value: m.costs.cac, formula: 'marketingCosts / deals', description: 'Цена привлечения клиента', unit: '₽', status: getStatus(m.costs.cac, 30000, 15000, false) },
                { label: 'CPO', value: m.costs.cpo, formula: 'marketingCosts / offers', description: 'Цена за КП', unit: '₽', status: getStatus(m.costs.cpo, 5000, 2000, false) },
            ],
        },
        {
            title: 'ROI / ROMI / ROAS',
            icon: TrendingUp,
            rows: [
                { label: 'ROMI', value: m.roi.romi, formula: '(revenue - marketingCosts) / marketingCosts * 100', description: 'Возврат маркетинговых инвестиций. Норма: > 200%', unit: '%', status: getStatus(m.roi.romi, 50, 200, true) },
                { label: 'ROI', value: m.roi.roi, formula: '(grossProfit - marketingCosts) / marketingCosts * 100', description: 'Рентабельность инвестиций', unit: '%', status: getStatus(m.roi.roi, 20, 100, true) },
                { label: 'ROAS', value: m.roi.roas, formula: 'revenue / adBudget', description: 'Возврат на рекламный бюджет. Норма: > 4x', unit: 'x', status: getStatus(m.roi.roas, 2, 4, true) },
                { label: 'ROAS (полный)', value: m.roi.roasFull, formula: 'revenue / marketingCosts', description: 'Возврат на все маркетинговые затраты', unit: 'x', status: getStatus(m.roi.roasFull, 1.5, 3, true) },
                { label: 'Marketing cost ratio', value: m.roi.marketingShare, formula: 'marketingCosts / revenue * 100', description: 'Доля маркетинга в выручке. Норма: < 20%', unit: '%', status: getStatus(m.roi.marketingShare, 50, 20, false) },
            ],
        },
        {
            title: 'LTV / CAC',
            icon: Target,
            rows: [
                { label: 'LTV', value: m.ltv.ltv, formula: 'avgCheck * avgPurchaseFreq * avgLifetimeMonths * avgGrossMargin', description: 'Пожизненная ценность клиента', unit: '₽', status: getStatus(m.ltv.ltv, 30000, 60000, true) },
                { label: 'LTV / CAC', value: m.ltv.ltvCac, formula: 'ltv / cac', description: 'Здоровье бизнеса. Норма: ≥ 3x', unit: 'x', status: getStatus(m.ltv.ltvCac, 1, 3, true) },
                { label: 'Payback period', value: m.ltv.payback, formula: 'cac / (avgCheck * avgGrossMargin)', description: 'Окупаемость клиента. Норма: < 3 мес.', unit: 'мес.', status: getStatus(m.ltv.payback, 12, 3, false) },
            ],
        },
        {
            title: 'Продажи и клиенты',
            icon: ShoppingCart,
            rows: [
                { label: 'AOV (средний чек)', value: m.efficiency.aov, formula: 'revenue / deals', description: 'Средняя выручка на сделку', unit: '₽', status: getStatus(m.efficiency.aov, 10000, 30000, true) },
                { label: 'Маржа', value: margin, formula: 'grossProfit / revenue * 100', description: 'Доля валовой прибыли в выручке', unit: '%', status: getStatus(margin, 20, 40, true) },
                { label: 'Retention', value: m.efficiency.retention, formula: 'repeatClients / activeClients * 100', description: 'Удержание. Норма: > 50%', unit: '%', status: getStatus(m.efficiency.retention, 20, 50, true) },
                { label: 'Repeat purchase rate', value: repeatPurchaseRate, formula: 'repeatClients / activeClients * 100', description: 'Доля повторных покупок', unit: '%', status: getStatus(repeatPurchaseRate, 20, 50, true) },
                { label: 'Churn', value: m.efficiency.churn, formula: '100 - retention', description: 'Отток. Норма: < 50%', unit: '%', status: getStatus(m.efficiency.churn, 80, 50, false) },
            ],
        },
        {
            title: 'Эффективность',
            icon: Zap,
            rows: [
                { label: 'Bounce rate', value: m.efficiency.bounceRate, formula: 'bounces / totalVisits * 100', description: 'Отказы. Норма: < 40%', unit: '%', status: getStatus(m.efficiency.bounceRate, 70, 40, false) },
                { label: 'Organic share', value: m.efficiency.organicShare, formula: 'organicVisits / totalVisits * 100', description: 'Доля органики. Норма: > 30%', unit: '%', status: getStatus(m.efficiency.organicShare, 10, 30, true) },
                { label: 'Доля рынка', value: m.efficiency.marketShare, formula: 'som / tam * 100', description: 'Доля на рынке TAM', unit: '%', status: getStatus(m.efficiency.marketShare, 1, 5, true) },
                { label: 'Доля SAM', value: m.efficiency.samShare, formula: 'som / sam * 100', description: 'Доля на рынке SAM', unit: '%', status: getStatus(m.efficiency.samShare, 5, 20, true) },
            ],
        },
        {
            title: 'Юнит-экономика',
            icon: Calculator,
            rows: [
                { label: 'Маржа с клиента', value: m.unit.marginPerClient, formula: 'avgCheck * avgGrossMargin', description: 'Прибыль с одного клиента', unit: '₽', status: getStatus(m.unit.marginPerClient, 10000, 30000, true) },
                { label: 'Прибыль с клиента', value: m.unit.profitPerClient, formula: '(avgCheck * avgGrossMargin) - cac', description: 'Чистая прибыль. Норма: > 0', unit: '₽', status: getStatus(m.unit.profitPerClient, 0, 10000, true) },
                { label: 'Точка окупаемости', value: m.unit.breakEven, formula: 'cac / (avgCheck * avgGrossMargin)', description: 'Сколько клиентов нужно. Норма: < 2', unit: 'шт.', status: getStatus(m.unit.breakEven, 5, 2, false) },
                { label: 'Выручка на клиента', value: m.unit.revenuePerClient, formula: 'avgRevenuePerClient', description: 'Средний доход с клиента', unit: '₽', status: getStatus(m.unit.revenuePerClient, 30000, 60000, true) },
                { label: 'Прибыль на клиента', value: m.unit.profit, formula: 'revenue - marketingCosts', description: 'Общая прибыль с маркетинга', unit: '₽', status: getStatus(m.unit.profit, 0, 100000, true) },
            ],
        },
    ];
}

export default function MetricsTable({
    metrics,
    form,
}: {
    metrics: MarketingMetrics;
    form: DashboardForm;
}) {
    const groups = buildGroups(metrics, form);

    const formatValue = (v: number, unit: string) => {
        if (unit === '%') return `${v.toFixed(2)}%`;
        if (unit === '₽') return `${v.toFixed(2)} ₽`;
        if (unit === 'x') return `${v.toFixed(2)}x`;
        if (unit === 'мес.') return `${v.toFixed(2)} мес.`;
        return `${v.toFixed(2)} ${unit}`;
    };

    return (
        <div className="metrics-table">
            {groups.map((group) => {
                const Icon = group.icon;
                return (
                    <div key={group.title} className="metrics-group">
                        <h3 className="metrics-group-title">
                            <Icon size={18} />
                            {group.title}
                        </h3>

                        <table className="metrics-group-table">
                            <thead>
                                <tr>
                                    <th className="metrics-th">Метрика</th>
                                    <th className="metrics-th">Формула</th>
                                    <th className="metrics-th metrics-th-right">Значение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.rows.map((row) => (
                                    <tr
                                        key={row.label}
                                        className={`metrics-row metrics-row-${row.status}`}
                                    >
                                        <td className="metrics-td">
                                            <div className="metrics-label">{row.label}</div>
                                            <div className="metrics-desc">{row.description}</div>
                                        </td>
                                        <td className="metrics-td metrics-formula">
                                            {row.formula}
                                        </td>
                                        <td
                                            className={`metrics-td metrics-td-right metrics-value metrics-value-${row.status}`}
                                        >
                                            {formatValue(row.value, row.unit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}