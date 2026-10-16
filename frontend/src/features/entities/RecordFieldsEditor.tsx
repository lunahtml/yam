//frontend/src/features/entities/RecordFieldsEditor.tsx
import { useEffect, useState } from 'react';
import { X, Plus, Check, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Field, Tag, User } from '../../types/api';

export interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

interface RecordFieldsEditorProps {
    fields: Field[];
    data: Record<string, unknown>;
    onChange: (name: string, value: unknown) => void;
    organizationId: string;
    /** Режим только для чтения (просмотр) */
    readOnly?: boolean;
    /** Скрытые поля (например, sprintId) */
    hiddenFields?: string[];
}

export default function RecordFieldsEditor({
    fields,
    data,
    onChange,
    organizationId,
    readOnly = false,
    hiddenFields = ['sprintId', 'epicId'],
}: RecordFieldsEditorProps) {
    const visibleFields = fields.filter((f) => !hiddenFields.includes(f.name));

    return (
        <div className="record-fields-editor">
            {visibleFields.map((field) => (
                <div key={field.id} className="task-detail-field">
                    <label className="task-detail-label">
                        {field.label}
                        {field.isRequired && (
                            <span className="task-detail-required">*</span>
                        )}
                    </label>
                    <FieldRenderer
                        field={field}
                        value={data[field.name]}
                        onChange={(v) => onChange(field.name, v)}
                        organizationId={organizationId}
                        readOnly={readOnly}
                    />
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// FIELD RENDERER
// ═══════════════════════════════════════════════════════════════

function FieldRenderer({
    field,
    value,
    onChange,
    organizationId,
    readOnly,
}: {
    field: Field;
    value: unknown;
    onChange: (v: unknown) => void;
    organizationId: string;
    readOnly: boolean;
}) {
    // В режиме просмотра — простой текст
    if (readOnly) {
        return <div className="task-detail-readonly">{formatValue(value, field.type)}</div>;
    }

    switch (field.type) {
        case 'text':
            if (field.name === 'description') {
                return (
                    <textarea
                        className="task-detail-textarea"
                        value={String(value ?? '')}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        placeholder="Описание..."
                    />
                );
            }
            return (
                <input
                    className="task-detail-input"
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case 'number':
            return (
                <input
                    className="task-detail-input"
                    type="number"
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) =>
                        onChange(e.target.value === '' ? null : Number(e.target.value))
                    }
                />
            );

        case 'date':
            return (
                <input
                    className="task-detail-input"
                    type="date"
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case 'boolean':
            return (
                <label className="task-detail-checkbox">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => onChange(e.target.checked)}
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
                    onChange={(e) => onChange(e.target.value)}
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
                <UserPicker
                    value={value ? String(value) : null}
                    onChange={(v) => onChange(v)}
                />
            );

        case 'user-list':
            return (
                <UserListEditor
                    value={Array.isArray(value) ? (value as string[]) : []}
                    onChange={(v) => onChange(v)}
                />
            );

        case 'tags':
            if (!organizationId) {
                return <div className="task-detail-input">Загрузка тегов...</div>;
            }
            return (
                <TagsEditor
                    value={Array.isArray(value) ? (value as string[]) : []}
                    onChange={(v) => onChange(v)}
                    organizationId={organizationId}
                />
            );

        case 'checklist':
            return (
                <ChecklistEditor
                    value={Array.isArray(value) ? (value as ChecklistItem[]) : []}
                    onChange={(v) => onChange(v)}
                />
            );

        default:
            return (
                <input
                    className="task-detail-input"
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
    }
}

function formatValue(value: unknown, type: string): string {
    if (value === null || value === undefined || value === '') return '—';
    if (type === 'boolean') return value ? 'Да' : 'Нет';
    if (type === 'date') {
        try {
            return new Date(String(value)).toLocaleDateString('ru-RU');
        } catch {
            return String(value);
        }
    }
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

// ═══════════════════════════════════════════════════════════════
// TAGS EDITOR
// ═══════════════════════════════════════════════════════════════

function TagsEditor({
    value,
    onChange,
    organizationId,
}: {
    value: string[];
    onChange: (v: string[]) => void;
    organizationId: string;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (value.length === 0) {
            setSelectedTags([]);
            return;
        }
        api
            .getTags(organizationId)
            .then((allTags) => {
                setSelectedTags(allTags.filter((t) => value.includes(t.name)));
            })
            .catch(() => { });
    }, [value, organizationId]);

    useEffect(() => {
        if (!open || query.trim().length < 1) {
            setResults([]);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => {
            api
                .searchTags(organizationId, query.trim())
                .then((tags) => setResults(tags.filter((t) => !value.includes(t.name))))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [query, open, organizationId, value]);

    const handleSelect = (tag: Tag) => {
        onChange([...value, tag.name]);
        setSelectedTags([...selectedTags, tag]);
        setQuery('');
        setOpen(false);
    };

    const handleRemove = (tagName: string) => {
        onChange(value.filter((v) => v !== tagName));
        setSelectedTags(selectedTags.filter((t) => t.name !== tagName));
    };

    const handleCreateNew = async () => {
        if (!query.trim()) return;
        setCreating(true);
        try {
            const slug = query.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            const newTag = await api.createTag({
                organizationId,
                name: slug,
                label: query.trim(),
            });
            onChange([...value, newTag.name]);
            setSelectedTags([...selectedTags, newTag]);
            setQuery('');
            setOpen(false);
        } catch {
            const allTags = await api.getTags(organizationId);
            const existing = allTags.find(
                (t) => t.name === query.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
            );
            if (existing && !value.includes(existing.name)) {
                onChange([...value, existing.name]);
                setSelectedTags([...selectedTags, existing]);
            }
            setQuery('');
            setOpen(false);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="task-editor">
            {selectedTags.length > 0 && (
                <div className="task-editor-chips">
                    {selectedTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="task-editor-chip task-editor-chip-tag"
                            style={tag.color ? { borderColor: tag.color } : undefined}
                        >
                            {tag.icon ?? '#'}
                            {tag.label}
                            <button
                                className="task-editor-chip-remove"
                                onClick={() => handleRemove(tag.name)}
                                type="button"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="task-editor-input-row">
                <input
                    className="task-detail-input"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Найди тег..."
                />
            </div>

            {open && query.trim().length > 0 && (
                <div className="user-picker-dropdown">
                    {loading ? (
                        <div className="user-picker-loading">Поиск...</div>
                    ) : (
                        <>
                            {results.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className="user-picker-item"
                                    onClick={() => handleSelect(tag)}
                                >
                                    <div className="user-picker-item-info">
                                        <div className="user-picker-item-name">
                                            {tag.icon ?? '#'} {tag.label}
                                        </div>
                                        <div className="user-picker-item-email">
                                            #{tag.name}
                                            {tag.skill && ` · ${tag.skill.label}`}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {results.length === 0 && !loading && (
                                <button
                                    type="button"
                                    className="user-picker-item"
                                    onClick={handleCreateNew}
                                    disabled={creating}
                                >
                                    <div className="user-picker-item-info">
                                        <div className="user-picker-item-name">
                                            + Создать тег «{query.trim()}»
                                        </div>
                                        <div className="user-picker-item-email">
                                            Новый тег в реестре организации
                                        </div>
                                    </div>
                                </button>
                            )}
                        </>
                    )}
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

// ═══════════════════════════════════════════════════════════════
// USER PICKER
// ═══════════════════════════════════════════════════════════════

function UserPicker({
    value,
    onChange,
}: {
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [selected, setSelected] = useState<User | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!value) {
            setSelected(null);
            return;
        }
        api.getUser(value).then(setSelected).catch(() => setSelected(null));
    }, [value]);

    useEffect(() => {
        if (!open || query.trim().length < 1) {
            setResults([]);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => {
            api
                .searchUsers(query.trim(), 10)
                .then(setResults)
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [query, open]);

    const handleSelect = (user: User) => {
        onChange(user.id);
        setSelected(user);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setSelected(null);
        setQuery('');
    };

    if (selected) {
        return (
            <div className="user-picker">
                <div className="user-chip">
                    {selected.avatarUrl ? (
                        <img src={selected.avatarUrl} alt="" className="user-chip-avatar" />
                    ) : (
                        <div className="user-chip-avatar user-chip-avatar-placeholder">
                            {getInitials(selected.name ?? selected.email)}
                        </div>
                    )}
                    <div className="user-chip-info">
                        <div className="user-chip-name">
                            {selected.name ?? selected.email}
                        </div>
                        {selected.name && (
                            <div className="user-chip-email">{selected.email}</div>
                        )}
                    </div>
                    <button className="user-chip-remove" onClick={handleClear} type="button">
                        <X size={12} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-picker">
            <input
                className="task-detail-input"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Найди пользователя по имени или email..."
            />

            {open && query.trim().length > 0 && (
                <div className="user-picker-dropdown">
                    {loading ? (
                        <div className="user-picker-loading">Поиск...</div>
                    ) : results.length === 0 ? (
                        <div className="user-picker-empty">Никого не найдено</div>
                    ) : (
                        results.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                className="user-picker-item"
                                onClick={() => handleSelect(u)}
                            >
                                {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt="" className="user-chip-avatar" />
                                ) : (
                                    <div className="user-chip-avatar user-chip-avatar-placeholder">
                                        {getInitials(u.name ?? u.email)}
                                    </div>
                                )}
                                <div className="user-picker-item-info">
                                    <div className="user-picker-item-name">
                                        {u.name ?? u.email}
                                    </div>
                                    {u.name && (
                                        <div className="user-picker-item-email">{u.email}</div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
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
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value.length === 0) {
            setSelectedUsers([]);
            return;
        }
        Promise.all(value.map((id) => api.getUser(id).catch(() => null))).then(
            (users) => setSelectedUsers(users.filter((u): u is User => u !== null)),
        );
    }, [value]);

    useEffect(() => {
        if (!open || query.trim().length < 1) {
            setResults([]);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => {
            api
                .searchUsers(query.trim(), 10)
                .then((users) => setResults(users.filter((u) => !value.includes(u.id))))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [query, open, value]);

    const handleAdd = (user: User) => {
        onChange([...value, user.id]);
        setSelectedUsers([...selectedUsers, user]);
        setQuery('');
        setOpen(false);
    };

    const handleRemove = (id: string) => {
        onChange(value.filter((v) => v !== id));
        setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
    };

    return (
        <div className="user-picker">
            {selectedUsers.length > 0 && (
                <div className="user-chips">
                    {selectedUsers.map((u) => (
                        <div key={u.id} className="user-chip">
                            {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="user-chip-avatar" />
                            ) : (
                                <div className="user-chip-avatar user-chip-avatar-placeholder">
                                    {getInitials(u.name ?? u.email)}
                                </div>
                            )}
                            <div className="user-chip-info">
                                <div className="user-chip-name">{u.name ?? u.email}</div>
                            </div>
                            <button
                                className="user-chip-remove"
                                onClick={() => handleRemove(u.id)}
                                type="button"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <input
                className="task-detail-input"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Добавить пользователя..."
            />

            {open && query.trim().length > 0 && (
                <div className="user-picker-dropdown">
                    {loading ? (
                        <div className="user-picker-loading">Поиск...</div>
                    ) : results.length === 0 ? (
                        <div className="user-picker-empty">Никого не найдено</div>
                    ) : (
                        results.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                className="user-picker-item"
                                onClick={() => handleAdd(u)}
                            >
                                {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt="" className="user-chip-avatar" />
                                ) : (
                                    <div className="user-chip-avatar user-chip-avatar-placeholder">
                                        {getInitials(u.name ?? u.email)}
                                    </div>
                                )}
                                <div className="user-picker-item-info">
                                    <div className="user-picker-item-name">
                                        {u.name ?? u.email}
                                    </div>
                                    {u.name && (
                                        <div className="user-picker-item-email">{u.email}</div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getInitials(str: string): string {
    const parts = str.split(/[\s@.]+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}