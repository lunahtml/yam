//frontend/src/pages/project/TasksPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ListTodo,
    Plus,
    Trash2,
    Users,
    Target,
    Package,
    FileText,
    Zap,
    Layers,
    Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Entity, EntityTemplate, Sprint } from '../../types/api';
import EntityDetailPage from '../../features/entities/EntityDetailPage';
import SprintStatusButton from '../../components/SprintStatusButton';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './TasksPage.css';

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
    task: ListTodo,
    client: Users,
    lead: Target,
    order: Package,
    content: FileText,
};

const STATUS_LABELS: Record<string, string> = {
    PLANNED: 'Запланирован',
    ACTIVE: 'Активен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};

type SprintFilter = 'backlog' | 'all' | string;

export default function TasksPage() {
    const { projectId } = useOutletContext<ProjectContext>();
    const [entities, setEntities] = useState<Entity[]>([]);
    const [templates, setTemplates] = useState<EntityTemplate[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
    const [sprintFilter, setSprintFilter] = useState<SprintFilter>('all');
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [error, setError] = useState('');

    const loadEntities = async () => {
        setLoading(true);
        try {
            const [data, sprintsData] = await Promise.all([
                api.getEntities(projectId),
                api.getSprints(projectId),
            ]);
            setEntities(data);
            setSprints(sprintsData);
            if (data.length > 0 && !activeEntity) {
                setActiveEntity(data[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntities();
        api.getEntityTemplates().then(setTemplates).catch(() => { });
    }, [projectId]);

    const handleCreateFromTemplate = async (key: string) => {
        setError('');
        try {
            const entity = await api.createEntityFromTemplate(projectId, key);
            setShowTemplates(false);
            await loadEntities();
            setActiveEntity(entity as Entity);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        }
    };

    const handleDeleteEntity = async (id: string) => {
        if (
            !confirm(
                'Удалить сущность? Все её записи, поля и представления будут потеряны.',
            )
        )
            return;

        setError('');

        try {
            await api.deleteEntity(id);
            setActiveEntity(null);
            await loadEntities();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleStatusChange = async (
        sprintId: string,
        status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    ) => {
        setError('');
        try {
            await api.updateSprint(sprintId, { status });
            await loadEntities();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    const activeSprint =
        sprintFilter !== 'all' && sprintFilter !== 'backlog'
            ? sprints.find((s) => s.id === sprintFilter) ?? null
            : null;

    return (
        <div className="tasks-page">
            <div className="tasks-header">
                <h1 className="tasks-title">
                    <span className="tasks-title-icon">
                        <ListTodo size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Задачи
                </h1>

                <button
                    className="tasks-create-btn"
                    onClick={() => setShowTemplates(true)}
                >
                    <Plus size={16} />
                    Создать сущность
                </button>
            </div>

            {error && <div className="tasks-error">{error}</div>}

            {showTemplates && (
                <div className="tasks-templates">
                    <div className="tasks-templates-header">
                        <h3>Выбери шаблон</h3>
                        <button
                            className="tasks-templates-close"
                            onClick={() => setShowTemplates(false)}
                        >
                            Отмена
                        </button>
                    </div>

                    <div className="tasks-templates-grid">
                        {templates.map((t) => {
                            const Icon = TEMPLATE_ICONS[t.key] ?? ListTodo;
                            return (
                                <button
                                    key={t.key}
                                    className="tasks-template-card"
                                    onClick={() => handleCreateFromTemplate(t.key)}
                                >
                                    <div className="tasks-template-icon">
                                        <Icon size={28} />
                                    </div>
                                    <div className="tasks-template-label">{t.label}</div>
                                    <div className="tasks-template-desc">{t.description}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="tasks-loading">Загрузка...</div>
            ) : entities.length === 0 ? (
                <div className="tasks-empty">
                    Нет сущностей. Создай «Задачи» из шаблона.
                </div>
            ) : (
                <>
                    <div className="tasks-tabs">
                        {entities.map((e) => (
                            <div key={e.id} className="tasks-tab-wrapper">
                                <button
                                    className={`tasks-tab ${activeEntity?.id === e.id ? 'tasks-tab-active' : ''}`}
                                    onClick={() => setActiveEntity(e)}
                                >
                                    {e.label}
                                </button>
                                <button
                                    className="tasks-tab-delete"
                                    onClick={() => handleDeleteEntity(e.id)}
                                    title="Удалить сущность"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {activeEntity && (
                        <>
                            <div className="tasks-sprint-bar">
                                <div className="tasks-sprint-filter">
                                    <label className="tasks-sprint-label">
                                        <Zap size={14} />
                                        Показать:
                                    </label>
                                    <select
                                        className="tasks-sprint-select"
                                        value={sprintFilter}
                                        onChange={(e) => setSprintFilter(e.target.value)}
                                    >
                                        <option value="all">Все задачи</option>
                                        <option value="backlog">Только бэклог</option>
                                        {sprints.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                Спринт #{s.number} · {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {activeSprint && (
                                    <SprintStatusButton
                                        status={activeSprint.status}
                                        onStatusChange={(status) =>
                                            handleStatusChange(activeSprint.id, status)
                                        }
                                        size="small"
                                    />
                                )}
                            </div>

                            {activeSprint && (
                                <div className="tasks-sprint-header">
                                    <div className="tasks-sprint-header-title">
                                        <Layers size={16} />
                                        <strong>Спринт #{activeSprint.number}</strong>
                                        <span className="tasks-sprint-header-name">
                                            {activeSprint.name}
                                        </span>
                                        <span className="tasks-sprint-header-status">
                                            {STATUS_LABELS[activeSprint.status]}
                                        </span>
                                    </div>

                                    {activeSprint.goal && (
                                        <div className="tasks-sprint-header-goal">
                                            <Target size={14} />
                                            {activeSprint.goal}
                                        </div>
                                    )}

                                    <div className="tasks-sprint-header-dates">
                                        <Calendar size={12} />
                                        {formatDate(activeSprint.startDate)} — {formatDate(activeSprint.endDate)}
                                        {activeSprint.epic && (
                                            <>
                                                <span className="tasks-sprint-header-sep">·</span>
                                                <Layers size={12} />
                                                {activeSprint.epic.name}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <EntityDetailPage
                                entityId={activeEntity.id}
                                entityLabel={activeEntity.label}
                                sprintFilter={
                                    sprintFilter === 'all'
                                        ? undefined
                                        : sprintFilter === 'backlog'
                                            ? null
                                            : sprintFilter
                                }
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}