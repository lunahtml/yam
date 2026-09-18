//frontend/src/pages/project/SprintDetailPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { EntityRecord, Sprint as SprintType } from '../../types/api';

import {
    ArrowLeft,
    Target,
    Calendar,
    Trash2,
    TrendingUp,
    TrendingDown,
    Minus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Pause,
    Rocket,
    Award,
    Zap,
    Kanban, Plus, Check
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sprint, SprintMetric, SprintEvent, Increment } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './SprintDetailPage.css';

interface SprintDetailPageProps {
    sprintId: string;
    sprintName: string;
    onBack: () => void;
}

type Tab = 'overview' | 'tasks' | 'metrics' | 'increments' | 'events';
type EventType =
    | 'SUCCESS'
    | 'PARTIAL_SUCCESS'
    | 'FAILURE'
    | 'PIVOT'
    | 'PAUSE'
    | 'BREAKTHROUGH';
const METRIC_TYPE_ICONS: Record<string, LucideIcon> = {
    INCREASE: TrendingUp,
    DECREASE: TrendingDown,
    TARGET: Target,
};

const EVENT_ICONS: Record<EventType, { icon: LucideIcon; label: string; cls: string }> = {
    SUCCESS: { icon: CheckCircle2, label: 'Успех', cls: 'event-success' },
    PARTIAL_SUCCESS: { icon: AlertCircle, label: 'Частично', cls: 'event-partial' },
    FAILURE: { icon: XCircle, label: 'Факап', cls: 'event-failure' },
    PIVOT: { icon: RefreshCw, label: 'Пивот', cls: 'event-pivot' },
    PAUSE: { icon: Pause, label: 'Пауза', cls: 'event-pause' },
    BREAKTHROUGH: { icon: Rocket, label: 'Прорыв', cls: 'event-breakthrough' },
};

