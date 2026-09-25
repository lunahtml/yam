//frontend/src/pages/project/SprintsPage.tsx
import { useEffect, useState } from 'react';
import { NavLink, useOutletContext } from 'react-router-dom';
import {
    Plus,
    Target,
    Calendar,
    CheckCircle2,
    Clock,
    Rocket,
    Sparkles,
    Layers,
} from 'lucide-react';
import { api } from '../../api/client';
import { Sprint, Epic } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SprintStatusButton from '../../components/SprintStatusButton';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './SprintsPage.css';

const STATUS_LABELS: Record<string, string> = {
    PLANNED: 'Запланирован',
    ACTIVE: 'Активен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
    PLANNED: 'sprint-status-planned',
    ACTIVE: 'sprint-status-active',
    COMPLETED: 'sprint-status-completed',
    CANCELLED: 'sprint-status-cancelled',
};

export default function SprintsPage() {
    const { projectId } = useOutletContext<ProjectContext>();
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [epics, setEpics] = useState<Epic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [epicId, setEpicId] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const [sprintsData, epicsData] = await Promise.all([
                api.getSprints(projectId),
                api.getEpics(projectId),
            ]);
            setSprints(sprintsData);
            setEpics(epicsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [projectId]);

    const handleCreate = async () => {
        if (!name.trim() || !startDate || !endDate) return;
        setSaving(true);
        setError('');

        try {
            await api.createSprint(projectId, {
                name: name.trim(),
                goal: goal.trim() || undefined,
                startDate,
                endDate,
                epicId: epicId || undefined,
            });
            setName('');
            setGoal('');
            setStartDate('');
            setEndDate('');
            setEpicId('');
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        sprintId: string,
        status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    ) => {
        setStatusUpdating(sprintId);
        setError('');
        try {
            await api.updateSprint(sprintId, { status });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setStatusUpdating(null);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    const getProgress = (sprint: Sprint) => {
        if (sprint.status !== 'ACTIVE') return 0;
        const now = Date.now();
        const start = new Date(sprint.startDate).getTime();
        const end = new Date(sprint.endDate).getTime();
        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };

    const getDaysLeft = (sprint: Sprint) => {
        const end = new Date(sprint.endDate).getTime();
        const now = Date.now();
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };

    const getDaysUntilStart = (sprint: Sprint) => {
        const start = new Date(sprint.startDate).getTime();
        const now = Date.now();
        return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="sprints-page">
            <div className="sprints-header">
                <h1 className="sprints-title">
                    <span className="sprints-title-icon">
                        <Target size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Спринты
                </h1>

                <Button
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Новый спринт
                </Button>
            </div>

            {error && <div className="sprints-error">{error}</div>}

            {showForm && (
                <div className="sprints-form">
                    <h3 className="sprints-form-title">Новый спринт</h3>

                    <Input
                        label="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Осенняя кампания"
                    />

                    <Input
                        label="Цель спринта"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="+30% лидов"
                    />

                    <div className="sprints-form-field">
                        <label className="sprints-form-label">Эпик (необязательно)</label>
                        <select
                            className="sprints-form-select"
                            value={epicId}
                            onChange={(e) => setEpicId(e.target.value)}
                        >
                            <option value="">— Без эпика —</option>
                            {epics.map((epic) => (
                                <option key={epic.id} value={epic.id}>
                                    {epic.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sprints-form-dates">
                        <Input
                            label="Начало"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            label="Конец"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="sprints-form-actions">
                        <Button onClick={handleCreate} loading={saving}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="sprints-loading">Загрузка...</div>
            ) : sprints.length === 0 ? (
                <div className="sprints-empty">
                    <Sparkles size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>Пока нет спринтов.</p>
                    <p className="sprints-empty-hint">
                        Создай первый спринт — обычно на 2 недели.
                    </p>
                </div>
            ) : (
                <div className="sprints-list">
                    {sprints.map((sprint) => {
                        const progress = getProgress(sprint);
                        const daysLeft = getDaysLeft(sprint);
                        const daysUntilStart = getDaysUntilStart(sprint);

                        return (
                            <div key={sprint.id} className="sprint-card-wrapper">
                                <NavLink
                                    to={`/projects/${projectId}/sprints/${sprint.id}`}
                                    className="sprint-card"
                                >
                                    <div className="sprint-card-header">
                                        <div className="sprint-card-number">
                                            Спринт #{sprint.number}
                                        </div>
                                        <div
                                            className={`sprint-card-status ${STATUS_COLORS[sprint.status]}`}
                                        >
                                            {STATUS_LABELS[sprint.status]}
                                        </div>
                                    </div>

                                    <div className="sprint-card-name">{sprint.name}</div>

                                    {sprint.epic && (
                                        <div className="sprint-card-epic">
                                            <Layers size={12} />
                                            {sprint.epic.name}
                                        </div>
                                    )}

                                    {sprint.goal && (
                                        <div className="sprint-card-goal">
                                            <Rocket size={12} />
                                            {sprint.goal}
                                        </div>
                                    )}

                                    <div className="sprint-card-dates">
                                        <Calendar size={12} />
                                        {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
                                        {sprint.status === 'ACTIVE' && daysLeft > 0 && (
                                            <span className="sprint-card-days">
                                                (осталось {daysLeft} дн.)
                                            </span>
                                        )}
                                        {sprint.status === 'PLANNED' && daysUntilStart > 0 && (
                                            <span className="sprint-card-days">
                                                (через {daysUntilStart} дн.)
                                            </span>
                                        )}
                                    </div>

                                    {sprint.status === 'ACTIVE' && (
                                        <div className="sprint-card-progress">
                                            <div className="sprint-card-progress-bar">
                                                <div
                                                    className="sprint-card-progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="sprint-card-progress-text">
                                                {progress}%
                                            </div>
                                        </div>
                                    )}

                                    {sprint._count && (
                                        <div className="sprint-card-counts">
                                            <span>
                                                <CheckCircle2 size={12} />
                                                {sprint._count.increments} инкрементов
                                            </span>
                                            <span>
                                                <Clock size={12} />
                                                {sprint._count.metrics} метрик
                                            </span>
                                        </div>
                                    )}
                                </NavLink>

                                <div className="sprint-card-actions">
                                    <SprintStatusButton
                                        status={sprint.status}
                                        onStatusChange={(status) =>
                                            handleStatusChange(sprint.id, status)
                                        }
                                        loading={statusUpdating === sprint.id}
                                        size="small"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}