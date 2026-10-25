//frontend/src/pages/project/WorkflowsPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, GitBranch, Trash2, Zap, X } from 'lucide-react';
import { api } from '../../api/client';
import { Entity, Workflow } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './WorkflowsPage.css';

export default function WorkflowsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [entities, setEntities] = useState<Entity[]>([]);
    const [workflowsByEntity, setWorkflowsByEntity] = useState<
        Record<string, Workflow[]>
    >({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Модалка создания
    const [showCreate, setShowCreate] = useState(false);
    const [createEntityId, setCreateEntityId] = useState('');
    const [createName, setCreateName] = useState('');
    const [createActive, setCreateActive] = useState(false);
    const [creating, setCreating] = useState(false);

    const load = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const entityList = await api.getEntities(projectId);
            setEntities(entityList);

            const map: Record<string, Workflow[]> = {};
            await Promise.all(
                entityList.map(async (e) => {
                    try {
                        const wf = await api.getWorkflowsByEntity(e.id);
                        map[e.id] = wf;
                    } catch {
                        map[e.id] = [];
                    }
                }),
            );
            setWorkflowsByEntity(map);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const openCreate = (entityId?: string) => {
        setCreateEntityId(entityId ?? entities[0]?.id ?? '');
        setCreateName('');
        setCreateActive(false);
        setShowCreate(true);
    };

    const handleCreate = async () => {
        if (!projectId || !createEntityId || !createName.trim()) return;
        setCreating(true);
        setError('');
        try {
            const created = await api.createWorkflow(projectId, createEntityId, {
                name: createName.trim(),
                isActive: createActive,
            });
            setShowCreate(false);
            navigate(`/projects/${projectId}/settings/workflows/${created.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (wf: Workflow) => {
        if (!confirm(`Удалить workflow «${wf.name}»? Все шаги и переходы будут потеряны.`)) return;
        try {
            await api.deleteWorkflow(wf.id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleToggleActive = async (wf: Workflow) => {
        try {
            await api.updateWorkflow(wf.id, { isActive: !wf.isActive });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    if (!projectId) return null;

    return (
        <div className="workflows-page">
            <button
                className="workflows-back"
                onClick={() => navigate(`/projects/${projectId}/settings`)}
            >
                <ArrowLeft size={16} />
                Назад к настройкам
            </button>

            <div className="workflows-header">
                <h1 className="workflows-title">
                    <span className="workflows-title-icon">
                        <GitBranch size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Workflow
                </h1>

                <Button
                    onClick={() => openCreate()}
                    style={{ width: 'auto', padding: '10px 20px' }}
                    disabled={entities.length === 0}
                >
                    <Plus size={16} />
                    Создать workflow
                </Button>
            </div>

            <div className="workflows-info">
                <p>
                    Workflow — это правила переходов между статусами задачи.
                    Если workflow активен для сущности, канбан будет разрешать
                    только указанные переходы. Если workflow нет — переходы свободные.
                </p>
            </div>

            {error && <div className="workflows-error">{error}</div>}

            {loading ? (
                <div className="workflows-loading">Загрузка...</div>
            ) : entities.length === 0 ? (
                <div className="workflows-empty">
                    Сначала создай сущность (например, «Задачи») в разделе «Задачи».
                </div>
            ) : (
                <div className="workflows-entities">
                    {entities.map((entity) => {
                        const wfs = workflowsByEntity[entity.id] ?? [];
                        return (
                            <div key={entity.id} className="workflows-entity-block">
                                <div className="workflows-entity-header">
                                    <div className="workflows-entity-name">
                                        {entity.label}
                                        <span className="workflows-entity-key">
                                            {entity.name}
                                        </span>
                                    </div>
                                    <button
                                        className="workflows-entity-add"
                                        onClick={() => openCreate(entity.id)}
                                    >
                                        <Plus size={14} />
                                        Добавить workflow
                                    </button>
                                </div>

                                {wfs.length === 0 ? (
                                    <div className="workflows-entity-empty">
                                        Нет workflow. Переходы свободные.
                                    </div>
                                ) : (
                                    <div className="workflows-list">
                                        {wfs.map((wf) => (
                                            <div key={wf.id} className="workflow-card">
                                                <button
                                                    className={`workflow-card-status ${wf.isActive ? 'workflow-card-status-active' : ''}`}
                                                    onClick={() => handleToggleActive(wf)}
                                                    title={wf.isActive ? 'Активен (переходы проверяются)' : 'Неактивен (переходы свободные)'}
                                                >
                                                    <Zap size={14} />
                                                    {wf.isActive ? 'Активен' : 'Выкл'}
                                                </button>

                                                <div
                                                    className="workflow-card-body"
                                                    onClick={() =>
                                                        navigate(
                                                            `/projects/${projectId}/settings/workflows/${wf.id}`,
                                                        )
                                                    }
                                                >
                                                    <div className="workflow-card-name">
                                                        {wf.name}
                                                    </div>
                                                    <div className="workflow-card-meta">
                                                        <GitBranch size={12} />
                                                        Шагов: {wf.steps?.length ?? 0}
                                                        {wf._count && (
                                                            <> · Переходов: {wf._count.transitions}</>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    className="workflow-card-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(wf);
                                                    }}
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <div
                    className="workflow-modal-overlay"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="workflow-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="workflow-modal-header">
                            <h2 className="workflow-modal-title">
                                Создать workflow
                            </h2>
                            <button
                                className="workflow-modal-close"
                                onClick={() => setShowCreate(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="workflow-modal-body">
                            <div className="workflow-modal-field">
                                <label className="workflow-modal-label">
                                    Сущность
                                </label>
                                <select
                                    className="workflow-modal-select"
                                    value={createEntityId}
                                    onChange={(e) =>
                                        setCreateEntityId(e.target.value)
                                    }
                                >
                                    {entities.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.label} ({e.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Название workflow"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder="Scrum"
                            />

                            <label className="workflow-modal-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createActive}
                                    onChange={(e) =>
                                        setCreateActive(e.target.checked)
                                    }
                                />
                                Сделать активным (канбан будет проверять переходы)
                            </label>
                        </div>

                        <div className="workflow-modal-footer">
                            <Button
                                onClick={handleCreate}
                                loading={creating}
                                disabled={!createName.trim() || !createEntityId}
                            >
                                <Plus size={16} />
                                Создать
                            </Button>
                            <Button
                                onClick={() => setShowCreate(false)}
                                variant="secondary"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}