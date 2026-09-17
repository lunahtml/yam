//frontend/src/pages/dashboard/entities/FieldsManager.tsx
import { useEffect, useState } from 'react';
import { Hash, Type as TypeIcon, Calendar, ToggleLeft, List, User as UserIcon, Trash2, Asterisk } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../../api/client';
import { Field, FieldType } from '../../../types/api';
import FieldForm from './FieldForm';

interface FieldsManagerProps {
    entityId: string;
    onFieldsChange?: (fields: Field[]) => void;
}

const TYPE_ICONS: Record<FieldType, LucideIcon> = {
    text: TypeIcon,
    number: Hash,
    date: Calendar,
    boolean: ToggleLeft,
    select: List,
    user: UserIcon,
};

const TYPE_LABELS: Record<FieldType, string> = {
    text: 'Текст',
    number: 'Число',
    date: 'Дата',
    boolean: 'Да/Нет',
    select: 'Список',
    user: 'Пользователь',
};

export default function FieldsManager({
    entityId,
    onFieldsChange,
}: FieldsManagerProps) {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadFields = async () => {
        try {
            const data = await api.getFields(entityId);
            setFields(data);
            onFieldsChange?.(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load fields');
        }
    };

    useEffect(() => {
        loadFields();
    }, [entityId]);

    const handleCreate = async (data: {
        name: string;
        label: string;
        type: FieldType;
        options?: Record<string, unknown>;
        isRequired?: boolean;
    }) => {
        setLoading(true);
        setError('');

        try {
            await api.createField(entityId, data);
            await loadFields();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create field');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить поле? Данные в записях по этому полю останутся, но перестанут отображаться.')) return;

        try {
            await api.deleteField(id);
            await loadFields();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <FieldForm onSubmit={handleCreate} loading={loading} />

                <div
                    style={{
                        background: 'var(--bg-surface)',
                        padding: 24,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 16,
                            color: 'var(--text-primary)',
                        }}
                    >
                        Поля ({fields.length})
                    </h3>

                    {fields.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>
                            Пока нет полей. Создай первое слева.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {fields.map((f) => {
                                const Icon = TYPE_ICONS[f.type];

                                return (
                                    <div
                                        key={f.id}
                                        style={{
                                            padding: 14,
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 10,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <Icon size={16} />
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {f.label}
                                                </span>
                                                {f.isRequired && (
                                                    <Asterisk
                                                        size={12}
                                                        style={{ color: 'var(--error)' }}
                                                    />
                                                )}
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--text-muted)',
                                                        background: 'var(--bg-hover)',
                                                        padding: '2px 8px',
                                                        borderRadius: 10,
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    {f.name}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                Тип: {TYPE_LABELS[f.type]}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(f.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--error)',
                                                cursor: 'pointer',
                                                padding: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderRadius: 6,
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background =
                                                    'rgba(239, 68, 68, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}