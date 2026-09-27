//frontend/src/pages/project/EpicDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
    ArrowLeft,
    Layers,
    Calendar,
    Target,
    CheckCircle2,
    Clock,
    Rocket,
    Pencil,
    Save,
    X,
    Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { Epic, EpicStatus } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './EpicDetailPage.css';

const STATUS_LABELS: Record<EpicStatus, string> = {
    OPEN: 'Открыт',
    IN_PROGRESS: 'В работе',
    DONE: 'Завершён',
    CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<EpicStatus, string> = {
    OPEN: 'epic-status-open',
    IN_PROGRESS: 'epic-status-progress',
    DONE: 'epic-status-done',
    CANCELLED: 'epic-status-cancelled',
};

const SPRINT_STATUS_LABELS: Record<string, string> = {
    PLANNED: 'Запланирован',
    ACTIVE: 'Активен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};

export default function EpicDetailPage() {
    const { projectId, epicId } = useParams<{
        projectId: string;
        epicId: string;
    }>();
    const navigate = useNavigate();
    const [epic, setEpic] = useState<Epic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editStatus, setEditStatus] = useState<EpicStatus>('OPEN');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');

    const load = async () => {
        if (!epicId) return;
        setLoading(true);
        try {
            const data = await api.getEpic(epicId);
            setEpic(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [epicId]);

    const startEditing = () => {
        if (!epic) return;
        setEditName(epic.name);
        setEditDescription(epic.description ?? '');
        setEditColor(epic.color ?? '');
        setEditStatus(epic.status);
        setEditStartDate(epic.startDate ? epic.startDate.slice(0, 10) : '');
        setEditEndDate(epic.endDate ? epic.endDate.slice(0, 10) : '');
        setEditing(true);
    };

    const handleSave = async () => {
        if (!epic || !editName.trim()) return;
        setSaving(true);
        setError('');
        try {
            await api.updateEpic(epic.id, {
                name: editName.trim(),
                description: editDescription.trim() || undefined,
                color: editColor.trim() || undefined,
                status: editStatus,
                startDate: editStartDate || undefined,
                endDate: editEndDate || undefined,
            });
            setEditing(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!epic) return;
        if (!confirm('Удалить эпик? Спринты останутся, но потеряют связь.')) return;
        try {
            await api.deleteEpic(epic.id);
            navigate(`/projects/${projectId}/epics`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    if (loading) {
        return <div className="epic-detail-loading">Загрузка...</div>;
    }

    if (!epic) {
        return <div className="epic-detail-error">{error || 'Not found'}</div>;
    }

    const sprints = epic.sprints ?? [];
    const totalSprints = sprints.length;
    const completedSprints = sprints.filter(
        (s) => s.status === 'COMPLETED',
    ).length;
    const progress =
        totalSprints === 0
            ? 0
            : Math.round((completedSprints / totalSprints) * 100);

    return (
        <div className="epic-detail">
            <button className="epic-detail-back" onClick={() => navigate(`/projects/${projectId}/epics`)}>
                <ArrowLeft size={16} />
                Назад к эпикам
            </button>

            {!editing && (
                <>
                    <div className="epic-detail-header">
                        <h1
                            className="epic-detail-title"
                            style={
                                epic.color
                                    ? { borderLeftColor: epic.color, borderLeftWidth: 4, borderLeftStyle: 'solid', paddingLeft: 16 }
                                    : undefined
                            }
                        >
                            <span className="epic-detail-title-icon">
                                <Layers size={22} color="#fff" strokeWidth={2.5} />
                            </span>
                            {epic.name}
                        </h1>

                        <div className="epic-detail-header-actions">
                            <button
                                className="epic-detail-edit-btn"
                                onClick={startEditing}
                            >
                                <Pencil size={16} />
                                Редактировать
                            </button>
                            <Button
                                onClick={handleDelete}
                                variant="danger"
                                style={{ width: 'auto', padding: '10px 20px' }}
                            >
                                Удалить
                            </Button>
                        </div>
                    </div>

                    <div className="epic-detail-status-row">
                        <select
                            className={`epic-detail-status ${STATUS_COLORS[epic.status]}`}
                            value={epic.status}
                            onChange={async (e) => {
                                const status = e.target.value as EpicStatus;
                                try {
                                    await api.updateEpic(epic.id, { status });
                                    await load();
                                } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed');
                                }
                            }}
                        >
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {epic.description && (
                        <div className="epic-detail-desc">{epic.description}</div>
                    )}

                    {(epic.startDate || epic.endDate) && (
                        <div className="epic-detail-dates">
                            <Calendar size={14} />
                            {epic.startDate && formatDate(epic.startDate)}
                            {epic.startDate && epic.endDate && ' — '}
                            {epic.endDate && formatDate(epic.endDate)}
                        </div>
                    )}

                    <div className="epic-detail-progress">
                        <div className="epic-detail-progress-info">
                            <span>
                                Спринтов завершено:{' '}
                                <strong>
                                    {completedSprints} / {totalSprints}
                                </strong>
                            </span>
                            <span className="epic-detail-progress-percent">
                                {progress}%
                            </span>
                        </div>
                        <div className="epic-detail-progress-bar">
                            <div
                                className="epic-detail-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </>
            )}

            {editing && (
                <div className="epic-detail-edit-form">
                    <div className="epic-detail-edit-header">
                        <h2 className="epic-detail-edit-title">Редактирование эпика</h2>
                        <button
                            className="epic-detail-edit-close"
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
                        label="Описание"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                    />

                    <div className="epic-detail-edit-field">
                        <label className="epic-detail-edit-label">Статус</label>
                        <select
                            className="epic-detail-edit-select"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as EpicStatus)}
                        >
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Цвет (hex)"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        placeholder="#a855f7"
                    />

                    <div className="epic-detail-edit-dates">
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

                    <div className="epic-detail-edit-actions">
                        <Button onClick={handleSave} loading={saving}>
                            <Save size={16} /> Сохранить
                        </Button>
                        <Button onClick={() => setEditing(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {error && <div className="epic-detail-error">{error}</div>}

            {!editing && (
                <div className="epic-detail-sprints">
                    <h2 className="epic-detail-sprints-title">
                        <Rocket size={18} />
                        Спринты эпика ({sprints.length})
                    </h2>

                    {sprints.length === 0 ? (
                        <div className="epic-detail-sprints-empty">
                            Пока нет спринтов в этом эпике.
                            <br />
                            Создай спринт и привяжи его к эпику.
                        </div>
                    ) : (
                        <div className="epic-detail-sprints-list">
                            {sprints.map((sprint) => (
                                <NavLink
                                    key={sprint.id}
                                    to={`/projects/${projectId}/sprints/${sprint.id}`}
                                    className="epic-sprint-card"
                                >
                                    <div className="epic-sprint-header">
                                        <div className="epic-sprint-number">
                                            Спринт #{sprint.number}
                                        </div>
                                        <div className="epic-sprint-status">
                                            {SPRINT_STATUS_LABELS[sprint.status]}
                                        </div>
                                    </div>

                                    <div className="epic-sprint-name">{sprint.name}</div>

                                    {sprint.goal && (
                                        <div className="epic-sprint-goal">
                                            <Target size={12} />
                                            {sprint.goal}
                                        </div>
                                    )}

                                    <div className="epic-sprint-dates">
                                        <Calendar size={12} />
                                        {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
                                    </div>

                                    {sprint._count && (
                                        <div className="epic-sprint-counts">
                                            <span>
                                                <CheckCircle2 size={12} />
                                                {sprint._count.records ?? 0} задач
                                            </span>
                                            <span>
                                                <Clock size={12} />
                                                {sprint._count.metrics} метрик
                                            </span>
                                            <span>
                                                <Zap size={12} />
                                                {sprint._count.increments} инкрементов
                                            </span>
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}