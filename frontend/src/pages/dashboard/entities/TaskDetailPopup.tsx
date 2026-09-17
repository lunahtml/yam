//frontend/src/pages/dashboard/entities/TaskDetailPopup.tsx
import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { EntityRecord, Field } from '../../../types/api';
import './TaskDetailPopup.css';

interface TaskDetailPopupProps {
    record: EntityRecord;
    fields: Field[];
    onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
}

export default function TaskDetailPopup({
    record,
    fields,
    onSave,
    onClose,
}: TaskDetailPopupProps) {
    const [data, setData] = useState<Record<string, unknown>>(record.data);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const update = (name: string, value: unknown) => {
        setData({ ...data, [name]: value });
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            await onSave(record.id, data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field: Field) => {
        const value = data[field.name];

        switch (field.type) {
            case 'text':
                if (field.name === 'description') {
                    return (
                        <textarea
                            className="task-detail-textarea"
                            value={String(value ?? '')}
                            onChange={(e) => update(field.name, e.target.value)}
                            rows={4}
                        />
                    );
                }
                return (
                    <input
                        className="task-detail-input"
                        value={String(value ?? '')}
                        onChange={(e) => update(field.name, e.target.value)}
                    />
                );

            case 'number':
                return (
                    <input
                        className="task-detail-input"
                        type="number"
                        value={value === null || value === undefined ? '' : String(value)}
                        onChange={(e) =>
                            update(
                                field.name,
                                e.target.value === '' ? null : Number(e.target.value),
                            )
                        }
                    />
                );

            case 'date':
                return (
                    <input
                        className="task-detail-input"
                        type="date"
                        value={String(value ?? '')}
                        onChange={(e) => update(field.name, e.target.value)}
                    />
                );

            case 'boolean':
                return (
                    <label className="task-detail-checkbox">
                        <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => update(field.name, e.target.checked)}
                        />
                        Да
                    </label>
                );

            case 'select': {
                const choices =
                    field.options &&
                        typeof field.options === 'object' &&
                        'choices' in field.options
                        ? ((field.options as { choices: string[] }).choices ?? [])
                        : [];

                return (
                    <select
                        className="task-detail-select"
                        value={String(value ?? '')}
                        onChange={(e) => update(field.name, e.target.value)}
                    >
                        <option value="">— Не выбрано —</option>
                        {choices.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                );
            }

            case 'user':
                return (
                    <input
                        className="task-detail-input"
                        value={String(value ?? '')}
                        onChange={(e) => update(field.name, e.target.value)}
                        placeholder="ID пользователя"
                    />
                );

            default:
                return (
                    <input
                        className="task-detail-input"
                        value={String(value ?? '')}
                        onChange={(e) => update(field.name, e.target.value)}
                    />
                );
        }
    };

    return (
        <div className="task-detail-overlay" onClick={onClose}>
            <div className="task-detail" onClick={(e) => e.stopPropagation()}>
                <div className="task-detail-header">
                    <h3 className="task-detail-title">Карточка</h3>
                    <button className="task-detail-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {error && <div className="task-detail-error">{error}</div>}

                <div className="task-detail-body">
                    {fields.map((field) => (
                        <div key={field.id} className="task-detail-field">
                            <label className="task-detail-label">
                                {field.label}
                                {field.isRequired && (
                                    <span className="task-detail-required">*</span>
                                )}
                            </label>
                            {renderField(field)}
                        </div>
                    ))}
                </div>

                <div className="task-detail-footer">
                    <button
                        className="task-detail-btn task-detail-btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                        className="task-detail-btn task-detail-btn-secondary"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </div>

                <div className="task-detail-meta">
                    Создано: {new Date(record.createdAt).toLocaleString('ru-RU')}
                    {record.creator && ` · ${record.creator.name ?? record.creator.email}`}
                </div>
            </div>
        </div>
    );
}