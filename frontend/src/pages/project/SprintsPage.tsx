//frontend/src/pages/project/SprintsPage.tsx
import { useEffect, useState } from 'react';
import {
    Plus,
    Target,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Sprint } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './SprintsPage.css';

interface SprintsPageProps {
    projectId: string;
    onOpenSprint: (sprintId: string, sprintName: string) => void;
}

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

export default function SprintsPage({
    projectId,
    onOpenSprint,
}: SprintsPageProps) {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getSprints(projectId);
            setSprints(data);
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
            });
            setName('');
            setGoal('');
            setStartDate('');
            setEndDate('');
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
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
        const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return days;
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

                        return (
                            <button
                                key={sprint.id}
                                className="sprint-card"
                                onClick={() => onOpenSprint(sprint.id, sprint.name)}
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

                                {sprint.goal && (
                                    <div className="sprint-card-goal">
                                        🎯 {sprint.goal}
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
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}