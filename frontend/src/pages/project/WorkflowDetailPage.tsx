//frontend/src/pages/project/WorkflowDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    GitBranch,
    Check,
    X,
    Zap,
    ArrowRight,
    Pencil,
    Filter,
} from 'lucide-react';
import { api } from '../../api/client';
import { Workflow, WorkflowTransition } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import TransitionConditionsModal from './TransitionConditionsModal';
import './WorkflowDetailPage.css';

const STEP_COLORS = [
    '#8b7ba8',
    '#22d3ee',
    '#a3e635',
    '#f59e0b',
    '#a855f7',
    '#22c55e',
    '#ef4444',
];

export default function WorkflowDetailPage() {
    const { projectId, workflowId } = useParams<{
        projectId: string;
        workflowId: string;
    }>();
    const navigate = useNavigate();

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Редактирование шага
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [editStepName, setEditStepName] = useState('');
    const [editStepColor, setEditStepColor] = useState('');

    // Новая шаг-форма
    const [showStepForm, setShowStepForm] = useState(false);
    const [stepName, setStepName] = useState('');
    const [stepColor, setStepColor] = useState(STEP_COLORS[0]);
    const [stepOrder, setStepOrder] = useState(0);

    // Переходы
    const [fromStepId, setFromStepId] = useState('');
    const [toStepId, setToStepId] = useState('');
    const [addingTransition, setAddingTransition] = useState(false);

    // Переименование workflow
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    // Модалка условий перехода
    const [conditionsTransition, setConditionsTransition] =
        useState<WorkflowTransition | null>(null);
    const load = async () => {
        if (!workflowId) return;
        setLoading(true);
        try {
            const data = await api.getWorkflow(workflowId);
            setWorkflow(data);
            // Инициализируем order для новой шаг-формы
            const maxOrder = data.steps.reduce(
                (max, s) => Math.max(max, s.order),
                -1,
            );
            setStepOrder(maxOrder + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId]);

    const handleToggleActive = async () => {
        if (!workflow) return;
        try {
            await api.updateWorkflow(workflow.id, {
                isActive: !workflow.isActive,
            });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleSaveName = async () => {
        if (!workflow || !nameDraft.trim()) return;
        try {
            await api.updateWorkflow(workflow.id, { name: nameDraft.trim() });
            setEditingName(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to rename');
        }
    };

    // ═══ STEPS ═══

    const handleAddStep = async () => {
        if (!workflow || !stepName.trim()) return;
        try {
            await api.addWorkflowStep(workflow.id, {
                name: stepName.trim(),
                order: stepOrder,
                color: stepColor,
            });
            setStepName('');
            setShowStepForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add step');
        }
    };

    const handleStartEditStep = (id: string, name: string, color: string | null) => {
        setEditingStepId(id);
        setEditStepName(name);
        setEditStepColor(color ?? STEP_COLORS[0]);
    };

    const handleSaveStep = async (id: string) => {
        if (!workflow || !editStepName.trim()) return;
        try {
            await api.updateWorkflowStep(workflow.id, id, {
                name: editStepName.trim(),
                color: editStepColor,
            });
            setEditingStepId(null);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save step');
        }
    };

    const handleDeleteStep = async (id: string) => {
        if (!workflow) return;
        if (!confirm('Удалить шаг? Все переходы с ним тоже удалятся.')) return;
        try {
            await api.deleteWorkflowStep(workflow.id, id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete step');
        }
    };

    // ═══ TRANSITIONS ═══

    const handleAddTransition = async () => {
        if (!workflow || !fromStepId || !toStepId) return;
        if (fromStepId === toStepId) {
            setError('Нельзя создать переход из шага в него самого');
            return;
        }
        setAddingTransition(true);
        setError('');
        try {
            await api.addWorkflowTransition(workflow.id, {
                fromStepId,
                toStepId,
            });
            setFromStepId('');
            setToStepId('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add transition');
        } finally {
            setAddingTransition(false);
        }
    };

    const handleDeleteTransition = async (transitionId: string) => {
        if (!workflow) return;
        if (!confirm('Удалить переход?')) return;
        try {
            await api.deleteWorkflowTransition(workflow.id, transitionId);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete transition');
        }
    };

    if (loading) {
        return <div className="wf-detail-loading">Загрузка...</div>;
    }

    if (!workflow) {
        return (
            <div className="wf-detail-error">
                {error || 'Workflow не найден'}
            </div>
        );
    }

    const stepsById = new Map(workflow.steps.map((s) => [s.id, s]));

    return (
        <div className="wf-detail">
            <button
                className="wf-detail-back"
                onClick={() =>
                    navigate(`/projects/${projectId}/settings/workflows`)
                }
            >
                <ArrowLeft size={16} />
                Назад к списку
            </button>

            <div className="wf-detail-header">
                <div className="wf-detail-title-block">
                    <div className="wf-detail-title-icon">
                        <GitBranch size={22} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        {editingName ? (
                            <div className="wf-detail-name-edit">
                                <input
                                    className="wf-detail-name-input"
                                    value={nameDraft}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    className="wf-detail-name-save"
                                    onClick={handleSaveName}
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    className="wf-detail-name-cancel"
                                    onClick={() => setEditingName(false)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <h1
                                className="wf-detail-name"
                                onClick={() => {
                                    setNameDraft(workflow.name);
                                    setEditingName(true);
                                }}
                                title="Кликни, чтобы переименовать"
                            >
                                {workflow.name}
                                <Pencil size={14} className="wf-detail-name-pencil" />
                            </h1>
                        )}
                        <div className="wf-detail-subtitle">
                            {workflow.entity?.label ?? 'Сущность'} ·{' '}
                            {workflow.steps.length} шагов ·{' '}
                            {workflow.transitions.length} переходов
                        </div>
                    </div>
                </div>

                <button
                    className={`wf-detail-status ${workflow.isActive ? 'wf-detail-status-active' : ''}`}
                    onClick={handleToggleActive}
                    title={
                        workflow.isActive
                            ? 'Активен — канбан проверяет переходы'
                            : 'Выключен — переходы свободные'
                    }
                >
                    <Zap size={14} />
                    {workflow.isActive ? 'Активен' : 'Выключен'}
                </button>
            </div>

            {error && <div className="wf-detail-error">{error}</div>}

            {/* ═══ ШАГИ ═══ */}
            <div className="wf-detail-section">
                <div className="wf-detail-section-header">
                    <h2 className="wf-detail-section-title">Шаги</h2>
                    {!showStepForm && (
                        <Button
                            onClick={() => setShowStepForm(true)}
                            style={{ width: 'auto', padding: '8px 16px' }}
                        >
                            <Plus size={14} />
                            Добавить шаг
                        </Button>
                    )}
                </div>

                {workflow.steps.length === 0 && !showStepForm ? (
                    <div className="wf-detail-empty">
                        Пока нет шагов. Добавь первый — например, «todo».
                        <br />
                        <span className="wf-detail-empty-hint">
                            Имя шага должно совпадать со значением поля «Статус» в задаче.
                        </span>
                    </div>
                ) : (
                    <div className="wf-steps-list">
                        {workflow.steps.map((step) => {
                            const isEditing = editingStepId === step.id;
                            return (
                                <div key={step.id} className="wf-step-item">
                                    <div
                                        className="wf-step-color"
                                        style={{
                                            background: isEditing
                                                ? editStepColor
                                                : step.color ?? '#8b7ba8',
                                        }}
                                    />
                                    <span className="wf-step-order">
                                        #{step.order}
                                    </span>

                                    {isEditing ? (
                                        <>
                                            <input
                                                className="wf-step-input"
                                                value={editStepName}
                                                onChange={(e) =>
                                                    setEditStepName(e.target.value)
                                                }
                                                autoFocus
                                            />
                                            <div className="wf-step-colors">
                                                {STEP_COLORS.map((c) => (
                                                    <button
                                                        key={c}
                                                        className={`wf-step-color-btn ${editStepColor === c ? 'wf-step-color-btn-active' : ''}`}
                                                        style={{ background: c }}
                                                        onClick={() =>
                                                            setEditStepColor(c)
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                className="wf-step-save"
                                                onClick={() =>
                                                    handleSaveStep(step.id)
                                                }
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                className="wf-step-cancel"
                                                onClick={() =>
                                                    setEditingStepId(null)
                                                }
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="wf-step-name">
                                                {step.name}
                                            </span>
                                            <button
                                                className="wf-step-edit"
                                                onClick={() =>
                                                    handleStartEditStep(
                                                        step.id,
                                                        step.name,
                                                        step.color,
                                                    )
                                                }
                                                title="Редактировать"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                className="wf-step-delete"
                                                onClick={() =>
                                                    handleDeleteStep(step.id)
                                                }
                                                title="Удалить"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showStepForm && (
                    <div className="wf-step-form">
                        <div className="wf-step-form-row">
                            <Input
                                label="Имя шага"
                                value={stepName}
                                onChange={(e) => setStepName(e.target.value)}
                                placeholder="todo / in_progress / done"
                            />
                            <Input
                                label="Порядок"
                                type="number"
                                value={String(stepOrder)}
                                onChange={(e) =>
                                    setStepOrder(
                                        Math.max(0, Number(e.target.value) || 0),
                                    )
                                }
                            />
                        </div>
                        <div className="wf-step-form-colors">
                            <label className="wf-step-form-label">Цвет</label>
                            <div className="wf-step-colors">
                                {STEP_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`wf-step-color-btn ${stepColor === c ? 'wf-step-color-btn-active' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => setStepColor(c)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="wf-step-form-actions">
                            <Button
                                onClick={handleAddStep}
                                disabled={!stepName.trim()}
                            >
                                <Plus size={14} />
                                Добавить
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowStepForm(false);
                                    setStepName('');
                                }}
                                variant="secondary"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ ПЕРЕХОДЫ ═══ */}
            <div className="wf-detail-section">
                <div className="wf-detail-section-header">
                    <h2 className="wf-detail-section-title">Переходы</h2>
                </div>

                {workflow.steps.length < 2 ? (
                    <div className="wf-detail-empty">
                        Нужно минимум 2 шага, чтобы создать переход.
                    </div>
                ) : (
                    <>
                        <div className="wf-transition-add">
                            <select
                                className="wf-transition-select"
                                value={fromStepId}
                                onChange={(e) => setFromStepId(e.target.value)}
                            >
                                <option value="">— Из шага —</option>
                                {workflow.steps.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <ArrowRight size={16} className="wf-transition-arrow" />
                            <select
                                className="wf-transition-select"
                                value={toStepId}
                                onChange={(e) => setToStepId(e.target.value)}
                            >
                                <option value="">— В шаг —</option>
                                {workflow.steps.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={handleAddTransition}
                                loading={addingTransition}
                                disabled={!fromStepId || !toStepId}
                                style={{ width: 'auto' }}
                            >
                                <Plus size={14} />
                                Добавить
                            </Button>
                        </div>

                        {workflow.transitions.length === 0 ? (
                            <div className="wf-detail-empty">
                                Пока нет переходов. Добавь первый — например, «todo → in_progress».
                            </div>
                        ) : (
                            <div className="wf-transitions-list">
                                {workflow.transitions.map((t) => {
                                    const from = stepsById.get(t.fromStepId);
                                    const to = stepsById.get(t.toStepId);
                                    return (
                                        <div
                                            key={t.id}
                                            className="wf-transition-item"
                                        >
                                            <span
                                                className="wf-transition-step"
                                                style={{
                                                    borderColor:
                                                        from?.color ?? 'var(--border)',
                                                }}
                                            >
                                                {from?.name ?? '?'}
                                            </span>
                                            <ArrowRight
                                                size={14}
                                                className="wf-transition-arrow"
                                            />
                                            <span
                                                className="wf-transition-step"
                                                style={{
                                                    borderColor:
                                                        to?.color ?? 'var(--border)',
                                                }}
                                            >
                                                {to?.name ?? '?'}
                                            </span>
                                            <button
                                                className="wf-transition-conditions"
                                                onClick={() => setConditionsTransition(t)}
                                                title="Настроить условия"
                                            >
                                                <Filter size={14} />
                                                {t.conditions && t.conditions.length > 0 && (
                                                    <span className="wf-transition-conditions-count">
                                                        {t.conditions.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                className="wf-transition-delete"
                                                onClick={() =>
                                                    handleDeleteTransition(t.id)
                                                }
                                                title="Удалить"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="wf-detail-hint">
                <strong>Как это работает:</strong> если workflow активен, канбан
                будет разрешать только эти переходы. Если workflow выключен —
                переходы свободные.
            </div>
            {conditionsTransition && (() => {
                const from = stepsById.get(conditionsTransition.fromStepId);
                const to = stepsById.get(conditionsTransition.toStepId);
                return (
                    <TransitionConditionsModal
                        workflowId={workflow.id}
                        transition={conditionsTransition}
                        fromName={from?.name ?? '?'}
                        toName={to?.name ?? '?'}
                        onClose={() => setConditionsTransition(null)}
                        onSaved={async () => {
                            setConditionsTransition(null);
                            await load();
                        }}
                    />
                );
            })()}
        </div>
    );
}