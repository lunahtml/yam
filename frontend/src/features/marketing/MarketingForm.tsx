//frontend\src\features\marketing\MarketingForm.tsx
import {
    Calendar,
    DollarSign,
    TrendingDown,
    ShoppingCart,
    Plus,
    Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Input from '../../components/Input';
import { DashboardForm } from '../../types/api';
import './MarketingForm.css';

interface FieldConfig {
    key: keyof DashboardForm;
    label: string;
    labelRu: string;
    hint: string;
}

interface MarketingFormProps {
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}

const BUDGET_FIELDS: FieldConfig[] = [
    { key: 'adBudget', label: 'Ad Budget', labelRu: 'Рекламный бюджет', hint: 'Используется в: CPC, CPM, ROAS' },
    { key: 'marketingCosts', label: 'Marketing Costs', labelRu: 'Все маркетинговые затраты', hint: 'Используется в: CPL, CPQL, CPSQL, CAC, CPO, ROMI, ROI' },
    { key: 'revenue', label: 'Revenue', labelRu: 'Выручка от маркетинга', hint: 'Используется в: ROMI, ROAS, AOV, Маржа' },
    { key: 'grossProfit', label: 'Gross Profit', labelRu: 'Валовая прибыль', hint: 'Выручка минус себестоимость. Используется в: ROI' },
];

const FUNNEL_FIELDS: FieldConfig[] = [
    { key: 'impressions', label: 'Impressions', labelRu: 'Показы', hint: 'Используется в: CTR, CPM' },
    { key: 'clicks', label: 'Clicks', labelRu: 'Клики', hint: 'Используется в: CTR, CPC, CR клик → лид' },
    { key: 'leads', label: 'Leads', labelRu: 'Лиды / заявки', hint: 'Используется в: CPL, MQL rate' },
    { key: 'mql', label: 'MQL', labelRu: 'Marketing Qualified Leads', hint: 'Используется в: MQL rate, MQL → SQL, CPQL' },
    { key: 'sql', label: 'SQL', labelRu: 'Sales Qualified Leads', hint: 'Используется в: MQL → SQL, CPSQL' },
    { key: 'meetings', label: 'Meetings', labelRu: 'Встречи / демо', hint: 'Используется в: SQL → встреча' },
    { key: 'offers', label: 'Offers', labelRu: 'КП / офферы', hint: 'Используется в: Встреча → КП, CPO' },
    { key: 'deals', label: 'Deals', labelRu: 'Сделки / клиенты', hint: 'Используется в: CAC, AOV' },
];

const SALES_FIELDS: FieldConfig[] = [
    { key: 'avgCheck', label: 'Avg Check', labelRu: 'Средний чек', hint: 'Используется в: LTV, Маржа с клиента' },
    { key: 'avgGrossMargin', label: 'Avg Gross Margin', labelRu: 'Средняя валовая маржа (0-1)', hint: '0.4 = 40%. Используется в: LTV' },
    { key: 'avgLifetimeMonths', label: 'Avg Lifetime', labelRu: 'Длительность жизни клиента (мес.)', hint: 'Используется в: LTV' },
    { key: 'avgPurchaseFreq', label: 'Avg Purchase Freq', labelRu: 'Частота покупок (раз/мес.)', hint: 'Используется в: LTV' },
    { key: 'avgRevenuePerClient', label: 'Avg Revenue / Client', labelRu: 'Средний доход с клиента', hint: 'Используется в: unit-экономика' },
    { key: 'activeClients', label: 'Active Clients', labelRu: 'Активные клиенты', hint: 'Используется в: Retention, Churn' },
    { key: 'repeatClients', label: 'Repeat Clients', labelRu: 'Повторные клиенты', hint: 'Используется в: Retention' },
];

const EXTRA_FIELDS: FieldConfig[] = [
    { key: 'operationalCosts', label: 'Operational Costs', labelRu: 'Операционные затраты', hint: 'Дополнительные расходы' },
    { key: 'organicVisits', label: 'Organic Visits', labelRu: 'Органические визиты', hint: 'Используется в: Organic share' },
    { key: 'totalVisits', label: 'Total Visits', labelRu: 'Все визиты', hint: 'Используется в: Bounce rate' },
    { key: 'bounces', label: 'Bounces', labelRu: 'Отказы', hint: 'Используется в: Bounce rate' },
    { key: 'newClients', label: 'New Clients', labelRu: 'Новые клиенты', hint: 'Используется в: CAC' },
    { key: 'tam', label: 'TAM', labelRu: 'Потенциальный рынок', hint: 'Используется в: Доля рынка' },
    { key: 'sam', label: 'SAM', labelRu: 'Доступный рынок', hint: 'Используется в: Доля SAM' },
    { key: 'som', label: 'SOM', labelRu: 'Целевой рынок', hint: 'Ваша текущая доля' },
];

function Section({
    title,
    icon: Icon,
    fields,
    form,
    onChange,
}: {
    title: string;
    icon: LucideIcon;
    fields: FieldConfig[];
    form: DashboardForm;
    onChange: (key: keyof DashboardForm, value: string) => void;
}) {
    return (
        <div className="mkt-section">
            <h3 className="mkt-section-title">
                <Icon size={18} />
                {title}
            </h3>
            <div className="mkt-section-grid">
                {fields.map((f) => (
                    <div key={f.key} className="mkt-field">
                        <Input
                            label={`${f.label} — ${f.labelRu}`}
                            value={String(form[f.key])}
                            onChange={(e) => onChange(f.key, e.target.value)}
                            type="number"
                        />
                        <div className="mkt-field-hint">
                            <Info size={11} />
                            {f.hint}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketingForm({ form, onChange }: MarketingFormProps) {
    return (
        <div className="mkt-form">
            {/* Период */}
            <div className="mkt-section">
                <h3 className="mkt-section-title">
                    <Calendar size={18} />
                    Период
                </h3>
                <div className="mkt-section-grid">
                    <Input
                        label="С даты"
                        type="date"
                        value={form.periodFrom}
                        onChange={(e) => onChange('periodFrom', e.target.value)}
                    />
                    <Input
                        label="По дату"
                        type="date"
                        value={form.periodTo}
                        onChange={(e) => onChange('periodTo', e.target.value)}
                    />
                </div>
            </div>

            <Section
                title="Период и бюджет"
                icon={DollarSign}
                fields={BUDGET_FIELDS}
                form={form}
                onChange={onChange}
            />
            <Section
                title="Воронка"
                icon={TrendingDown}
                fields={FUNNEL_FIELDS}
                form={form}
                onChange={onChange}
            />
            <Section
                title="Продажи и клиенты"
                icon={ShoppingCart}
                fields={SALES_FIELDS}
                form={form}
                onChange={onChange}
            />
            <Section
                title="Дополнительно"
                icon={Plus}
                fields={EXTRA_FIELDS}
                form={form}
                onChange={onChange}
            />
        </div>
    );
}