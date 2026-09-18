//frontend/src/pages/dashboard/entities/TaskDetailPopup.tsx
import { useState } from 'react';
import { X, Save, Plus, Check, Trash2, XCircle } from 'lucide-react';
import { EntityRecord, Field } from '../../../types/api';
import './TaskDetailPopup.css';

interface TaskDetailPopupProps {
    record: EntityRecord;
    fields: Field[];
    onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
}

interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
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
                            placeholder="Описание задачи..."
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

            case 'user-list':
                return (
                    <UserListEditor
                        value={Array.isArray(value) ? (value as string[]) : []}
                        onChange={(v) => update(field.name, v)}
                    />
                );

            case 'tags':
                return (
                    <TagsEditor
                        value={Array.isArray(value) ? (value as string[]) : []}
                        onChange={(v) => update(field.name, v)}
                    />
                );

            case 'checklist':
                return (
                    <ChecklistEditor
                        value={Array.isArray(value) ? (value as ChecklistItem[]) : []}
                        onChange={(v) => update(field.name, v)}
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

// ═══════════════════════════════════════════════════════════════
// USER LIST EDITOR
// ═══════════════════════════════════════════════════════════════

function UserListEditor({
    value,
    onChange,
}: {
    value: string[];
    onChange: (v: string[]) => void;
}) {
    const [input, setInput] = useState('');

    const add = () => {
        if (!input.trim() || value.includes(input.trim())) return;
        onChange([...value, input.trim()]);
        setInput('');
    };

    const remove = (id: string) => {
        onChange(value.filter((v) => v !== id));
    };

    return (
        <div className="task-editor">
            <div className="task-editor-input-row">
                <input
                    className="task-detail-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ID пользователя"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button className="task-editor-add" onClick={add} type="button">
                    <Plus size={14} />
                </button>
            </div>

            {value.length > 0 && (
                <div className="task-editor-chips">
                    {value.map((id) => (
                        <span key={id} className="task-editor-chip">
                            👤 {id.slice(0, 8)}...
                            <button
                                className="task-editor-chip-remove"
                                onClick={() => remove(id)}
                                type="button"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAGS EDITOR
// ═══════════════════════════════════════════════════════════════

function TagsEditor({
    value,
    onChange,
}: {
    value: string[];
    onChange: (v: string[]) => void;
}) {
    const [input, setInput] = useState('');

    const add = () => {
        const tag = input.trim().toLowerCase();
        if (!tag || value.includes(tag)) return;
        onChange([...value, tag]);
        setInput('');
    };

    const remove = (tag: string) => {
        onChange(value.filter((v) => v !== tag));
    };

    return (
        <div className="task-editor">
            <div className="task-editor-input-row">
                <input
                    className="task-detail-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Новый тег"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button className="task-editor-add" onClick={add} type="button">
                    <Plus size={14} />
                </button>
            </div>

            {value.length > 0 && (
                <div className="task-editor-chips">
                    {value.map((tag) => (
                        <span key={tag} className="task-editor-chip task-editor-chip-tag">
                            #{tag}
                            <button
                                className="task-editor-chip-remove"
                                onClick={() => remove(tag)}
                                type="button"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CHECKLIST EDITOR
// ═══════════════════════════════════════════════════════════════

function ChecklistEditor({
    value,
    onChange,
}: {
    value: ChecklistItem[];
    onChange: (v: ChecklistItem[]) => void;
}) {
    const [input, setInput] = useState('');
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState('');

    const add = () => {
        if (!input.trim()) return;
        onChange([
            ...value,
            {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                text: input.trim(),
                done: false,
            },
        ]);
        setInput('');
    };

    const addBulk = () => {
        const lines = bulkText
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        if (lines.length === 0) return;

        const newItems = lines.map((text, i) => ({
            id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
            text,
            done: false,
        }));

        onChange([...value, ...newItems]);
        setBulkText('');
        setBulkMode(false);
    };

    const toggle = (id: string) => {
        onChange(
            value.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item,
            ),
        );
    };

    const remove = (id: string) => {
        onChange(value.filter((item) => item.id !== id));
    };

    const doneCount = value.filter((v) => v.done).length;
    const total = value.length;
    const progress = total === 0 ? 0 : (doneCount / total) * 100;

    return (
        <div className="checklist">
            {/* Прогресс */}
            {total > 0 && (
                <div className="checklist-progress">
                    <div className="checklist-progress-bar">
                        <div
                            className="checklist-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="checklist-progress-text">
                        {doneCount} / {total}
                    </div>
                </div>
            )}

            {/* Пункты */}
            {value.length > 0 && (
                <div className="checklist-items">
                    {value.map((item) => (
                        <div
                            key={item.id}
                            className={`checklist-item ${item.done ? 'checklist-item-done' : ''}`}
                        >
                            <button
                                className="checklist-item-check"
                                onClick={() => toggle(item.id)}
                                type="button"
                            >
                                {item.done ? (
                                    <Check size={12} />
                                ) : (
                                    <span className="checklist-item-check-empty" />
                                )}
                            </button>
                            <span className="checklist-item-text">{item.text}</span>
                            <button
                                className="checklist-item-remove"
                                onClick={() => remove(item.id)}
                                type="button"
                            >
                                <XCircle size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Добавление */}
            {!bulkMode ? (
                <div className="task-editor-input-row">
                    <input
                        className="task-detail-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Новый пункт (Enter)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                add();
                            }
                        }}
                    />
                    <button className="task-editor-add" onClick={add} type="button">
                        <Plus size={14} />
                    </button>
                    <button
                        className="checklist-bulk-toggle"
                        onClick={() => setBulkMode(true)}
                        type="button"
                        title="Вставить списком"
                    >
                        📋
                    </button>
                </div>
            ) : (
                <div className="checklist-bulk">
                    <textarea
                        className="task-detail-textarea"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="Вставь список — каждая строка = отдельный пункт"
                        rows={5}
                        autoFocus
                    />
                    <div className="checklist-bulk-actions">
                        <button
                            className="task-detail-btn task-detail-btn-primary"
                            onClick={addBulk}
                            type="button"
                        >
                            Добавить
                        </button>
                        <button
                            className="task-detail-btn task-detail-btn-secondary"
                            onClick={() => {
                                setBulkMode(false);
                                setBulkText('');
                            }}
                            type="button"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}