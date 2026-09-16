//frontend\src\pages\dashboard\ProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
    DashboardForm,
    MarketingMetrics,
    Project,
} from '../../types/api';
import MarketingForm from './marketing/MarketingForm';
import MetricsTable from './marketing/MetricsTable';
import Button from '../../components/Button';

interface ProjectDetailPageProps {
    projectId: string;
    projectName: string;
    onBack: () => void;
}

const INITIAL: DashboardForm = {
    periodFrom: new Date().toISOString().slice(0, 10),
    periodTo: new Date().toISOString().slice(0, 10),
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

export default function ProjectDetailPage({
    projectId,
    projectName,
    onBack,
}: ProjectDetailPageProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [form, setForm] = useState<DashboardForm>(INITIAL);
    const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .getProject(projectId)
            .then((p) => setProject(p as Project))
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load project'),
            );
    }, [projectId]);

    const update = (key: keyof DashboardForm, value: string) => {
        setForm({
            ...form,
            [key]: key === 'periodTo' ? value : Number(value),
        });
    };

    const calculate = () => {
        setMetrics(computeMetrics(form));
    };

    return (
        <div>
            {/* Breadcrumb / Back */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6366f1',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 0,
                        marginBottom: 8,
                    }}
                >
                    ← Назад к проектам
                </button>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>
                    📊 {project?.name ?? projectName}
                </h1>
                {project?.description && (
                    <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>
                        {project.description}
                    </p>
                )}
            </div>

            {error && (
                <div style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</div>
            )}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                    📣 Marketing Dashboard
                </h2>
                <Button
                    onClick={calculate}
                    style={{ width: 'auto', padding: '10px 24px' }}
                >
                    Рассчитать метрики
                </Button>
            </div>

            <MarketingForm form={form} onChange={update} />

            {metrics && (
                <div style={{ marginTop: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                        📈 Показатели за период {form.periodFrom} — {form.periodTo}
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