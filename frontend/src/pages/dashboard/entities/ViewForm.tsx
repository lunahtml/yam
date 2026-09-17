//frontend/src/pages/dashboard/entities/ViewForm.tsx
import { useState } from 'react';
import { Plus, Columns, Table2, Calendar, List } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { Field, ViewType } from '../../../types/api';

interface ViewFormProps {
    fields: Field[];
    onSubmit: (data: {
        name: string;
        type: ViewType;
        config?: Record<string, unknown>;
    }) => Promise<void>;
    loading?: boolean;
}

const TYPES: { value: ViewType; label: string; icon: LucideIcon }[] = [
    { value: 'KANBAN', label: 'Канбан', icon: Columns },
    { value: 'TABLE', label: 'Таблица', icon: Table2 },
    { value: 'CALENDAR', label: 'Календарь', icon: Calendar },
    { value: 'LIST', label: 'Список', icon: List },
];

export default function ViewForm({ fields, onSubmit, loading }: ViewFormProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<ViewType>('KANBAN');
    const [groupBy, setGroupBy] = useState<string>('');

    // Поля, подходящие для группировки
    const groupableFields = fields.filter(
        (f) => f.type === 'select' || f.type === 'boolean',
    );

    const handleSubmit = async () => {
        if (!name.trim()) return;

        const config: Record<string, unknown> = {};

        if (type === 'KANBAN' && groupBy) {
            config.groupBy = groupBy;
        }

        if (type === 'CALENDAR' && groupBy) {
            config.dateField = groupBy;
        }

        await onSubmit({
            name: name.trim(),
            type,
            config,
        });

        setName('');
        setType('KANBAN');
        setGroupBy('');
    };

    // Автоматически выбрать первое подходящее поле при переключении на KANBAN
    const handleTypeChange = (newType: ViewType) => {
        setType(newType);
        if (newType === 'KANBAN' || newType === 'CALENDAR') {
            const first = groupableFields[0];
            if (first) setGroupBy(first.name);
        }
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
                Новое представление
            </h3>

            {/* Тип */}
            <div style={{ marginBottom: 16 }}>
                <label
                    style={{
                        display: 'block',
                        marginBottom: 8,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                    }}
                >
                    Тип
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TYPES.map((t) => {
                        const Icon = t.icon;
                        const isActive = type === t.value;

                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => handleTypeChange(t.value)}
                                style={{
                                    padding: '7px 12px',
                                    fontSize: 12,
                                    border: '1px solid',
                                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                                    background: isActive
                                        ? 'rgba(168, 85, 247, 0.15)'
                                        : 'var(--bg-elevated)',
                                    color: isActive
                                        ? 'var(--accent-bright)'
                                        : 'var(--text-secondary)',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.15s',
                                    fontWeight: isActive ? 600 : 500,
                                }}
                            >
                                <Icon size={14} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Input
                label="Название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Моя доска"
            />

            {/* Выбор поля группировки для KANBAN */}
            {type === 'KANBAN' && (
                <div style={{ marginBottom: 16 }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 6,
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                        }}
                    >
                        Поле для колонок
                    </label>
                    {groupableFields.length === 0 ? (
                        <div
                            style={{
                                padding: 10,
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: '#f59e0b',
                            }}
                        >
                            Нет полей типа «Список» или «Да/Нет». Создай поле типа «Список»
                            (например, «Статус») с вариантами.
                        </div>
                    ) : (
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: 14,
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">— Выбери поле —</option>
                            {groupableFields.map((f) => (
                                <option key={f.id} value={f.name}>
                                    {f.label} ({f.type === 'select' ? 'список' : 'да/нет'})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={type === 'KANBAN' && groupableFields.length === 0}
            >
                <Plus size={16} />
                Создать
            </Button>
        </div>
    );
}