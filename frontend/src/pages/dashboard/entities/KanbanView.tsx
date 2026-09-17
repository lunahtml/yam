//frontend/src/pages/dashboard/entities/KanbanView.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../../api/client';
import { EntityRecord, Field } from '../../../types/api';

interface KanbanViewProps {
    entityId: string;
    fields: Field[];
    config: Record<string, unknown>;
}

interface KanbanColumn {
    key: string;
    label: string;
}

export default function KanbanView({
    entityId,
    fields,
    config,
}: KanbanViewProps) {
    const [records, setRecords] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Поле для группировки (статус)
    const groupField = config.groupBy as string | undefined;

    const loadRecords = async () => {
        setLoading(true);
        try {
            const res = await api.getRecords(entityId, { page: 1, limit: 500 });
            setRecords(res.records);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [entityId]);

    // Определяем колонки
    const groupFieldDef = groupField
        ? fields.find((f) => f.name === groupField)
        : undefined;

    const columns: KanbanColumn[] = (() => {
        if (!groupFieldDef) {
            return [{ key: 'all', label: 'Все записи' }];
        }

        if (
            groupFieldDef.type === 'select' &&
            groupFieldDef.options &&
            typeof groupFieldDef.options === 'object' &&
            'choices' in groupFieldDef.options
        ) {
            const choices = (groupFieldDef.options as { choices: string[] }).choices;
            return choices.map((c) => ({ key: c, label: c }));
        }

        if (groupFieldDef.type === 'boolean') {
            return [
                { key: 'true', label: 'Да' },
                { key: 'false', label: 'Нет' },
            ];
        }

        return [{ key: 'all', label: 'Все записи' }];
    })();

    const getRecordColumn = (record: EntityRecord): string => {
        if (!groupFieldDef) return 'all';
        const value = record.data[groupFieldDef.name];
        if (value === null || value === undefined) return '';
        return String(value);
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

    const formatCardValue = (record: EntityRecord, field: Field): string => {
        const value = record.data[field.name];
        if (value === null || value === undefined) return '—';
        if (field.type === 'boolean') return value ? 'Да' : 'Нет';
        if (field.type === 'date') {
            try {
                return new Date(String(value)).toLocaleDateString('ru-RU');
            } catch {
                return String(value);
            }
        }
        return String(value).slice(0, 100);
    };

    // Первые 3 поля (кроме группировочного) — для отображения на карточке
    const cardFields = fields
        .filter((f) => f.name !== groupField)
        .slice(0, 3);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Загрузка...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: 20,
                    color: 'var(--error)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                }}
            >
                {error}
            </div>
        );
    }

    if (!groupFieldDef) {
        return (
            <div
                style={{
                    padding: 40,
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text-muted)',
                }}
            >
                <p style={{ marginBottom: 8 }}>
                    Для канбана нужно указать поле для группировки.
                </p>
                <p style={{ fontSize: 12 }}>
                    Создай поле типа «Список» (например, «Статус») и настрой view.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                paddingBottom: 16,
                minHeight: 400,
            }}
        >
            {columns.map((col) => {
                const columnRecords = records.filter(
                    (r) => getRecordColumn(r) === col.key,
                );

                return (
                    <div
                        key={col.key}
                        style={{
                            minWidth: 280,
                            maxWidth: 280,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {/* Заголовок колонки */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 4px',
                                marginBottom: 4,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {col.label}
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-elevated)',
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                }}
                            >
                                {columnRecords.length}
                            </span>
                        </div>

                        {/* Карточки */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                flex: 1,
                            }}
                        >
                            {columnRecords.length === 0 ? (
                                <div
                                    style={{
                                        padding: 20,
                                        textAlign: 'center',
                                        color: 'var(--text-dim)',
                                        fontSize: 12,
                                        border: '1px dashed var(--border)',
                                        borderRadius: 8,
                                    }}
                                >
                                    Пусто
                                </div>
                            ) : (
                                columnRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 10,
                                            padding: 12,
                                            cursor: 'grab',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: 8,
                                                gap: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    flex: 1,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {formatCardValue(
                                                    record,
                                                    fields[0] || {
                                                        name: 'id',
                                                        label: 'ID',
                                                        type: 'text',
                                                    } as Field,
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-dim)',
                                                    cursor: 'pointer',
                                                    padding: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderRadius: 4,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = 'var(--error)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-dim)';
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        {cardFields.slice(1).map((f) => (
                                            <div
                                                key={f.id}
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--text-muted)',
                                                    marginTop: 4,
                                                }}
                                            >
                                                <span style={{ color: 'var(--text-dim)' }}>
                                                    {f.label}:
                                                </span>{' '}
                                                {formatCardValue(record, f)}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}