export default function SprintDetailPage({
    sprintId,
    sprintName,
    onBack,
}: SprintDetailPageProps) {
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [tab, setTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getSprint(sprintId);
            setSprint(data as Sprint);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [sprintId]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    if (loading) {
        return <div className="sprint-detail-loading">Загрузка...</div>;
    }

    if (!sprint) {
        return <div className="sprint-detail-error">{error || 'Not found'}</div>;
    }

    const metrics = (sprint as Sprint & { metrics?: SprintMetric[] }).metrics ?? [];
    const events = (sprint as Sprint & { events?: SprintEvent[] }).events ?? [];
    const increments = (sprint as Sprint & { increments?: Increment[] }).increments ?? [];

    return (
        <div className="sprint-detail">
            <button className="sprint-detail-back" onClick={onBack}>
                <ArrowLeft size={16} />
                Назад к спринтам
            </button>

            <h1 className="sprint-detail-title">
                <span className="sprint-detail-title-icon">
                    <Target size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Спринт #{sprint.number} · {sprint.name}
            </h1>

            {sprint.goal && (
                <div className="sprint-detail-goal">
                    <Target size={16} />
                    {sprint.goal}
                </div>
            )}

            <div className="sprint-detail-dates">
                <Calendar size={14} />
                {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
            </div>

            {error && <div className="sprint-detail-error">{error}</div>}

            {/* Табы */}
            <div className="sprint-detail-tabs">
                <button
                    className={`sprint-detail-tab ${tab === 'overview' ? 'sprint-detail-tab-active' : ''}`}
                    onClick={() => setTab('overview')}
                >
                    Обзор
                </button>
                <button
                    className={`sprint-detail-tab ${tab === 'tasks' ? 'sprint-detail-tab-active' : ''}`}
                    onClick={() => setTab('tasks')}
                >
                    Задачи
                </button>
                <button
                    className={`sprint-detail-tab ${tab === 'metrics' ? 'sprint-detail-tab-active' : ''}`}
                    onClick={() => setTab('metrics')}
                >
                    Метрики ({metrics.length})
                </button>
                <button
                    className={`sprint-detail-tab ${tab === 'increments' ? 'sprint-detail-tab-active' : ''}`}
                    onClick={() => setTab('increments')}
                >
                    Инкременты ({increments.length})
                </button>
                <button
                    className={`sprint-detail-tab ${tab === 'events' ? 'sprint-detail-tab-active' : ''}`}
                    onClick={() => setTab('events')}
                >
                    События ({events.length})
                </button>
            </div>

            {/* Контент */}
            {tab === 'overview' && (
                <SprintOverview sprint={sprint} metrics={metrics} />
            )}
            {tab === 'tasks' && (
                <SprintTasksTab
                    sprintId={sprintId}
                    projectId={sprint.projectId}
                    onReload={load}
                />
            )}
            {tab === 'metrics' && (
                <MetricsTab sprintId={sprintId} metrics={metrics} onReload={load} />
            )}

            {tab === 'increments' && (
                <IncrementsTab sprintId={sprintId} increments={increments} onReload={load} />
            )}

            {tab === 'events' && (
                <EventsTab sprintId={sprintId} events={events} onReload={load} />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════

function SprintOverview({
    sprint,
    metrics,
}: {
    sprint: Sprint;
    metrics: SprintMetric[];
}) {
    const achieved = metrics.filter((m) => m.isAchieved).length;
    const total = metrics.length;
    const progress = total === 0 ? 0 : Math.round((achieved / total) * 100);

    return (
        <div className="sprint-overview">
            <div className="sprint-overview-stats">
                <div className="sprint-stat">
                    <div className="sprint-stat-value">{metrics.length}</div>
                    <div className="sprint-stat-label">Метрик</div>
                </div>
                <div className="sprint-stat">
                    <div className="sprint-stat-value">
                        {achieved} / {total}
                    </div>
                    <div className="sprint-stat-label">Достигнуто</div>
                </div>
                <div className="sprint-stat">
                    <div className="sprint-stat-value">{progress}%</div>
                    <div className="sprint-stat-label">Прогресс</div>
                </div>
            </div>

            {metrics.length > 0 && (
                <div className="sprint-overview-metrics">
                    <h3 className="sprint-overview-title">Метрики успеха</h3>
                    {metrics.map((m) => {
                        const Icon = METRIC_TYPE_ICONS[m.metricType] ?? Target;
                        return (
                            <div key={m.id} className="sprint-overview-metric">
                                <Icon size={14} />
                                <span className="sprint-overview-metric-label">{m.label}</span>
                                <span className="sprint-overview-metric-target">
                                    Цель: {m.targetValue}
                                    {m.unit}
                                </span>
                                {m.actualValue !== null && m.actualValue !== undefined && (
                                    <span
                                        className={`sprint-overview-metric-actual ${m.isAchieved ? 'sprint-metric-success' : 'sprint-metric-fail'}`}
                                    >
                                        Факт: {m.actualValue}
                                        {m.unit}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════════════════════

function MetricsTab({
    sprintId,
    metrics,
    onReload,
}: {
    sprintId: string;
    metrics: SprintMetric[];
    onReload: () => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [key, setKey] = useState('');
    const [label, setLabel] = useState('');
    const [metricType, setMetricType] = useState<'INCREASE' | 'DECREASE' | 'TARGET'>('INCREASE');
    const [targetValue, setTargetValue] = useState('');
    const [actualValue, setActualValue] = useState('');
    const [unit, setUnit] = useState('%');
    const [xpReward, setXpReward] = useState('100');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!key.trim() || !label.trim() || !targetValue) return;
        setSaving(true);
        try {
            await api.createMetric(sprintId, {
                key: key.trim(),
                label: label.trim(),
                metricType,
                targetValue: Number(targetValue),
                actualValue: actualValue ? Number(actualValue) : undefined,
                unit: unit || undefined,
                xpReward: Number(xpReward) || 0,
            });
            setKey('');
            setLabel('');
            setTargetValue('');
            setActualValue('');
            setShowForm(false);
            onReload();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить метрику?')) return;
        await api.deleteMetric(sprintId, id);
        onReload();
    };

    return (
        <div className="metrics-tab">
            {!showForm && (
                <div className="metrics-actions">
                    <Button onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '10px 20px' }}>
                        <Plus size={16} /> Добавить метрику
                    </Button>
                </div>
            )}

            {showForm && (
                <div className="metrics-form">
                    <h3 className="metrics-form-title">Новая метрика</h3>

                    <Input label="Ключ (латиница)" value={key} onChange={(e) => setKey(e.target.value)} placeholder="leads" />
                    <Input label="Название" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Количество лидов" />

                    <div className="metrics-form-row">
                        <div className="metrics-form-field">
                            <label className="metrics-form-label">Тип</label>
                            <select className="metrics-form-select" value={metricType} onChange={(e) => setMetricType(e.target.value as any)}>
                                <option value="INCREASE">Увеличить</option>
                                <option value="DECREASE">Уменьшить</option>
                                <option value="TARGET">Достичь</option>
                            </select>
                        </div>

                        <Input label="Цель" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
                        <Input label="Факт" type="number" value={actualValue} onChange={(e) => setActualValue(e.target.value)} />
                        <Input label="Ед." value={unit} onChange={(e) => setUnit(e.target.value)} />
                        <Input label="XP" type="number" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                    </div>

                    <div className="metrics-form-actions">
                        <Button onClick={handleCreate} loading={saving}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">Отмена</Button>
                    </div>
                </div>
            )}

            {metrics.length === 0 ? (
                <div className="metrics-empty">Пока нет метрик</div>
            ) : (
                <div className="metrics-list">
                    {metrics.map((m) => {
                        const Icon = METRIC_TYPE_ICONS[m.metricType] ?? Target;
                        return (
                            <div key={m.id} className={`metric-item ${m.isAchieved ? 'metric-item-achieved' : ''}`}>
                                <Icon size={16} />
                                <div className="metric-item-content">
                                    <div className="metric-item-label">{m.label}</div>
                                    <div className="metric-item-key">{m.key}</div>
                                </div>
                                <div className="metric-item-values">
                                    <span className="metric-item-target">Цель: {m.targetValue}{m.unit}</span>
                                    {m.actualValue !== null && m.actualValue !== undefined && (
                                        <span className={`metric-item-actual ${m.isAchieved ? 'sprint-metric-success' : 'sprint-metric-fail'}`}>
                                            Факт: {m.actualValue}{m.unit}
                                        </span>
                                    )}
                                    {m.xpReward > 0 && <span className="metric-item-xp">+{m.xpReward} XP</span>}
                                </div>
                                <button className="metric-item-delete" onClick={() => handleDelete(m.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// INCREMENTS
// ═══════════════════════════════════════════════════════════════

function IncrementsTab({
    sprintId,
    increments,
    onReload,
}: {
    sprintId: string;
    increments: Increment[];
    onReload: () => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🎯');
    const [xp, setXp] = useState('100');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await api.createIncrement(sprintId, {
                name: name.trim(),
                description: description.trim() || undefined,
                icon: icon || undefined,
                xp: Number(xp) || 0,
            });
            setName('');
            setDescription('');
            setIcon('🎯');
            setXp('100');
            setShowForm(false);
            onReload();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить инкремент?')) return;
        await api.deleteIncrement(id);
        onReload();
    };

    return (
        <div className="increments-tab">
            {!showForm && (
                <div className="increments-actions">
                    <Button onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '10px 20px' }}>
                        <Plus size={16} /> Добавить инкремент
                    </Button>
                </div>
            )}

            {showForm && (
                <div className="increments-form">
                    <h3 className="increments-form-title">Новый инкремент</h3>
                    <Input label="Иконка" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎨" />
                    <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Новый дизайн лендинга" />
                    <Input label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Что сделали" />
                    <Input label="XP" type="number" value={xp} onChange={(e) => setXp(e.target.value)} />
                    <div className="increments-form-actions">
                        <Button onClick={handleCreate} loading={saving}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">Отмена</Button>
                    </div>
                </div>
            )}

            {increments.length === 0 ? (
                <div className="increments-empty">Пока нет инкрементов</div>
            ) : (
                <div className="increments-list">
                    {increments.map((inc) => (
                        <div key={inc.id} className="increment-item">
                            <span className="increment-icon">{inc.icon ?? '🎯'}</span>
                            <div className="increment-content">
                                <div className="increment-name">{inc.name}</div>
                                {inc.description && <div className="increment-desc">{inc.description}</div>}
                            </div>
                            {inc.xp > 0 && <div className="increment-xp">+{inc.xp} XP</div>}
                            <button className="increment-delete" onClick={() => handleDelete(inc.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

function EventsTab({
    sprintId,
    events,
    onReload,
}: {
    sprintId: string;
    events: SprintEvent[];
    onReload: () => void;
}) {
    const [showForm, setShowForm] = useState(false);


    const [type, setType] = useState<EventType>('SUCCESS');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [xp, setXp] = useState('0');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            await api.createSprintEvent(sprintId, {
                type,
                title: title.trim(),
                body: body.trim() || undefined,
                xp: Number(xp) || 0,
            });
            setTitle('');
            setBody('');
            setXp('0');
            setShowForm(false);
            onReload();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить событие?')) return;
        await api.deleteSprintEvent(sprintId, id);
        onReload();
    };

    return (
        <div className="events-tab">
            {!showForm && (
                <div className="events-actions">
                    <Button onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '10px 20px' }}>
                        <Plus size={16} /> Добавить событие
                    </Button>
                </div>
            )}

            {showForm && (
                <div className="events-form">
                    <h3 className="events-form-title">Новое событие</h3>

                    <div className="events-form-field">
                        <label className="events-form-label">Тип</label>
                        <select className="events-form-select" value={type} onChange={(e) => setType(e.target.value as EventType)}>
                            {Object.entries(EVENT_ICONS).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что произошло" />
                    <Input label="Описание" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Подробности" />
                    <Input label="XP" type="number" value={xp} onChange={(e) => setXp(e.target.value)} />

                    <div className="events-form-actions">
                        <Button onClick={handleCreate} loading={saving}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">Отмена</Button>
                    </div>
                </div>
            )}

            {events.length === 0 ? (
                <div className="events-empty">Пока нет событий</div>
            ) : (
                <div className="events-list">
                    {events.map((ev) => {
                        const meta = EVENT_ICONS[ev.type] ?? EVENT_ICONS.SUCCESS;
                        const Icon = meta.icon;
                        return (
                            <div key={ev.id} className={`event-item ${meta.cls}`}>
                                <Icon size={16} />
                                <div className="event-content">
                                    <div className="event-header">
                                        <span className="event-label">{meta.label}</span>
                                        <span className="event-title">{ev.title}</span>
                                    </div>
                                    {ev.body && <div className="event-body">{ev.body}</div>}
                                    {ev.createdBy && (
                                        <div className="event-meta">
                                            {ev.createdBy.name ?? ev.createdBy.email} · {new Date(ev.createdAt).toLocaleString('ru-RU')}
                                        </div>
                                    )}
                                </div>
                                {ev.xp > 0 && <div className="event-xp">+{ev.xp} XP</div>}
                                <button className="event-delete" onClick={() => handleDelete(ev.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TASKS TAB
// ═══════════════════════════════════════════════════════════════

function SprintTasksTab({
    sprintId,
    projectId,
    onReload,
}: {
    sprintId: string;
    projectId: string;
    onReload: () => void;
}) {
    const [tasks, setTasks] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await api.getSprintRecords(sprintId);
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [sprintId]);

    const handleRemoveFromSprint = async (recordId: string) => {
        if (!confirm('Убрать задачу из спринта?')) return;
        try {
            const record = await api.getRecord(recordId);
            await api.updateRecord(recordId, {
                ...record.data,
                sprintId: null,
            });
            await loadTasks();
            onReload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    const handleAdded = async () => {
        setShowPicker(false);
        await loadTasks();
        onReload();
    };

    if (loading) {
        return <div className="sprint-tasks-loading">Загрузка...</div>;
    }

    return (
        <div className="sprint-tasks-tab">
            {error && <div className="sprint-tasks-error">{error}</div>}

            <div className="sprint-tasks-actions">
                <Button
                    onClick={() => setShowPicker(true)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Добавить задачи
                </Button>
            </div>

            {tasks.length === 0 ? (
                <div className="sprint-tasks-empty">
                    Пока нет задач в этом спринте.
                    <br />
                    Нажми «Добавить задачи», чтобы выбрать из бэклога.
                </div>
            ) : (
                <div className="sprint-tasks-list">
                    {tasks.map((task) => {
                        const status = String(task.data.status ?? '');
                        const priority = String(task.data.priority ?? '');

                        return (
                            <div key={task.id} className="sprint-task-item">
                                <div className="sprint-task-status">
                                    {status === 'done' ? (
                                        <Check size={14} style={{ color: 'var(--success)' }} />
                                    ) : (
                                        <span className="sprint-task-status-dot" />
                                    )}
                                </div>

                                <div className="sprint-task-content">
                                    <div className="sprint-task-title">
                                        {String(task.data.title ?? 'Без названия')}
                                    </div>
                                    <div className="sprint-task-meta">
                                        <span className="sprint-task-tag">{status}</span>
                                        {priority && (
                                            <span className="sprint-task-tag">{priority}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="sprint-task-remove"
                                    onClick={() => handleRemoveFromSprint(task.id)}
                                    title="Убрать из спринта"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showPicker && (
                <SprintTaskPicker
                    sprintId={sprintId}
                    projectId={projectId}
                    onClose={() => setShowPicker(false)}
                    onAdded={handleAdded}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TASK PICKER (модалка добавления задач из бэклога)
// ═══════════════════════════════════════════════════════════════

function SprintTaskPicker({
    sprintId,
    projectId,
    onClose,
    onAdded,
}: {
    sprintId: string;
    projectId: string;
    onClose: () => void;
    onAdded: () => void;
}) {
    const [entities, setEntities] = useState<
        { id: string; name: string; label: string }[]
    >([]);
    const [activeEntityId, setActiveEntityId] = useState<string>('');
    const [tasks, setTasks] = useState<EntityRecord[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .getEntities(projectId)
            .then((data) => {
                setEntities(data);
                if (data.length > 0) setActiveEntityId(data[0].id);
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (!activeEntityId) return;

        setLoading(true);
        api
            .getRecords(activeEntityId, { page: 1, limit: 500 })
            .then((res) => {
                // показываем только задачи без спринта
                const backlog = res.records.filter(
                    (r) => !r.data.sprintId || r.data.sprintId === '',
                );
                setTasks(backlog);
            })
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load'),
            )
            .finally(() => setLoading(false));
    }, [activeEntityId]);

    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleAdd = async () => {
        if (selected.size === 0) return;
        setSaving(true);
        setError('');

        try {
            for (const id of selected) {
                const task = tasks.find((t) => t.id === id);
                if (!task) continue;

                await api.updateRecord(id, {
                    ...task.data,
                    sprintId,
                });
            }

            onAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sprint-picker-overlay" onClick={onClose}>
            <div className="sprint-picker" onClick={(e) => e.stopPropagation()}>
                <div className="sprint-picker-header">
                    <h3 className="sprint-picker-title">Добавить задачи в спринт</h3>
                    <button className="sprint-picker-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {entities.length > 1 && (
                    <div className="sprint-picker-entities">
                        {entities.map((e) => (
                            <button
                                key={e.id}
                                className={`sprint-picker-entity ${activeEntityId === e.id ? 'sprint-picker-entity-active' : ''}`}
                                onClick={() => {
                                    setActiveEntityId(e.id);
                                    setSelected(new Set());
                                }}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                )}

                {error && <div className="sprint-picker-error">{error}</div>}

                <div className="sprint-picker-body">
                    {loading ? (
                        <div className="sprint-picker-loading">Загрузка...</div>
                    ) : tasks.length === 0 ? (
                        <div className="sprint-picker-empty">
                            Нет задач в бэклоге для этой сущности
                        </div>
                    ) : (
                        <div className="sprint-picker-list">
                            {tasks.map((task) => {
                                const isSelected = selected.has(task.id);
                                return (
                                    <label
                                        key={task.id}
                                        className={`sprint-picker-item ${isSelected ? 'sprint-picker-item-selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggle(task.id)}
                                        />
                                        <div className="sprint-picker-item-content">
                                            <div className="sprint-picker-item-title">
                                                {String(task.data.title ?? 'Без названия')}
                                            </div>
                                            <div className="sprint-picker-item-meta">
                                                {String(task.data.status ?? '')}
                                                {task.data.priority ? ` · ${String(task.data.priority)}` : ''}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="sprint-picker-footer">
                    <Button onClick={handleAdd} loading={saving}>
                        Добавить выбранные ({selected.size})
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Отмена
                    </Button>
                </div>
            </div>
        </div>
    );
}