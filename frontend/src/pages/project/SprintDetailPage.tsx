//frontend/src/pages/project/SprintDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
    ArrowLeft,
    Target,
    Calendar,
    Trash2,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Pause,
    Rocket,
    Plus,
    Check,
    Layers,
    Pencil,
    Save,
    X,
    Flag,
    MessageSquare,
    Users,
    Gauge,
    Award,
    Heart,
    Zap,
    // ArrowRightLeft,
    // Archive,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    EntityRecord,
    Sprint,
    SprintMetric,
    SprintEvent,
    Increment,
    Epic,
    SprintGoal,
    GoalStatus,
    SprintRetro,
    SprintRetroResponse,
} from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InfoPopup from '../../components/InfoPopup';
import SprintStatusButton from '../../components/SprintStatusButton';
import './SprintDetailPage.css';

type Tab = 'overview' | 'goals' | 'tasks' | 'metrics' | 'increments' | 'events' | 'retro';
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

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
    PENDING: 'В работе',
    ACHIEVED: 'Завершена',
    CARRIED_OVER: 'Перенесена',
    MOVED_BACKLOG: 'В бэклог',
    CANCELLED: 'Отменена',
};

const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
    PENDING: 'goal-status-pending',
    ACHIEVED: 'goal-status-achieved',
    CARRIED_OVER: 'goal-status-carried',
    MOVED_BACKLOG: 'goal-status-backlog',
    CANCELLED: 'goal-status-cancelled',
};

const RETRO_CRITERIA: { key: keyof RetroRatings; label: string; icon: LucideIcon }[] = [
    { key: 'goalAchievement', label: 'Достижение целей', icon: Target },
    { key: 'teamwork', label: 'Командная работа', icon: Users },
    { key: 'process', label: 'Процесс', icon: Gauge },
    { key: 'quality', label: 'Качество', icon: Award },
    { key: 'speed', label: 'Скорость', icon: Zap },
    { key: 'overall', label: 'Общая оценка', icon: Heart },
];

interface RetroRatings {
    goalAchievement: number;
    teamwork: number;
    process: number;
    quality: number;
    speed: number;
    overall: number;
}

