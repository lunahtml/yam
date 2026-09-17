//frontend/src/pages/dashboard/entities/RecordForm.tsx
import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
// import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { Field } from '../../../types/api';

interface RecordFormProps {
    fields: Field[];
    initialData?: Record<string, unknown>;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    submitLabel?: string;
}

export default function RecordForm({
    fields,
    initialData = {},
    onSubmit,
    onCancel,
    loading,
    submitLabel = 'Создать',
}: RecordFormProps) {
    const [data, setData] = useState<Record<string, unknown>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const update = (fieldName: string, value: unknown) => {
        setData({ ...data, [fieldName]: value });
        if (errors[fieldName]) {
            const next = { ...errors };
            delete next[fieldName];
            setErrors(next);
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        for (const field of fields) {
            const value = data[field.name];
            if (
                field.isRequired &&
                (value === null || value === undefined || value === '')
            ) {
                newErrors[field.name] = 'Обязательное поле';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await onSubmit(data);
    };

    return (
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <Plus size={18} />
                {submitLabel} запись
            </h3>

            {fields.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                    Сначала создай поля для сущности.
                </p>
            ) : (
                <>
                    {fields.map((field) => (
                        <div key={field.id} style={{ marginBottom: 16 }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 6,
                                    fontSize: 13,
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                }}
                            >
                                {field.label}
                                {field.isRequired && (
                                    <span style={{ color: 'var(--error)', marginLeft: 4 }}>
                                        *
                                    </span>
                                )}
                            </label>

                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    value={(data[field.name] as string) ?? ''}
                                    onChange={(e) => update(field.name, e.target.value)}
                                    style={inputStyle}
                                />
                            )}

                            {field.type === 'number' && (
                                <input
                                    type="number"
                                    value={(data[field.name] as number) ?? ''}
                                    onChange={(e) =>
                                        update(
                                            field.name,
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                    style={inputStyle}
                                />
                            )}

                            {field.type === 'date' && (
                                <input
                                    type="date"
                                    value={(data[field.name] as string) ?? ''}
                                    onChange={(e) => update(field.name, e.target.value)}
                                    style={inputStyle}
                                />
                            )}

                            {field.type === 'boolean' && (
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        fontSize: 13,
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(data[field.name])}
                                        onChange={(e) => update(field.name, e.target.checked)}
                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                    />
                                    Да
                                </label>
                            )}

                            {field.type === 'select' && (
                                <select
                                    value={(data[field.name] as string) ?? ''}
                                    onChange={(e) => update(field.name, e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">— Выбери —</option>
                                    {((field.options?.choices as string[]) ?? []).map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {field.type === 'user' && (
                                <input
                                    type="text"
                                    value={(data[field.name] as string) ?? ''}
                                    onChange={(e) => update(field.name, e.target.value)}
                                    placeholder="ID пользователя"
                                    style={inputStyle}
                                />
                            )}

                            {errors[field.name] && (
                                <div
                                    style={{
                                        color: 'var(--error)',
                                        fontSize: 12,
                                        marginTop: 4,
                                    }}
                                >
                                    {errors[field.name]}
                                </div>
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <Button onClick={handleSubmit} loading={loading}>
                            <Save size={16} />
                            {submitLabel}
                        </Button>

                        {onCancel && (
                            <Button onClick={onCancel} variant="secondary">
                                <X size={16} />
                                Отмена
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    transition: 'all 0.15s',
};