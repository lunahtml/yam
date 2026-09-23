//frontend\src\features\entities\TaskQuickForm.tsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Field } from '../../types/api';
import './TaskQuickForm.css';

interface TaskQuickFormProps {
    fields: Field[];
    initialStatus?: { field: string; value: string };
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    onCancel: () => void;
}

export default function TaskQuickForm({
    fields,
    initialStatus,
    onSubmit,
    onCancel,
}: TaskQuickFormProps) {
    const titleField =
        fields.find((f) => f.name === 'title') ?? fields[0];

    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !titleField) return;
        setLoading(true);

        const data: Record<string, unknown> = {
            [titleField.name]: title.trim(),
        };

        if (initialStatus) {
            data[initialStatus.field] = initialStatus.value;
        }

        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="task-quick-overlay" onClick={onCancel}>
            <div className="task-quick" onClick={(e) => e.stopPropagation()}>
                <button className="task-quick-close" onClick={onCancel}>
                    <X size={16} />
                </button>

                <h3 className="task-quick-title">Новая карточка</h3>

                <input
                    className="task-quick-input"
                    placeholder="Что нужно сделать?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit();
                        if (e.key === 'Escape') onCancel();
                    }}
                    autoFocus
                />

                <div className="task-quick-actions">
                    <button
                        className="task-quick-btn task-quick-btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !title.trim()}
                    >
                        <Plus size={14} />
                        {loading ? 'Создаём...' : 'Создать'}
                    </button>
                    <button
                        className="task-quick-btn task-quick-btn-secondary"
                        onClick={onCancel}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}