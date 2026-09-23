//frontend\src\features\entities\FieldsManager.tsx
import { useEffect, useState } from 'react';
import {
    Hash,
    Type as TypeIcon,
    Calendar,
    ToggleLeft,
    List,
    User as UserIcon,
    Tag,
    ListChecks,
    Users,
    Trash2,
    Asterisk,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Field, FieldType } from '../../types/api';
import FieldForm from './FieldForm';
import './FieldsManager.css';

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
    tags: Tag,
    checklist: ListChecks,
    'user-list': Users,
};

const TYPE_LABELS: Record<FieldType, string> = {
    text: 'Текст',
    number: 'Число',
    date: 'Дата',
    boolean: 'Да/Нет',
    select: 'Список',
    user: 'Пользователь',
    tags: 'Теги',
    checklist: 'Чек-лист',
    'user-list': 'Список пользователей',
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
        if (
            !confirm(
                'Удалить поле? Данные в записях по этому полю останутся, но перестанут отображаться.',
            )
        )
            return;

        try {
            await api.deleteField(id);
            await loadFields();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    return (
        <div className="fields-manager">
            {error && <div className="fields-manager-error">{error}</div>}

            <div className="fields-manager-grid">
                <FieldForm onSubmit={handleCreate} loading={loading} />

                <div className="fields-manager-list-card">
                    <h3 className="fields-manager-list-title">
                        Поля ({fields.length})
                    </h3>

                    {fields.length === 0 ? (
                        <p className="fields-manager-empty">
                            Пока нет полей. Создай первое слева.
                        </p>
                    ) : (
                        <div className="fields-manager-list">
                            {fields.map((f) => {
                                const Icon = TYPE_ICONS[f.type] ?? TypeIcon;

                                return (
                                    <div key={f.id} className="fields-manager-item">
                                        <div className="fields-manager-item-content">
                                            <div className="fields-manager-item-header">
                                                <Icon size={16} />
                                                <span className="fields-manager-item-label">
                                                    {f.label}
                                                </span>
                                                {f.isRequired && (
                                                    <Asterisk
                                                        size={12}
                                                        className="fields-manager-item-required"
                                                    />
                                                )}
                                                <span className="fields-manager-item-name">
                                                    {f.name}
                                                </span>
                                            </div>
                                            <div className="fields-manager-item-type">
                                                Тип: {TYPE_LABELS[f.type] ?? f.type}
                                            </div>
                                        </div>

                                        <button
                                            className="fields-manager-item-delete"
                                            onClick={() => handleDelete(f.id)}
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