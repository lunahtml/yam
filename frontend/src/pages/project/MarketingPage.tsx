//frontend/src/pages/project/MarketingPage.tsx
import { useState } from 'react';
import { Megaphone, Calculator, BarChart3 } from 'lucide-react';
import MarketingForm from '../../features/marketing/MarketingForm';
import MetricsTable from '../../features/marketing/MetricsTable';
import { DashboardForm, MarketingMetrics } from '../../types/api';
import Button from '../../components/Button';
import './MarketingPage.css';

const today = new Date().toISOString().slice(0, 10);

const INITIAL: DashboardForm = {
    periodFrom: today,
    periodTo: today,
    adBudget: 0,
    marketingCosts: 0,
    revenue: 0,
    grossProfit: 0,
    impressions: 0,
    clicks: 0,
    leads: 0,
    mql: 0,
    sql: 0,
    meetings: 0,
    offers: 0,
    deals: 0,
    avgCheck: 0,
    avgGrossMargin: 0,
    avgLifetimeMonths: 0,
    avgPurchaseFreq: 0,
    avgRevenuePerClient: 0,
    activeClients: 0,
    repeatClients: 0,
    retention: 0,
    avgProductPrice: 0,
    operationalCosts: 0,
    organicVisits: 0,
    totalVisits: 0,
    bounces: 0,
    newClients: 0,
    tam: 0,
    sam: 0,
    som: 0,
};

export default function MarketingPage() {
    const [form, setForm] = useState<DashboardForm>(INITIAL);
    const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);

    const update = (key: keyof DashboardForm, value: string) => {
        setForm({
            ...form,
            [key]:
                key === 'periodFrom' || key === 'periodTo' ? value : Number(value),
        });
    };

    const calculate = () => {
        setMetrics(computeMetrics(form));
    };

    return (
        <div className="marketing-page">
            <div className="marketing-header">
                <h1 className="marketing-title">
                    <span className="marketing-title-icon">
                        <Megaphone size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Маркетинг
                </h1>

                <Button
                    onClick={calculate}
                    style={{ width: 'auto', padding: '10px 24px' }}
                >
                    <Calculator size={16} />
                    Рассчитать
                </Button>
            </div>

            <MarketingForm form={form} onChange={update} />

            {metrics && (
                <div className="marketing-metrics">
                    <h2 className="marketing-metrics-title">
                        <BarChart3 size={20} />
                        Показатели за {form.periodFrom} — {form.periodTo}
                    </h2>
                    <MetricsTable metrics={metrics} form={form} />
                </div>
            )}
        </div>
    );
}

function computeMetrics(d: DashboardForm): MarketingMetrics {
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
    const churn = d.activeClients === 0 ? 0 : 100 - retention;
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