//frontend/src/pages/dashboard/utm/RulesTab.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { api } from '../../../api/client';
import { UtmRule, UtmRuleCondition } from '../../../types/api';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import InfoPopup from '../../../components/InfoPopup';
import './RulesTab.css';

interface RulesTabProps {
    projectId: string;
}

const OPERATORS = [
    { value: 'eq', label: 'равно' },
    { value: 'ne', label: 'не равно' },
    { value: 'contains', label: 'содержит' },
    { value: 'startsWith', label: 'начинается с' },
    { value: 'endsWith', label: 'заканчивается на' },
];

const FIELDS = [
    { value: 'artifact.type', label: 'Тип артефакта' },
    { value: 'artifact.name', label: 'Имя артефакта' },
    { value: 'artifact.url', label: 'URL артефакта' },
];

const TEMPLATE_VARS = [
    { key: '{{source}}', desc: 'source из выбора' },
    { key: '{{medium}}', desc: 'medium из выбора' },
    { key: '{{campaign}}', desc: 'кампания' },
    { key: '{{artifact.name}}', desc: 'имя артефакта' },
    { key: '{{artifact.type}}', desc: 'тип артефакта' },
    { key: '{{index}}', desc: 'порядковый номер (1, 2, 3)' },
    { key: '{{date}}', desc: 'дата (2026-09-17)' },
    { key: '{{contentPrefix}}', desc: 'префикс из формы' },
];

