//frontend/src/pages/project/TransitionConditionsModal.tsx
import { useState } from 'react';
import { X, Plus, Trash2, Filter } from 'lucide-react';
import {
    TransitionCondition,
    TransitionConditionType,
    WorkflowTransition,
} from '../../types/api';
import { api } from '../../api/client';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './TransitionConditionsModal.css';

interface Props {
    workflowId: string;
    transition: WorkflowTransition;
    fromName: string;
    toName: string;
    onClose: () => void;
    onSaved: () => void;
}

const TYPE_LABELS: Record<TransitionConditionType, string> = {
    checklist_done: 'Чеклист полностью выполнен',
    field_required: 'Поле обязательно',
    field_value: 'Поле равно значению',
};

export default function TransitionConditionsModal({
    workflowId,
    transition,
    fromName,
    toName,
    onClose,
    onSaved,
}: Props) {
    const [conditions, setConditions] = useState<TransitionCondition[]>(
        transition.conditions ?? [],
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [newType, setNewType] = useState<TransitionConditionType>('checklist_done');
    const [newField, setNewField] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newType === 'field_required' && !newField.trim()) return;
        if (newType === 'field_value' && (!newField.trim() || !newValue.trim())) return;

        const cond: TransitionCondition = { type: newType };
        if (newType !== 'checklist_done') cond.field = newField.trim();
        if (newType === 'field_value') {
            if (newValue === 'true') cond.value = true;
            else if (newValue === 'false') cond.value = false;
            else if (!isNaN(Number(newValue)) && newValue.trim() !== '')
                cond.value = Number(newValue);
            else cond.value = newValue;
        }

        setConditions([...conditions, cond]);
        setNewField('');
        setNewValue('');
        setNewType('checklist_done');
    };

    const handleRemove = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.updateWorkflowTransition(workflowId, transition.id, {
                conditions,
            });
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="wf-cond-modal-overlay" onClick={onClose}>
            <div className="wf-cond-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wf-cond-modal-header">
                    <h2 className="wf-cond-modal-title">
                        <Filter size={20} />
                        Условия перехода
                    </h2>
                    <button className="wf-cond-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="wf-cond-modal-subtitle">
                    {fromName} → {toName}
                </div>

                <div className="wf-cond-modal-body">
                    {error && <div className="wf-cond-modal-error">{error}</div>}

                    {conditions.length === 0 ? (
                        <div className="wf-cond-modal-empty">
                            Условий нет. Переход разрешён всегда.
                        </div>
                    ) : (
                        <div className="wf-cond-list">
                            {conditions.map((c, i) => (
                                <div key={i} className="wf-cond-item">
                                    <div className="wf-cond-item-main">
                                        <div className="wf-cond-item-type">
                                            {TYPE_LABELS[c.type]}
                                        </div>
                                        {c.field && (
                                            <div className="wf-cond-item-detail">
                                                Поле: <strong>{c.field}</strong>
                                                {c.value !== undefined && (
                                                    <> = <strong>{String(c.value)}</strong></>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="wf-cond-item-delete"
                                        onClick={() => handleRemove(i)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="wf-cond-form">
                        <div className="wf-cond-form-title">Добавить условие</div>

                        <div className="wf-cond-form-field">
                            <label className="wf-cond-form-label">Тип</label>
                            <select
                                className="wf-cond-form-select"
                                value={newType}
                                onChange={(e) =>
                                    setNewType(e.target.value as TransitionConditionType)
                                }
                            >
                                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>

                        {newType !== 'checklist_done' && (
                            <Input
                                label="Поле"
                                value={newField}
                                onChange={(e) => setNewField(e.target.value)}
                                placeholder="assignee / review_passed"
                            />
                        )}

                        {newType === 'field_value' && (
                            <Input
                                label="Значение"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="true / 10 / done"
                            />
                        )}

                        <Button
                            onClick={handleAdd}
                            style={{ width: 'auto', padding: '8px 16px' }}
                        >
                            <Plus size={14} />
                            Добавить
                        </Button>
                    </div>
                </div>

                <div className="wf-cond-modal-footer">
                    <Button onClick={handleSave} loading={saving}>
                        Сохранить
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Отмена
                    </Button>
                </div>
            </div>
        </div>
    );
}