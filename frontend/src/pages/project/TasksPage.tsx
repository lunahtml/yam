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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Entity, EntityTemplate } from '../../types/api';
import EntityDetailPage from '../../features/entities/EntityDetailPage';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './TasksPage.css';

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
    task: ListTodo,
    client: Users,
    lead: Target,
    order: Package,
    content: FileText,
};

export default function TasksPage() {
    const { projectId } = useOutletContext<ProjectContext>();
    const [entities, setEntities] = useState<Entity[]>([]);
    const [templates, setTemplates] = useState<EntityTemplate[]>([]);
    const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [error, setError] = useState('');

    const loadEntities = async () => {
        setLoading(true);
        try {
            const data = await api.getEntities(projectId);
            setEntities(data);
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
                        <EntityDetailPage
                            entityId={activeEntity.id}
                            entityLabel={activeEntity.label}
                        />
                    )}
                </>
            )}
        </div>
    );
}