export default function SprintDetailPage() {
    const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
    const navigate = useNavigate();
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [epics, setEpics] = useState<Epic[]>([]);
    const [goals, setGoals] = useState<SprintGoal[]>([]);
    const [tab, setTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editName, setEditName] = useState('');
    const [editGoal, setEditGoal] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editEpicId, setEditEpicId] = useState('');

    const load = async () => {
        if (!sprintId || !projectId) return;
        setLoading(true);
        try {
            const [sprintData, epicsData, goalsData] = await Promise.all([
                api.getSprint(sprintId),
                api.getEpics(projectId),
                api.getSprintGoals(sprintId),
            ]);
            setSprint(sprintData as Sprint);
            setEpics(epicsData);
            setGoals(goalsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [sprintId, projectId]);

    const handleStatusChange = async (
        status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    ) => {
        if (!sprint) return;
        setError('');
        try {
            await api.updateSprint(sprint.id, { status });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const startEditing = () => {
        if (!sprint) return;
        setEditName(sprint.name);
        setEditGoal(sprint.goal ?? '');
        setEditDescription(sprint.description ?? '');
        setEditStartDate(sprint.startDate.slice(0, 10));
        setEditEndDate(sprint.endDate.slice(0, 10));
        setEditEpicId(sprint.epicId ?? '');
        setEditing(true);
    };

    const handleSave = async () => {
        if (!sprint || !editName.trim()) return;
        setSaving(true);
        setError('');
        try {
            await api.updateSprint(sprint.id, {
                name: editName.trim(),
                goal: editGoal.trim() || undefined,
                description: editDescription.trim() || undefined,
                startDate: editStartDate,
                endDate: editEndDate,
                epicId: editEpicId || null,
            });
            setEditing(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

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
            <button className="sprint-detail-back" onClick={() => navigate('..')}>
                <ArrowLeft size={16} />
                Назад к спринтам
            </button>

            {!editing && (
                <>
                    <div className="sprint-detail-header">
                        <h1 className="sprint-detail-title">
                            <span className="sprint-detail-title-icon">
                                <Target size={22} color="#fff" strokeWidth={2.5} />
                            </span>
                            Спринт #{sprint.number} · {sprint.name}
                        </h1>

                        <div className="sprint-detail-header-actions">
                            <button
                                className="sprint-detail-edit-btn"
                                onClick={startEditing}
                                title="Редактировать"
                            >
                                <Pencil size={16} />
                                Редактировать
                            </button>

                            <SprintStatusButton
                                status={sprint.status}
                                onStatusChange={handleStatusChange}
                            />
                        </div>
                    </div>

                    {sprint.epic && (
                        <div className="sprint-detail-epic">
                            <Layers size={14} />
                            Эпик: <strong>{sprint.epic.name}</strong>
                        </div>
                    )}

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
                </>
            )}

            {editing && (
                <div className="sprint-detail-edit-form">
                    <div className="sprint-detail-edit-header">
                        <h2 className="sprint-detail-edit-title">Редактирование спринта</h2>
                        <button
                            className="sprint-detail-edit-close"
                            onClick={() => setEditing(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <Input
                        label="Название"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />

                    <Input
                        label="Цель спринта (сводная)"
                        value={editGoal}
                        onChange={(e) => setEditGoal(e.target.value)}
                        placeholder="+30% лидов"
                    />

                    <Input
                        label="Описание"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Что входит в спринт"
                    />

                    <div className="sprint-detail-edit-field">
                        <label className="sprint-detail-edit-label">Эпик</label>
                        <select
                            className="sprint-detail-edit-select"
                            value={editEpicId}
                            onChange={(e) => setEditEpicId(e.target.value)}
                        >
                            <option value="">— Без эпика —</option>
                            {epics.map((epic) => (
                                <option key={epic.id} value={epic.id}>
                                    {epic.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sprint-detail-edit-dates">
                        <Input
                            label="Начало"
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                        />
                        <Input
                            label="Конец"
                            type="date"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                        />
                    </div>

                    <div className="sprint-detail-edit-actions">
                        <Button onClick={handleSave} loading={saving}>
                            <Save size={16} /> Сохранить
                        </Button>
                        <Button onClick={() => setEditing(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {error && <div className="sprint-detail-error">{error}</div>}

            {!editing && (
                <>
                    <div className="sprint-detail-tabs">
                        <button
                            className={`sprint-detail-tab ${tab === 'overview' ? 'sprint-detail-tab-active' : ''}`}
                            onClick={() => setTab('overview')}
                        >
                            Обзор
                        </button>
                        <button
                            className={`sprint-detail-tab ${tab === 'goals' ? 'sprint-detail-tab-active' : ''}`}
                            onClick={() => setTab('goals')}
                        >
                            <Flag size={14} />
                            Цели ({goals.length})
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
                        <button
                            className={`sprint-detail-tab ${tab === 'retro' ? 'sprint-detail-tab-active' : ''}`}
                            onClick={() => setTab('retro')}
                        >
                            <MessageSquare size={14} />
                            Ретро
                        </button>
                    </div>

                    {tab === 'overview' && (
                        <SprintOverview
                            metrics={metrics}
                            goals={goals}
                        />
                    )}
                    {tab === 'goals' && (
                        <SprintGoalsTab
                            sprintId={sprintId!}
                            goals={goals}
                            sprintStatus={sprint.status}
                            onReload={load}
                        />
                    )}
                    {tab === 'tasks' && (
                        <SprintTasksTab
                            sprintId={sprintId!}
                            projectId={sprint.projectId}
                            onReload={load}
                        />
                    )}
                    {tab === 'metrics' && (
                        <MetricsTab sprintId={sprintId!} metrics={metrics} onReload={load} />
                    )}
                    {tab === 'increments' && (
                        <IncrementsTab sprintId={sprintId!} increments={increments} onReload={load} />
                    )}
                    {tab === 'events' && (
                        <EventsTab sprintId={sprintId!} events={events} onReload={load} />
                    )}
                    {tab === 'retro' && (
                        <SprintRetroTab
                            sprintId={sprintId!}
                            sprintStatus={sprint.status}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════

function SprintOverview({
    metrics,
    goals,
}: {
    metrics: SprintMetric[];
    goals: SprintGoal[];
}) {
    const achievedMetrics = metrics.filter((m) => m.isAchieved).length;
    const achievedGoals = goals.filter((g) => g.status === 'ACHIEVED').length;

    const metricsProgress =
        metrics.length === 0
            ? 0
            : Math.round((achievedMetrics / metrics.length) * 100);
    const goalsProgress =
        goals.length === 0
            ? 0
            : Math.round((achievedGoals / goals.length) * 100);

    return (
        <div className="sprint-overview">
            <div className="sprint-overview-stats">
                <div className="sprint-stat">
                    <div className="sprint-stat-value">
                        {achievedGoals} / {goals.length}
                    </div>
                    <div className="sprint-stat-label">
                        <Flag size={12} />
                        Целей достигнуто
                    </div>
                </div>
                <div className="sprint-stat">
                    <div className="sprint-stat-value">
                        {achievedMetrics} / {metrics.length}
                    </div>
                    <div className="sprint-stat-label">
                        <Target size={12} />
                        Метрик достигнуто
                    </div>
                </div>
                <div className="sprint-stat">
                    <div className="sprint-stat-value">
                        {Math.round((metricsProgress + goalsProgress) / 2)}%
                    </div>
                    <div className="sprint-stat-label">Общий прогресс</div>
                </div>
            </div>

            {goals.length > 0 && (
                <div className="sprint-overview-metrics">
                    <h3 className="sprint-overview-title">
                        <Flag size={16} />
                        Цели спринта
                    </h3>
                    {goals.map((g) => (
                        <div key={g.id} className="sprint-overview-metric">
                            <span
                                className={`goal-status-chip ${GOAL_STATUS_COLORS[g.status]}`}
                            >
                                {GOAL_STATUS_LABELS[g.status]}
                            </span>
                            <span className="sprint-overview-metric-label">{g.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {metrics.length > 0 && (
                <div className="sprint-overview-metrics">
                    <h3 className="sprint-overview-title">
                        <Target size={16} />
                        Метрики успеха
                    </h3>
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
// GOALS
// ═══════════════════════════════════════════════════════════════

function SprintGoalsTab({
    sprintId,
    goals,
    sprintStatus,
    onReload,
}: {
    sprintId: string;
    goals: SprintGoal[];
    sprintStatus: string;
    onReload: () => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isLocked =
        sprintStatus === 'COMPLETED' || sprintStatus === 'CANCELLED';

    const handleCreate = async () => {
        if (!text.trim()) return;
        setSaving(true);
        setError('');
        try {
            await api.createSprintGoal(sprintId, {
                text: text.trim(),
                description: description.trim() || undefined,
            });
            setText('');
            setDescription('');
            setShowForm(false);
            onReload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить цель?')) return;
        try {
            await api.deleteSprintGoal(id);
            onReload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const achieved = goals.filter((g) => g.status === 'ACHIEVED').length;
    const total = goals.length;
    const progress = total === 0 ? 0 : Math.round((achieved / total) * 100);

    return (
        <div className="goals-tab">
            <div className="goals-header">
                <div className="goals-header-info">
                    <div className="goals-header-title">
                        <Flag size={18} />
                        Цели спринта
                        <InfoPopup title="Что такое цели спринта?">
                            <p>
                                <strong>Цель</strong> — это конкретный результат, который
                                команда обещает достичь за спринт. Цель отличается от задачи
                                (это действие) и от метрики (это измерение).
                            </p>
                            <p>
                                В конце спринта команда оценивает каждую цель:
                            </p>
                            <ul>
                                <li>
                                    <strong>Завершена</strong> — цель достигнута.
                                </li>
                                <li>
                                    <strong>Перенести</strong> — цель остаётся актуальной, идёт
                                    в следующий спринт.
                                </li>
                                <li>
                                    <strong>В бэклог</strong> — цель вернётся, но не в ближайший
                                    спринт.
                                </li>
                                <li>
                                    <strong>Отменить</strong> — цель больше не актуальна.
                                </li>
                            </ul>
                        </InfoPopup>
                    </div>

                    {total > 0 && (
                        <div className="goals-progress-info">
                            Достигнуто: <strong>{achieved} / {total}</strong> ({progress}%)
                        </div>
                    )}
                </div>

                {!isLocked && !showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        <Plus size={16} /> Добавить цель
                    </Button>
                )}
            </div>

            {error && <div className="goals-error">{error}</div>}

            {total > 0 && (
                <div className="goals-progress-bar">
                    <div
                        className="goals-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {showForm && (
                <div className="goals-form">
                    <h3 className="goals-form-title">Новая цель</h3>

                    <Input
                        label="Цель"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Запустить новую воронку продаж"
                    />

                    <Input
                        label="Описание (опционально)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Что входит в цель"
                    />

                    <div className="goals-form-actions">
                        <Button
                            onClick={handleCreate}
                            loading={saving}
                            disabled={!text.trim()}
                        >
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {total === 0 ? (
                <div className="goals-empty">
                    <Flag size={40} />
                    <p>Пока нет целей. Добавь первую — без целей спринт не имеет смысла.</p>
                </div>
            ) : (
                <div className="goals-list">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className={`goal-item ${GOAL_STATUS_COLORS[goal.status]}`}
                        >
                            <div className="goal-item-main">
                                <Flag size={16} />
                                <div className="goal-item-content">
                                    <div className="goal-item-text">{goal.text}</div>
                                    {goal.description && (
                                        <div className="goal-item-desc">
                                            {goal.description}
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`goal-status-chip ${GOAL_STATUS_COLORS[goal.status]}`}
                                >
                                    {GOAL_STATUS_LABELS[goal.status]}
                                </span>
                                {!isLocked && (
                                    <button
                                        className="goal-item-delete"
                                        onClick={() => handleDelete(goal.id)}
                                        title="Удалить"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// RETRO
// ═══════════════════════════════════════════════════════════════

function SprintRetroTab({
    sprintId,
    sprintStatus,
}: {
    sprintId: string;
    sprintStatus: string;
}) {
    const [retros, setRetros] = useState<SprintRetroResponse | null>(null);
    const [myRetro, setMyRetro] = useState<SprintRetro | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [ratings, setRatings] = useState<RetroRatings>({
        goalAchievement: 5,
        teamwork: 5,
        process: 5,
        quality: 5,
        speed: 5,
        overall: 5,
    });
    const [wellDone, setWellDone] = useState('');
    const [improvements, setImprovements] = useState('');
    const [notes, setNotes] = useState('');

    const canVote = sprintStatus === 'ACTIVE' || sprintStatus === 'COMPLETED';

    const load = async () => {
        setLoading(true);
        try {
            const [all, mine] = await Promise.all([
                api.getSprintRetros(sprintId),
                api.getMySprintRetro(sprintId),
            ]);
            setRetros(all);
            setMyRetro(mine);

            if (mine) {
                setRatings({
                    goalAchievement: mine.goalAchievement ?? 5,
                    teamwork: mine.teamwork ?? 5,
                    process: mine.process ?? 5,
                    quality: mine.quality ?? 5,
                    speed: mine.speed ?? 5,
                    overall: mine.overall ?? 5,
                });
                setWellDone(mine.wellDone ?? '');
                setImprovements(mine.improvements ?? '');
                setNotes(mine.notes ?? '');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [sprintId]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.upsertSprintRetro(sprintId, {
                ...ratings,
                wellDone: wellDone.trim() || undefined,
                improvements: improvements.trim() || undefined,
                notes: notes.trim() || undefined,
            });
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="retro-loading">Загрузка...</div>;
    }

    return (
        <div className="retro-tab">
            <div className="retro-header">
                <div className="retro-header-title">
                    <MessageSquare size={18} />
                    Ретроспектива спринта
                    <InfoPopup title="Что такое ретроспектива?">
                        <p>
                            <strong>Ретроспектива</strong> — это обратная связь команды
                            по итогам спринта. Каждый участник оценивает спринт по шести
                            критериям (от 1 до 10) и пишет, что было хорошо, что можно
                            улучшить.
                        </p>
                        <p>
                            Цель — не найти виноватых, а понять, что работает, а что
                            стоит изменить в следующем спринте.
                        </p>
                        <ul>
                            <li>
                                <strong>Достижение целей</strong> — насколько цели
                                спринта реализованы.
                            </li>
                            <li>
                                <strong>Командная работа</strong> — насколько слаженно
                                работали вместе.
                            </li>
                            <li>
                                <strong>Процесс</strong> — насколько удобно было
                                работать (инструменты, ритуалы).
                            </li>
                            <li>
                                <strong>Качество</strong> — насколько качественно
                                получился результат.
                            </li>
                            <li>
                                <strong>Скорость</strong> — насколько быстро двигались.
                            </li>
                            <li>
                                <strong>Общая оценка</strong> — итоговое ощущение от
                                спринта.
                            </li>
                        </ul>
                    </InfoPopup>
                </div>

                {canVote && !showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        <MessageSquare size={16} />
                        {myRetro ? 'Изменить оценку' : 'Оценить спринт'}
                    </Button>
                )}
            </div>

            {error && <div className="retro-error">{error}</div>}

            {!canVote && (
                <div className="retro-locked">
                    Ретроспектива доступна только для активного или завершённого спринта.
                </div>
            )}

            {showForm && (
                <div className="retro-form">
                    <h3 className="retro-form-title">Оценка спринта</h3>

                    {RETRO_CRITERIA.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="retro-criterion">
                            <div className="retro-criterion-header">
                                <Icon size={16} />
                                <span className="retro-criterion-label">{label}</span>
                                <span className="retro-criterion-value">
                                    {ratings[key]} / 10
                                </span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={ratings[key]}
                                onChange={(e) =>
                                    setRatings({
                                        ...ratings,
                                        [key]: Number(e.target.value),
                                    })
                                }
                                className="retro-slider"
                            />
                        </div>
                    ))}

                    <Input
                        label="Что было хорошо"
                        value={wellDone}
                        onChange={(e) => setWellDone(e.target.value)}
                        placeholder="Что сработало"
                    />

                    <Input
                        label="Что улучшить"
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                        placeholder="Что стоит поменять"
                    />

                    <Input
                        label="Прочее (опционально)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <div className="retro-form-actions">
                        <Button onClick={handleSave} loading={saving}>
                            <Save size={16} /> Сохранить оценку
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {retros && retros.count > 0 && (
                <>
                    <div className="retro-averages">
                        <h3 className="retro-section-title">
                            Средние оценки команды ({retros.count})
                        </h3>
                        <div className="retro-averages-grid">
                            {RETRO_CRITERIA.map(({ key, label, icon: Icon }) => (
                                <div key={key} className="retro-average-item">
                                    <Icon size={16} />
                                    <div className="retro-average-label">{label}</div>
                                    <div className="retro-average-value">
                                        {retros.averages[key].toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="retro-list-section">
                        <h3 className="retro-section-title">Оценки участников</h3>
                        <div className="retro-list">
                            {retros.retros.map((r) => (
                                <div key={r.id} className="retro-item">
                                    <div className="retro-item-header">
                                        <div className="retro-item-avatar">
                                            {r.user?.name?.[0]?.toUpperCase() ??
                                                r.user?.email?.[0]?.toUpperCase() ??
                                                '?'}
                                        </div>
                                        <div className="retro-item-user">
                                            {r.user?.name ?? r.user?.email ?? 'Участник'}
                                        </div>
                                        {r.overall !== null && (
                                            <div className="retro-item-overall">
                                                <Heart size={14} />
                                                {r.overall} / 10
                                            </div>
                                        )}
                                    </div>

                                    {r.wellDone && (
                                        <div className="retro-item-block retro-item-well">
                                            <CheckCircle2 size={14} />
                                            <span>{r.wellDone}</span>
                                        </div>
                                    )}
                                    {r.improvements && (
                                        <div className="retro-item-block retro-item-improve">
                                            <AlertCircle size={14} />
                                            <span>{r.improvements}</span>
                                        </div>
                                    )}
                                    {r.notes && (
                                        <div className="retro-item-block retro-item-notes">
                                            {r.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {(!retros || retros.count === 0) && !showForm && canVote && (
                <div className="retro-empty">
                    <MessageSquare size={40} />
                    <p>Пока никто не оценил спринт. Будь первым.</p>
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
    const [recalculating, setRecalculating] = useState(false);
    const [recalcMessage, setRecalcMessage] = useState('');

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

    const handleRecalculate = async () => {
        setRecalculating(true);
        setRecalcMessage('');
        try {
            const result = await api.recalculateMetrics(sprintId);

            if (result.dashboardId) {
                setRecalcMessage(
                    `Обновлено из дашборда: ${result.updated}, пропущено: ${result.skipped}`,
                );
            } else if (result.recalculated !== undefined) {
                setRecalcMessage(
                    `Дашборд не найден. Пересчитано: ${result.recalculated}`,
                );
            } else {
                setRecalcMessage(
                    `Дашборд не найден за период спринта. Метрики: ${result.skipped}`,
                );
            }

            onReload();
        } catch (err) {
            setRecalcMessage(
                err instanceof Error ? err.message : 'Failed to recalculate',
            );
        } finally {
            setRecalculating(false);
        }
    };

    const achieved = metrics.filter((m) => m.isAchieved).length;
    const total = metrics.length;
    const progress = total === 0 ? 0 : Math.round((achieved / total) * 100);

    return (
        <div className="metrics-tab">
            <div className="metrics-header">
                <div className="metrics-progress">
                    <div className="metrics-progress-info">
                        <span className="metrics-progress-label">
                            Достигнуто: <strong>{achieved} / {total}</strong>
                        </span>
                        <span className="metrics-progress-percent">{progress}%</span>
                    </div>
                    <div className="metrics-progress-bar">
                        <div
                            className="metrics-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Button
                    onClick={handleRecalculate}
                    loading={recalculating}
                    variant="secondary"
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <RefreshCw size={16} />
                    Пересчитать
                </Button>
            </div>

            {recalcMessage && (
                <div className="metrics-recalc-message">{recalcMessage}</div>
            )}

            {!showForm && (
                <div className="metrics-actions">
                    <Button
                        onClick={() => setShowForm(true)}
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        <Plus size={16} /> Добавить метрику
                    </Button>
                </div>
            )}

            {showForm && (
                <div className="metrics-form">
                    <h3 className="metrics-form-title">Новая метрика</h3>

                    <Input
                        label="Ключ (латиница)"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="leads"
                    />
                    <Input
                        label="Название"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Количество лидов"
                    />

                    <div className="metrics-form-row">
                        <div className="metrics-form-field">
                            <label className="metrics-form-label">Тип</label>
                            <select
                                className="metrics-form-select"
                                value={metricType}
                                onChange={(e) =>
                                    setMetricType(e.target.value as 'INCREASE' | 'DECREASE' | 'TARGET')
                                }
                            >
                                <option value="INCREASE">Увеличить</option>
                                <option value="DECREASE">Уменьшить</option>
                                <option value="TARGET">Достичь</option>
                            </select>
                        </div>

                        <Input
                            label="Цель"
                            type="number"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                        />
                        <Input
                            label="Факт"
                            type="number"
                            value={actualValue}
                            onChange={(e) => setActualValue(e.target.value)}
                        />
                        <Input
                            label="Ед."
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        />
                        <Input
                            label="XP"
                            type="number"
                            value={xpReward}
                            onChange={(e) => setXpReward(e.target.value)}
                        />
                    </div>

                    <div className="metrics-form-actions">
                        <Button
                            onClick={handleCreate}
                            loading={saving}
                            disabled={!key.trim() || !label.trim() || !targetValue}
                        >
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">
                            Отмена
                        </Button>
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
                            <div
                                key={m.id}
                                className={`metric-item ${m.isAchieved ? 'metric-item-achieved' : ''}`}
                            >
                                <Icon size={16} />
                                <div className="metric-item-content">
                                    <div className="metric-item-label">{m.label}</div>
                                    <div className="metric-item-key">{m.key}</div>
                                </div>
                                <div className="metric-item-values">
                                    <span className="metric-item-target">
                                        Цель: {m.targetValue}{m.unit}
                                    </span>
                                    {m.actualValue !== null && m.actualValue !== undefined && (
                                        <span
                                            className={`metric-item-actual ${m.isAchieved ? 'sprint-metric-success' : 'sprint-metric-fail'}`}
                                        >
                                            Факт: {m.actualValue}{m.unit}
                                        </span>
                                    )}
                                    {m.xpReward > 0 && (
                                        <span className="metric-item-xp">+{m.xpReward} XP</span>
                                    )}
                                </div>
                                <button
                                    className="metric-item-delete"
                                    onClick={() => handleDelete(m.id)}
                                >
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
            const { sprintId: _drop, ...cleanData } = record.data;
            await api.updateRecord(recordId, cleanData, null);
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
// TASK PICKER
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
                const backlog = res.records.filter((r) => !r.sprintId);
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

                const { sprintId: _drop, ...cleanData } = task.data;
                await api.updateRecord(id, cleanData, sprintId);
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