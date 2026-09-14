//frontend\src\pages\dashboard\marketing\MarketingForm.tsx
import Input from '../../../components/Input';
import { DashboardForm } from '../../../types/api';

interface MarketingFormProps {
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}

const BUDGET_FIELDS: { key: keyof DashboardForm; label: string }[] = [
    { key: 'period', label: 'Период' },
    { key: 'adBudget', label: 'Рекламный бюджет' },
    { key: 'marketingCosts', label: 'Все маркетинговые затраты' },
    { key: 'revenue', label: 'Выручка от маркетинга' },
    { key: 'grossProfit', label: 'Валовая прибыль' },
];

const FUNNEL_FIELDS: { key: keyof DashboardForm; label: string }[] = [
    { key: 'impressions', label: 'Показы' },
    { key: 'clicks', label: 'Клики' },
    { key: 'leads', label: 'Лиды / заявки' },
    { key: 'mql', label: 'MQL' },
    { key: 'sql', label: 'SQL' },
    { key: 'meetings', label: 'Встречи / демо' },
    { key: 'offers', label: 'КП / офферы' },
    { key: 'deals', label: 'Сделки / клиенты' },
];

const SALES_FIELDS: { key: keyof DashboardForm; label: string }[] = [
    { key: 'avgCheck', label: 'Средний чек' },
    { key: 'avgGrossMargin', label: 'Средняя валовая маржа (0-1)' },
    { key: 'avgLifetimeMonths', label: 'Средняя длительность жизни клиента (мес.)' },
    { key: 'avgPurchaseFreq', label: 'Средняя частота покупок (раз/мес.)' },
    { key: 'avgRevenuePerClient', label: 'Средний доход с клиента' },
    { key: 'activeClients', label: 'Активные клиенты' },
    { key: 'repeatClients', label: 'Повторные клиенты' },
];

const EXTRA_FIELDS: { key: keyof DashboardForm; label: string }[] = [
    { key: 'operationalCosts', label: 'Операционные затраты' },
    { key: 'organicVisits', label: 'Органические визиты' },
    { key: 'totalVisits', label: 'Все визиты' },
    { key: 'bounces', label: 'Отказы' },
    { key: 'newClients', label: 'Новые клиенты' },
    { key: 'tam', label: 'TAM' },
    { key: 'sam', label: 'SAM' },
    { key: 'som', label: 'SOM' },
];

function Section({
    title,
    fields,
    form,
    onChange,
}: {
    title: string;
    fields: { key: keyof DashboardForm; label: string }[];
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#2d3748' }}>
                {title}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {fields.map((f) => (
                    <Input
                        key={f.key}
                        label={f.label}
                        value={String(form[f.key])}
                        onChange={(e) => onChange(f.key, e.target.value)}
                        type={f.key === 'period' ? 'text' : 'number'}
                    />
                ))}
            </div>
        </div>
    );
}

export default function MarketingForm({ form, onChange }: MarketingFormProps) {
    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Section title="Период и бюджет" fields={BUDGET_FIELDS} form={form} onChange={onChange} />
            <Section title="Воронка" fields={FUNNEL_FIELDS} form={form} onChange={onChange} />
            <Section title="Продажи и клиенты" fields={SALES_FIELDS} form={form} onChange={onChange} />
            <Section title="Дополнительно" fields={EXTRA_FIELDS} form={form} onChange={onChange} />
        </div>
    );
}