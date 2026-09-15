//frontend\src\pages\dashboard\marketing\MarketingForm.tsx
//frontend/src/pages/dashboard/marketing/MarketingForm.tsx
import Input from '../../../components/Input';
import { DashboardForm } from '../../../types/api';

interface FieldConfig {
    key: keyof DashboardForm;
    label: string;
    hint: string;
}

interface MarketingFormProps {
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}

const BUDGET_FIELDS: FieldConfig[] = [
    {
        key: 'period',
        label: 'Период',
        hint: 'Отчётный период, например «Январь 2026»',
    },
    {
        key: 'adBudget',
        label: 'Рекламный бюджет',
        hint: 'Используется в: CPC = adBudget / clicks; CPM = adBudget / impressions * 1000; ROAS = revenue / adBudget',
    },
    {
        key: 'marketingCosts',
        label: 'Все маркетинговые затраты',
        hint: 'Используется в: CPL, CPQL, CPSQL, CAC, CPO, ROMI, ROI, ROAS (полный), Marketing cost ratio',
    },
    {
        key: 'revenue',
        label: 'Выручка от маркетинга',
        hint: 'Используется в: ROMI, ROAS, ROAS (полный), AOV, Маржа, Marketing cost ratio',
    },
    {
        key: 'grossProfit',
        label: 'Валовая прибыль',
        hint: 'Выручка минус себестоимость. Используется в: ROI = (grossProfit - marketingCosts) / marketingCosts * 100',
    },
];

const FUNNEL_FIELDS: FieldConfig[] = [
    {
        key: 'impressions',
        label: 'Показы',
        hint: 'Количество показов рекламы/контента. Используется в: CTR, CPM',
    },
    {
        key: 'clicks',
        label: 'Клики',
        hint: 'Переходы по объявлению/ссылке. Используется в: CTR, CPC, CR клик → лид, Общая конверсия',
    },
    {
        key: 'leads',
        label: 'Лиды / заявки',
        hint: 'Все полученные заявки. Используется в: CPL, MQL rate, Конверсия lead → sale',
    },
    {
        key: 'mql',
        label: 'MQL',
        hint: 'Лиды, прошедшие маркетинговую квалификацию. Используется в: MQL rate, MQL → SQL, CPQL',
    },
    {
        key: 'sql',
        label: 'SQL',
        hint: 'Лиды, принятые отделом продаж. Используется в: MQL → SQL, SQL → встреча, CPSQL',
    },
    {
        key: 'meetings',
        label: 'Встречи / демо',
        hint: 'Состоявшиеся встречи. Используется в: SQL → встреча, Встреча → КП',
    },
    {
        key: 'offers',
        label: 'КП / офферы',
        hint: 'Отправленные коммерческие предложения. Используется в: Встреча → КП, CR КП → сделка, CPO',
    },
    {
        key: 'deals',
        label: 'Сделки / клиенты',
        hint: 'Выигранные сделки. Используется в: CAC, AOV, Конверсия lead/MQL/SQL → sale, Общая конверсия',
    },
];

const SALES_FIELDS: FieldConfig[] = [
    {
        key: 'avgCheck',
        label: 'Средний чек',
        hint: 'Средняя выручка на сделку. Используется в: LTV, Маржа с клиента, Прибыль с клиента',
    },
    {
        key: 'avgGrossMargin',
        label: 'Средняя валовая маржа (0-1)',
        hint: 'Доля валовой прибыли: 0.4 = 40%. Используется в: LTV, Маржа с клиента, Payback period',
    },
    {
        key: 'avgLifetimeMonths',
        label: 'Средняя длительность жизни клиента (мес.)',
        hint: 'Сколько месяцев клиент остаётся с вами. Используется в: LTV',
    },
    {
        key: 'avgPurchaseFreq',
        label: 'Средняя частота покупок (раз/мес.)',
        hint: 'Сколько раз в месяц клиент покупает. Используется в: LTV',
    },
    {
        key: 'avgRevenuePerClient',
        label: 'Средний доход с клиента',
        hint: 'Используется в: Выручка на клиента (unit-экономика)',
    },
    {
        key: 'activeClients',
        label: 'Активные клиенты',
        hint: 'Используется в: Retention, Churn, Repeat purchase rate',
    },
    {
        key: 'repeatClients',
        label: 'Повторные клиенты',
        hint: 'Используется в: Retention, Repeat purchase rate',
    },
];

const EXTRA_FIELDS: FieldConfig[] = [
    {
        key: 'operationalCosts',
        label: 'Операционные затраты',
        hint: 'Дополнительные расходы (не входят в маркетинговые)',
    },
    {
        key: 'organicVisits',
        label: 'Органические визиты',
        hint: 'Используется в: Organic share = organicVisits / totalVisits * 100',
    },
    {
        key: 'totalVisits',
        label: 'Все визиты',
        hint: 'Используется в: Bounce rate, Organic share',
    },
    {
        key: 'bounces',
        label: 'Отказы',
        hint: 'Незавершённые визиты. Используется в: Bounce rate',
    },
    {
        key: 'newClients',
        label: 'Новые клиенты',
        hint: 'Используется в: CAC (альтернативный знаменатель)',
    },
    {
        key: 'tam',
        label: 'TAM (потенциальный рынок)',
        hint: 'Total Addressable Market. Используется в: Доля рынка = som / tam * 100',
    },
    {
        key: 'sam',
        label: 'SAM (доступный рынок)',
        hint: 'Serviceable Available Market. Используется в: Доля SAM = som / sam * 100',
    },
    {
        key: 'som',
        label: 'SOM (целевой рынок)',
        hint: 'Serviceable Obtainable Market. Ваша текущая доля',
    },
];

function Section({
    title,
    icon,
    fields,
    form,
    onChange,
}: {
    title: string;
    icon: string;
    fields: FieldConfig[];
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h3
                style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 16,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {title}
            </h3>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                }}
            >
                {fields.map((f) => (
                    <div key={f.key}>
                        <Input
                            label={f.label}
                            value={String(form[f.key])}
                            onChange={(e) => onChange(f.key, e.target.value)}
                            type={f.key === 'period' ? 'text' : 'number'}
                        />
                        <div
                            style={{
                                marginTop: -8,
                                marginBottom: 8,
                                fontSize: 11,
                                color: '#718096',
                                lineHeight: 1.4,
                                paddingLeft: 4,
                            }}
                        >
                            💡 {f.hint}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketingForm({ form, onChange }: MarketingFormProps) {
    return (
        <div
            style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
        >
            <Section title="Период и бюджет" icon="📅" fields={BUDGET_FIELDS} form={form} onChange={onChange} />
            <Section title="Воронка" icon="🔽" fields={FUNNEL_FIELDS} form={form} onChange={onChange} />
            <Section title="Продажи и клиенты" icon="🛒" fields={SALES_FIELDS} form={form} onChange={onChange} />
            <Section title="Дополнительно" icon="➕" fields={EXTRA_FIELDS} form={form} onChange={onChange} />
        </div>
    );
}