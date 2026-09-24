//frontend/src/pages/project/EpicsPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Layers, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { Epic, EpicStatus } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './EpicsPage.css';

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

export default function EpicsPage() {
    const { projectId } = useOutletContext<ProjectContext>();
    const [epics, setEpics] = useState<Epic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getEpics(projectId);
            setEpics(data);
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
        if (!name.trim()) return;
        setSaving(true);
        setError('');

        try {
            await api.createEpic(projectId, {
                name: name.trim(),
                description: description.trim() || undefined,
                color: color.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setName('');
            setDescription('');
            setColor('');
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

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить эпик?')) return;
        try {
            await api.deleteEpic(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleStatusChange = async (id: string, status: EpicStatus) => {
        try {
            await api.updateEpic(id, { status });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    return (
        <div className="epics-page">
            <div className="epics-header">
                <h1 className="epics-title">
                    <span className="epics-title-icon">
                        <Layers size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Эпики
                </h1>

                <Button
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Новый эпик
                </Button>
            </div>

            {error && <div className="epics-error">{error}</div>}

            {showForm && (
                <div className="epics-form">
                    <h3 className="epics-form-title">Новый эпик</h3>

                    <Input
                        label="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Редизайн личного кабинета"
                    />

                    <Input
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Что входит в эпик"
                    />

                    <Input
                        label="Цвет"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="#a855f7"
                    />

                    <div className="epics-form-dates">
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

                    <div className="epics-form-actions">
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
                <div className="epics-loading">Загрузка...</div>
            ) : epics.length === 0 ? (
                <div className="epics-empty">
                    Пока нет эпиков. Создай первый — крупную инициативу.
                </div>
            ) : (
                <div className="epics-list">
                    {epics.map((epic) => (
                        <div
                            key={epic.id}
                            className="epic-card"
                            style={epic.color ? { borderLeftColor: epic.color } : undefined}
                        >
                            <div className="epic-card-header">
                                <div className="epic-card-name">{epic.name}</div>

                                <select
                                    className={`epic-card-status ${STATUS_COLORS[epic.status]}`}
                                    value={epic.status}
                                    onChange={(e) =>
                                        handleStatusChange(epic.id, e.target.value as EpicStatus)
                                    }
                                >
                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    className="epic-card-delete"
                                    onClick={() => handleDelete(epic.id)}
                                    title="Удалить"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {epic.description && (
                                <div className="epic-card-desc">{epic.description}</div>
                            )}

                            {(epic.startDate || epic.endDate) && (
                                <div className="epic-card-dates">
                                    <Calendar size={12} />
                                    {epic.startDate && formatDate(epic.startDate)}
                                    {epic.startDate && epic.endDate && ' — '}
                                    {epic.endDate && formatDate(epic.endDate)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}