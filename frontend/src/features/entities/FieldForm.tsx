//frontend\src\features\entities\FieldForm.tsx
import { useState } from 'react';
import { Plus, Hash, Type as TypeIcon, Calendar, ToggleLeft, List, User as UserIcon } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { FieldType } from '../../types/api';
import type { LucideIcon as LucideIconType } from 'lucide-react';

interface FieldFormProps {
    onSubmit: (data: {
        name: string;
        label: string;
        type: FieldType;
        options?: Record<string, unknown>;
        isRequired?: boolean;
    }) => Promise<void>;
    loading?: boolean;
}

const TYPES: {
    value: FieldType;
    label: string;
    icon: LucideIconType;
}[] = [
        { value: 'text', label: 'Текст', icon: TypeIcon },
        { value: 'number', label: 'Число', icon: Hash },
        { value: 'date', label: 'Дата', icon: Calendar },
        { value: 'boolean', label: 'Да/Нет', icon: ToggleLeft },
        { value: 'select', label: 'Список', icon: List },
        { value: 'user', label: 'Пользователь', icon: UserIcon },
    ];

export default function FieldForm({ onSubmit, loading }: FieldFormProps) {
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [type, setType] = useState<FieldType>('text');
    const [isRequired, setIsRequired] = useState(false);
    const [choices, setChoices] = useState('');

    const handleSubmit = async () => {
        if (!name.trim() || !label.trim()) return;

        const options: Record<string, unknown> = {};
        if (type === 'select' && choices.trim()) {
            options.choices = choices
                .split(',')
                .map((c) => c.trim())
                .filter((c) => c.length > 0);
        }

        await onSubmit({
            name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            label: label.trim(),
            type,
            options: Object.keys(options).length > 0 ? options : undefined,
            isRequired,
        });

        setName('');
        setLabel('');
        setType('text');
        setIsRequired(false);
        setChoices('');
    };

    return (
        <div
            style={{
                background: 'var(--bg-surface)',
                padding: 24,
                borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                height: 'fit-content',
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
                Новое поле
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
                    Тип поля
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TYPES.map((t) => {
                        const Icon = t.icon;
                        const isActive = type === t.value;

                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
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
                label="Название (латиница, snake_case)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="email"
            />

            <Input
                label="Отображаемое имя"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Email"
            />

            {type === 'select' && (
                <Input
                    label="Варианты (через запятую)"
                    value={choices}
                    onChange={(e) => setChoices(e.target.value)}
                    placeholder="new, in_progress, done"
                />
            )}

            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Обязательное поле
            </label>

            <Button onClick={handleSubmit} loading={loading}>
                <Plus size={16} />
                Создать поле
            </Button>
        </div>
    );
}