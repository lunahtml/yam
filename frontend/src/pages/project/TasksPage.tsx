//frontend/src/pages/project/TasksPage.tsx
import { useEffect, useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { Entity, EntityTemplate } from '../../types/api';
import EntityDetailPage from '../dashboard/entities/EntityDetailPage';
import './TasksPage.css';

interface TasksPageProps {
    projectId: string;
}

export default function TasksPage({ projectId }: TasksPageProps) {
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
                        {templates.map((t) => (
                            <button
                                key={t.key}
                                className="tasks-template-card"
                                onClick={() => handleCreateFromTemplate(t.key)}
                            >
                                <div className="tasks-template-icon">{t.icon}</div>
                                <div className="tasks-template-label">{t.label}</div>
                                <div className="tasks-template-desc">{t.description}</div>
                            </button>
                        ))}
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
                            <button
                                key={e.id}
                                className={`tasks-tab ${activeEntity?.id === e.id ? 'tasks-tab-active' : ''}`}
                                onClick={() => setActiveEntity(e)}
                            >
                                {e.label}
                            </button>
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