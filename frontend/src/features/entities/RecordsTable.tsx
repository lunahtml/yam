//frontend\src\features\entities\RecordsTable.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../api/client';
import { EntityRecord, Field } from '../../types/api';
import RecordForm from './RecordForm';
import Button from '../../components/Button';

interface RecordsTableProps {
    entityId: string;
    fields: Field[];
}

export default function RecordsTable({ entityId, fields }: RecordsTableProps) {
    const [records, setRecords] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EntityRecord | null>(null);
    const [sortBy, setSortBy] = useState<string | undefined>();
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const loadRecords = async () => {
        try {
            const res = await api.getRecords(entityId, {
                page: 1,
                limit: 100,
                sortBy,
                sortDir,
            });
            setRecords(res.records);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load records');
        }
    };

    useEffect(() => {
        loadRecords();
    }, [entityId, sortBy, sortDir]);

    const handleCreate = async (data: Record<string, unknown>) => {
        setLoading(true);
        setError('');

        try {
            await api.createRecord(entityId, data);
            setShowForm(false);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: Record<string, unknown>) => {
        if (!editingRecord) return;
        setLoading(true);
        setError('');

        try {
            await api.updateRecord(editingRecord.id, data);
            setEditingRecord(null);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить запись?')) return;

        try {
            await api.deleteRecord(id);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleSort = (fieldName: string) => {
        if (sortBy === fieldName) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(fieldName);
            setSortDir('asc');
        }
    };

    const formatValue = (value: unknown, fieldType: string): string => {
        if (value === null || value === undefined) return '—';

        if (fieldType === 'boolean') return value ? 'Да' : 'Нет';
        if (fieldType === 'date') {
            try {
                return new Date(String(value)).toLocaleDateString('ru-RU');
            } catch {
                return String(value);
            }
        }
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value);

        return String(value);
    };

    return (
        <div>
            {error && (
                <div
                    style={{
                        color: 'var(--error)',
                        marginBottom: 16,
                        fontSize: 13,
                        padding: 12,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Кнопка создания */}
            {!showForm && !editingRecord && fields.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Button
                        onClick={() => setShowForm(true)}
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        <Plus size={16} />
                        Создать запись
                    </Button>
                </div>
            )}

            {/* Форма создания */}
            {showForm && (
                <div style={{ marginBottom: 24 }}>
                    <RecordForm
                        fields={fields}
                        onSubmit={handleCreate}
                        onCancel={() => setShowForm(false)}
                        loading={loading}
                        submitLabel="Создать"
                    />
                </div>
            )}

            {/* Форма редактирования */}
            {editingRecord && (
                <div style={{ marginBottom: 24 }}>
                    <RecordForm
                        fields={fields}
                        initialData={editingRecord.data}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingRecord(null)}
                        loading={loading}
                        submitLabel="Сохранить"
                    />
                </div>
            )}

            {/* Таблица */}
            {records.length === 0 ? (
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        padding: 40,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                    }}
                >
                    {fields.length === 0
                        ? 'Сначала создай поля для сущности'
                        : 'Пока нет записей. Создай первую.'}
                </div>
            ) : (
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                minWidth: 600,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: 'var(--bg-elevated)',
                                        borderBottom: '1px solid var(--border)',
                                    }}
                                >
                                    {fields.map((f) => (
                                        <th
                                            key={f.id}
                                            onClick={() => handleSort(f.name)}
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                {f.label}
                                                {sortBy === f.name &&
                                                    (sortDir === 'asc' ? (
                                                        <ArrowUp size={12} />
                                                    ) : (
                                                        <ArrowDown size={12} />
                                                    ))}
                                            </div>
                                        </th>
                                    ))}
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'right',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            width: 100,
                                        }}
                                    >
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-elevated)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {fields.map((f) => (
                                            <td
                                                key={f.id}
                                                style={{
                                                    padding: '12px 16px',
                                                    fontSize: 13,
                                                    color: 'var(--text-primary)',
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {formatValue(r.data[f.name], f.type)}
                                            </td>
                                        ))}
                                        <td
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'right',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <button
                                                onClick={() => {
                                                    setEditingRecord(r);
                                                    setShowForm(false);
                                                }}
                                                style={iconButtonStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(34, 211, 238, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                style={iconButtonStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(239, 68, 68, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const iconButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 4,
    transition: 'all 0.15s',
};