export default function RulesTab({ projectId }: RulesTabProps) {
    const [rules, setRules] = useState<UtmRule[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(0);
    const [sourceTemplate, setSourceTemplate] = useState('{{source}}');
    const [mediumTemplate, setMediumTemplate] = useState('{{medium}}');
    const [campaignTemplate, setCampaignTemplate] = useState('{{campaign}}');
    const [contentTemplate, setContentTemplate] = useState('');
    const [conditions, setConditions] = useState<UtmRuleCondition[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const data = await api.getRules(projectId);
            setRules(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    useEffect(() => {
        load();
    }, [projectId]);

    const addCondition = () => {
        setConditions([
            ...conditions,
            { field: 'artifact.type', operator: 'eq', value: 'SOCIAL' },
        ]);
    };

    const updateCondition = (
        index: number,
        patch: Partial<UtmRuleCondition>,
    ) => {
        const next = [...conditions];
        next[index] = { ...next[index], ...patch };
        setConditions(next);
    };

    const removeCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!name.trim() || !sourceTemplate || !mediumTemplate) return;
        setLoading(true);
        setError('');

        try {
            await api.createRule(projectId, {
                name: name.trim(),
                description: description.trim() || undefined,
                priority,
                conditions,
                sourceTemplate,
                mediumTemplate,
                campaignTemplate: campaignTemplate || undefined,
                contentTemplate: contentTemplate || undefined,
            });
            setName('');
            setDescription('');
            setConditions([]);
            setSourceTemplate('{{source}}');
            setMediumTemplate('{{medium}}');
            setCampaignTemplate('{{campaign}}');
            setContentTemplate('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить правило?')) return;
        try {
            await api.deleteRule(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    return (
        <div className="rules-tab">
            <div className="rules-grid">
                {/* Форма */}
                <div className="rules-form-card">
                    <div className="rules-form-header">
                        <h3 className="rules-form-title">
                            <Plus size={18} /> Новое правило
                        </h3>
                        <InfoPopup title="Как работают правила">
                            <p>
                                <strong>Правило</strong> — это автоматизация UTM-меток.
                                Когда ты генерируешь ссылку, YAM находит подходящее правило
                                и подставляет значения сама.
                            </p>
                            <p>
                                <strong>Простой пример:</strong>
                            </p>
                            <ul>
                                <li>
                                    Если артефакт — Telegram-канал
                                </li>
                                <li>
                                    То <code>source=telegram</code>, <code>medium=social</code>
                                </li>
                                <li>
                                    А <code>content=post_&#123;номер&#125;</code>
                                </li>
                            </ul>
                            <div className="example">
                                utm_source=telegram&amp;utm_medium=social&amp;utm_content=post_42
                            </div>

                            <p>
                                <strong>Условия:</strong> когда правило срабатывает.
                            </p>
                            <ul>
                                <li>
                                    <strong>eq</strong> — равно (например, artifact.type = SOCIAL)
                                </li>
                                <li>
                                    <strong>contains</strong> — содержит (например, url содержит t.me)
                                </li>
                            </ul>

                            <p>
                                <strong>Шаблоны:</strong> что подставить. Используй переменные:
                            </p>
                            <ul>
                                <li>
                                    <code>&#123;&#123;source&#125;&#125;</code> — выбранный источник
                                </li>
                                <li>
                                    <code>&#123;&#123;medium&#125;&#125;</code> — выбранный канал
                                </li>
                                <li>
                                    <code>&#123;&#123;campaign&#125;&#125;</code> — кампания
                                </li>
                                <li>
                                    <code>&#123;&#123;artifact.name&#125;&#125;</code> — имя артефакта
                                </li>
                                <li>
                                    <code>&#123;&#123;index&#125;&#125;</code> — номер (1, 2, 3)
                                </li>
                                <li>
                                    <code>&#123;&#123;date&#125;&#125;</code> — дата
                                </li>
                            </ul>

                            <p>
                                <strong>Приоритет:</strong> если подходит несколько правил,
                                побеждает то, у которого приоритет больше.
                            </p>

                            <p>
                                <strong>Совет:</strong> начни с простого правила без условий —
                                оно будет базовым для всех ссылок.
                            </p>
                        </InfoPopup>
                    </div>

                    <Input
                        label="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Telegram → social"
                    />

                    <Input
                        label="Описание (необязательно)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Автозаполнение для Telegram-каналов"
                    />

                    <Input
                        label="Приоритет (чем больше — тем важнее)"
                        type="number"
                        value={String(priority)}
                        onChange={(e) => setPriority(Number(e.target.value))}
                    />

                    {/* Условия */}
                    <div className="rules-conditions">
                        <div className="rules-conditions-header">
                            <span className="rules-conditions-label">Условия</span>
                            <button className="rules-add-condition" onClick={addCondition}>
                                <Plus size={12} /> Добавить
                            </button>
                        </div>

                        {conditions.length === 0 ? (
                            <p className="rules-empty-conditions">
                                Нет условий — правило универсальное
                            </p>
                        ) : (
                            conditions.map((c, i) => (
                                <div key={i} className="rules-condition">
                                    <select
                                        className="rules-select"
                                        value={c.field}
                                        onChange={(e) =>
                                            updateCondition(i, { field: e.target.value })
                                        }
                                    >
                                        {FIELDS.map((f) => (
                                            <option key={f.value} value={f.value}>
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="rules-select"
                                        value={c.operator}
                                        onChange={(e) =>
                                            updateCondition(i, {
                                                operator: e.target
                                                    .value as UtmRuleCondition['operator'],
                                            })
                                        }
                                    >
                                        {OPERATORS.map((op) => (
                                            <option key={op.value} value={op.value}>
                                                {op.label}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        className="rules-input"
                                        value={String(c.value)}
                                        onChange={(e) =>
                                            updateCondition(i, { value: e.target.value })
                                        }
                                        placeholder="SOCIAL"
                                    />

                                    <button
                                        className="rules-remove-condition"
                                        onClick={() => removeCondition(i)}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Шаблоны */}
                    <div className="rules-templates-block">
                        <div className="rules-templates-header">
                            <span className="rules-templates-label">Шаблоны</span>
                            <InfoPopup title="Доступные переменные">
                                <p>
                                    В шаблонах можно использовать переменные. YAM подставит
                                    значения при генерации ссылки.
                                </p>
                                <ul>
                                    {TEMPLATE_VARS.map((v) => (
                                        <li key={v.key}>
                                            <code>{v.key}</code> — {v.desc}
                                        </li>
                                    ))}
                                </ul>
                                <p>
                                    <strong>Пример:</strong>
                                </p>
                                <div className="example">
                                    content = post_&#123;&#123;index&#125;&#125; → post_1, post_2, post_3
                                </div>
                                <p>
                                    <strong>Пример с артефактом:</strong>
                                </p>
                                <div className="example">
                                    content = &#123;&#123;artifact.name&#125;&#125;_&#123;&#123;index&#125;&#125;
                                    → telegram_channel_1
                                </div>
                            </InfoPopup>
                        </div>

                        <Input
                            label="utm_source шаблон"
                            value={sourceTemplate}
                            onChange={(e) => setSourceTemplate(e.target.value)}
                            placeholder="{{source}}"
                        />
                        <Input
                            label="utm_medium шаблон"
                            value={mediumTemplate}
                            onChange={(e) => setMediumTemplate(e.target.value)}
                            placeholder="{{medium}}"
                        />
                        <Input
                            label="utm_campaign шаблон"
                            value={campaignTemplate}
                            onChange={(e) => setCampaignTemplate(e.target.value)}
                            placeholder="{{campaign}}"
                        />
                        <Input
                            label="utm_content шаблон"
                            value={contentTemplate}
                            onChange={(e) => setContentTemplate(e.target.value)}
                            placeholder="{{artifact.name}}_{{index}}"
                        />
                    </div>

                    <Button onClick={handleCreate} loading={loading}>
                        <Plus size={16} /> Создать правило
                    </Button>
                </div>

                {/* Список */}
                <div className="rules-list-card">
                    <h3 className="rules-list-title">Правила ({rules.length})</h3>

                    {error && <div className="rules-error">{error}</div>}

                    {rules.length === 0 ? (
                        <p className="rules-empty">Пока нет правил</p>
                    ) : (
                        <div className="rules-list">
                            {rules.map((r) => (
                                <div key={r.id} className="rules-item">
                                    <div className="rules-item-content">
                                        <div className="rules-item-header">
                                            <Zap size={14} className="rules-item-icon" />
                                            <span className="rules-item-name">{r.name}</span>
                                            {r.isActive && (
                                                <span className="rules-item-badge">активно</span>
                                            )}
                                            <span className="rules-item-priority">
                                                приоритет {r.priority}
                                            </span>
                                        </div>

                                        {r.description && (
                                            <div className="rules-item-desc">{r.description}</div>
                                        )}

                                        {r.conditions.length > 0 && (
                                            <div className="rules-item-conditions">
                                                {r.conditions.map((c, i) => (
                                                    <span key={i} className="rules-condition-tag">
                                                        {c.field} {c.operator} {String(c.value)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="rules-item-templates">
                                            <span>source: {r.sourceTemplate}</span>
                                            <span>medium: {r.mediumTemplate}</span>
                                            {r.campaignTemplate && (
                                                <span>campaign: {r.campaignTemplate}</span>
                                            )}
                                            {r.contentTemplate && (
                                                <span>content: {r.contentTemplate}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="rules-item-delete"
                                        onClick={() => handleDelete(r.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}